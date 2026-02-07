-- Mevcut kullanıcı için profil ekle
-- Supabase SQL Editor'de çalıştırın

-- Önce kullanıcı ID'sini bulun (Authentication > Users sayfasından kopyalayın)
-- Aşağıdaki '67ked03-c74e-4d32-9040-61159b681115' yerine gerçek ID'yi yazın

INSERT INTO customer_profiles (id, company_name, industry, ai_prompt_prefix)
VALUES (
  '621acf03-c74e-4d32-90d0-61159b6811f5',  -- User ID (doğru)
  'polmark ai',                            -- Şirket adı
  'Teknoloji',                             -- Sektör
  'Profesyonel, samimi ve modern bir dil kullan. Emoji kullanımını artır.'
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry;

SELECT 'Profil eklendi!' AS status;
