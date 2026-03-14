import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Copy, ExternalLink, Check } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ContentAction {
  caption: string;
  hashtags: string[];
  platform: string;
}

interface AssistantChatProps {
  userRole?: string | null;
  companyName?: string | null;
  activeSection?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const QUICK_QUESTIONS = [
  'Instagram için motivasyon içeriği yaz',
  'Nasıl yeni içerik oluştururum?',
  'AI Influencer nedir?',
  'Postiz entegrasyonu nasıl çalışır?',
];

// Parse [CONTENT_ACTION]...[/CONTENT_ACTION] blocks from assistant message
function parseContentAction(text: string): { displayText: string; action: ContentAction | null } {
  const match = text.match(/\[CONTENT_ACTION\]\s*([\s\S]*?)\s*\[\/CONTENT_ACTION\]/);
  if (!match) return { displayText: text, action: null };

  const displayText = text.replace(/\[CONTENT_ACTION\][\s\S]*?\[\/CONTENT_ACTION\]/g, '').trim();
  try {
    const action = JSON.parse(match[1].trim()) as ContentAction;
    return { displayText, action };
  } catch {
    return { displayText: text, action: null };
  }
}

const ContentActionCard: React.FC<{ action: ContentAction }> = ({ action }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const full = `${action.caption}\n\n${action.hashtags.join(' ')}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenModal = () => {
    sessionStorage.setItem('prefill_content', JSON.stringify({
      prompt: action.caption,
      caption: action.caption,
      hashtags: action.hashtags.join(' '),
      platform: action.platform === 'all' ? undefined : action.platform,
    }));
    window.dispatchEvent(new CustomEvent('assistant-open-post'));
  };

  const platformColors: Record<string, string> = {
    instagram: '#e1306c',
    twitter: '#1da1f2',
    linkedin: '#0077b5',
    tiktok: '#ff0050',
    all: '#ccff00',
  };
  const color = platformColors[action.platform] || '#ccff00';

  return (
    <div
      style={{
        marginTop: '8px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}33`,
        borderRadius: '10px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color,
            letterSpacing: '0.05em',
          }}
        >
          {action.platform === 'all' ? 'Tüm Platformlar' : action.platform}
        </span>
        <span style={{ fontSize: '0.68rem', color: '#718096' }}>için içerik hazır</span>
      </div>

      <p
        style={{
          fontSize: '0.8rem',
          color: '#e2e8f0',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
        }}
      >
        {action.caption}
      </p>

      {action.hashtags.length > 0 && (
        <p style={{ fontSize: '0.73rem', color: '#00ffcc', margin: 0, lineHeight: '1.6' }}>
          {action.hashtags.join(' ')}
        </p>
      )}

      <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
        <button
          onClick={handleOpenModal}
          style={{
            flex: 1,
            padding: '6px 10px',
            background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
            border: `1px solid ${color}55`,
            borderRadius: '6px',
            color,
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <ExternalLink size={12} />
          Modalda Aç
        </button>
        <button
          onClick={handleCopy}
          style={{
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: copied ? '#ccff00' : '#a0aec0',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>
    </div>
  );
};

const AssistantChat: React.FC<AssistantChatProps> = ({ userRole, companyName, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMessage]);

    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: newMessages,
          context: {
            role: userRole,
            company: companyName,
            section: activeSection,
          },
        }),
      });

      if (!response.ok) throw new Error('Yanıt alınamadı.');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream alınamadı.');

      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              accumulated += data.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: accumulated };
                return updated;
              });
            }
            if (data.done || data.error) break;
          } catch {
            // ignore
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Merhaba${companyName ? ` ${companyName}` : ''}! Ben N99 SocialHub asistanıyım. Size nasıl yardımcı olabilirim?\n\nİçerik oluşturmamı, platform bilgisi vermemi veya dashboard'u kullanmanıza yardımcı olmamı isteyebilirsiniz.`,
      }]);
    }
  };

  const handleClose = () => {
    if (isStreaming && abortRef.current) abortRef.current.abort();
    setIsOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
      }}
    >
      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            width: '370px',
            maxHeight: isMinimized ? '52px' : '540px',
            background: 'rgba(12, 14, 20, 0.97)',
            border: '1px solid rgba(204, 255, 0, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(204,255,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: isMinimized ? 'none' : '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
              cursor: 'pointer',
            }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ccff00 0%, #00ffff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={18} color="#05060a" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>N99 Asistan</div>
              <div style={{ color: isStreaming ? '#ccff00' : '#00ffcc', fontSize: '0.7rem' }}>
                {isStreaming ? 'Yazıyor...' : 'Çevrimiçi'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096', padding: '4px', borderRadius: '4px' }}
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096', padding: '4px', borderRadius: '4px' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minHeight: 0,
                }}
              >
                {messages.map((msg, i) => {
                  const isLast = i === messages.length - 1;
                  const { displayText, action } = msg.role === 'assistant'
                    ? parseContentAction(msg.content)
                    : { displayText: msg.content, action: null };

                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '86%' }}>
                        <div
                          style={{
                            padding: '8px 12px',
                            borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                            background: msg.role === 'user'
                              ? 'linear-gradient(135deg, rgba(204,255,0,0.2) 0%, rgba(0,255,255,0.15) 100%)'
                              : 'rgba(255,255,255,0.05)',
                            border: msg.role === 'user'
                              ? '1px solid rgba(204,255,0,0.25)'
                              : '1px solid rgba(255,255,255,0.07)',
                            color: '#e2e8f0',
                            fontSize: '0.835rem',
                            lineHeight: '1.55',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {displayText}
                          {msg.role === 'assistant' && isStreaming && isLast && msg.content === '' && (
                            <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', height: '14px' }}>
                              {[0, 1, 2].map((dot) => (
                                <span
                                  key={dot}
                                  style={{
                                    width: '5px', height: '5px', borderRadius: '50%',
                                    background: '#ccff00', opacity: 0.7,
                                    animation: `assistantPulse 1s ease-in-out ${dot * 0.2}s infinite`,
                                  }}
                                />
                              ))}
                            </span>
                          )}
                        </div>
                        {action && (!isStreaming || !isLast) && (
                          <ContentActionCard action={action} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Quick questions at start */}
                {messages.length === 1 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '20px',
                          color: '#a0aec0',
                          fontSize: '0.73rem',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.borderColor = 'rgba(204,255,0,0.4)';
                          (e.target as HTMLButtonElement).style.color = '#ccff00';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                          (e.target as HTMLButtonElement).style.color = '#a0aec0';
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: '10px 12px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sorun veya içerik isteyin..."
                  disabled={isStreaming}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#e2e8f0',
                    fontSize: '0.835rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(204,255,0,0.4)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: input.trim() && !isStreaming
                      ? 'linear-gradient(135deg, #ccff00 0%, #00ffff 100%)'
                      : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={15} color={input.trim() && !isStreaming ? '#05060a' : '#718096'} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isOpen
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, #ccff00 0%, #00ffff 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOpen
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(204,255,0,0.35)',
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }}
        title="N99 Asistan"
      >
        {isOpen
          ? <X size={22} color="#a0aec0" />
          : <MessageCircle size={22} color="#05060a" />
        }
      </button>

      <style>{`
        @keyframes assistantPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default AssistantChat;
