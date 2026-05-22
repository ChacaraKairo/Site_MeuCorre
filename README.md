# KORRE

Site oficial do KORRE, aplicativo mobile para motoristas, entregadores e
profissionais autônomos controlarem ganhos, custos, manutenção e viabilidade de
corridas.

## Objetivo

O KORRE ajuda o usuário a entender se uma corrida vale a pena, acompanhar seus
ganhos reais, registrar despesas e cuidar da manutenção do veículo com uma
experiência simples, direta e profissional.

## Páginas

- `index.html`: landing page principal do produto.
- `privacidade.html`: política de privacidade pública.
- `reclamacoes.html`: canal para usuarios enviarem reclamacoes do app.
- `api/reclamacao.js`: funcao serverless compatível com Vercel.
- `netlify/functions/reclamacao.js`: funcao serverless compatível com Netlify.
- `style.css`: identidade visual e componentes da página.
- `script.js`: interações leves de ano dinâmico e reveal no scroll.

## Assets

- `assets/images`: ícones, favicon e imagens de marca.
- `assets/prints`: prints reais do aplicativo usados na vitrine de telas.

## Identidade

- Marca: KORRE
- Cor primária: `#00C853`
- Fundo principal: `#0A0A0A`
- Texto principal: `#FFFFFF`
- Produto responsável: Koru Company

## Publicação

O site principal é estático. Para o envio de reclamacoes ao Telegram funcionar,
a hospedagem tambem precisa executar uma funcao serverless. Na Netlify, o
arquivo `netlify.toml` redireciona `/api/reclamacao` para a funcao em
`netlify/functions/reclamacao.js`.

Variaveis necessarias no ambiente do servidor:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Para testar localmente com a API funcionando:

```bash
node dev-server.js
```

Depois acesse `http://localhost:3000/reclamacoes.html`.
