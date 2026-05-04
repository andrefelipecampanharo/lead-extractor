# Lead Extractor — Sistema de Prospecção de Consórcio

## Estrutura
```
lead-extractor/
├── index.html              ← Tela de login (magic link)
├── dashboard.html          ← Ferramenta protegida
├── api/
│   ├── verificar-email.js  ← Valida se usuário está ativo
│   └── hotmart.js          ← Webhook da Hotmart
├── package.json
├── vercel.json
└── README.md
```

## Deploy na Vercel

### 1. Suba para o GitHub
- Crie repositório público no GitHub
- Faça upload de todos os arquivos

### 2. Conecte na Vercel
- vercel.com → Add New Project → importe o repositório
- Clique em Deploy

### 3. Configure as variáveis de ambiente na Vercel
Settings → Environment Variables:
```
SUPABASE_URL         = https://xbhgwgovhgydiypsehjy.supabase.co
SUPABASE_SERVICE_KEY = sua_service_role_key_aqui
```

### 4. Configure o Supabase
- Authentication → URL Configuration
- Site URL: https://seu-projeto.vercel.app
- Redirect URLs: https://seu-projeto.vercel.app/dashboard.html

### 5. Configure o Webhook na Hotmart
- Ferramentas → Webhooks → Novo Webhook
- URL: https://seu-projeto.vercel.app/api/hotmart
- Eventos: PURCHASE_APPROVED, SUBSCRIPTION_CANCELLATION, PURCHASE_REFUNDED, PURCHASE_CHARGEBACK

## Fluxo de acesso
1. Usuário compra na Hotmart
2. Webhook cria usuário no Supabase automaticamente
3. Usuário acessa o link, digita e-mail
4. Recebe magic link no e-mail e clica
5. Cai direto no dashboard protegido
6. Se cancelar, acesso bloqueado automaticamente
