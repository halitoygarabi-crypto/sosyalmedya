#!/bin/bash
# ============================================
# N99 SocialHub - Quick Deploy (Windows -> Hetzner)
# ============================================
# Kullanım: bash deploy/deploy.sh
# ============================================

set -e

SERVER_IP="89.167.57.49"
SSH_USER="root"
SSH_KEY="$HOME/.ssh/id_ed25519"
REMOTE_BACKEND="/root/.openclaw/workspace/backend/socialhub-server"
REMOTE_FRONTEND="/var/www/socialhub"
SSH_CMD="ssh -i $SSH_KEY $SSH_USER@$SERVER_IP"
SCP_CMD="scp -i $SSH_KEY"

echo ""
echo "🚀 N99 SocialHub Deploy → Hetzner ($SERVER_IP)"
echo "================================================="

# ---- Build ----
echo "🔨 [1/5] Backend derleniyor..."
cd server && npm run build && cd ..

echo "🔨 [2/5] Frontend derleniyor..."
npx vite build --mode production

# ---- Upload Backend ----
echo "📦 [3/5] Backend yükleniyor..."
$SCP_CMD server/dist/index.js server/dist/supabaseClient.js $SSH_USER@$SERVER_IP:$REMOTE_BACKEND/dist/
$SCP_CMD server/package.json server/package-lock.json server/.env server/ecosystem.config.json $SSH_USER@$SERVER_IP:$REMOTE_BACKEND/

# ---- Upload Frontend ----
echo "🎨 [4/5] Frontend yükleniyor..."
$SCP_CMD -r dist/* $SSH_USER@$SERVER_IP:$REMOTE_FRONTEND/

# ---- Restart ----
echo "⚡ [5/5] Servisler yeniden başlatılıyor..."
$SSH_CMD << 'ENDSSH'
cd /root/.openclaw/workspace/backend/socialhub-server
npm install --production 2>&1 | tail -1
pm2 restart socialhub-api
echo ""
echo "✅ Deploy tamamlandı!"
pm2 jlist | python3 -c "import sys,json; [print(f'  {p[\"name\"]}: {p[\"pm2_env\"][\"status\"]}') for p in json.load(sys.stdin)]" 2>/dev/null
curl -s http://localhost:3001/health
ENDSSH

echo ""
echo "🎉 Done! https://socialhub.polmarkai.pro"
echo ""
