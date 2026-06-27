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
- `reclamacoes.html`: canal para usuários enviarem reclamacoes do app.
- `api/reclamacao.js`: função serverless compatível com Vercel.
- `netlify/functions/reclamacao.js`: função serverless compatível com Netlify.
- `database/`: ambiente Postgres via Docker e arquivos SQL editáveis.
- `lib/form-storage.js`: camada de gravação dos formularios no Postgres.
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

O site principal é estático. Nesta branch, os formularios podem salvar no
Postgres quando a hospedagem também executa uma API/serverless function com
`DATABASE_URL` configurada. Telegram continua opcional como notificação.

Variaveis necessárias no ambiente do servidor:

```env
DATABASE_URL=postgres://korre:troque_esta_senha@localhost:5432/korre
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Se o provedor Postgres exigir SSL:

```env
PGSSLMODE=require
```

## Banco local com Docker

```bash
cd database
cp .env.example .env
docker compose up -d
```

Os scripts SQL ficam em `database/sql/`:

- `001_extensions.sql`: extensoes.
- `010_schema.sql`: tabelas, constraints e triggers.
- `020_indexes.sql`: indices.
- `030_views.sql`: views para leitura/revisao.

Para recriar o banco local depois de editar SQL:

```bash
cd database
docker compose down -v
docker compose up -d
```

Para testar localmente com a API funcionando:

```bash
npm install
node dev-server.js
```

Depois acesse `http://localhost:3000/reclamacoes.html`.
