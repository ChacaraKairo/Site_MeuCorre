# Banco de dados KORRE

Esta pasta isola a estrutura Postgres da branch com banco.

## Subir localmente

```bash
cd database
cp .env.example .env
docker compose up -d
```

Os arquivos em `database/sql/` rodam automaticamente somente na primeira
criacao do volume Docker.

## Conectar a API local

Crie um arquivo `.env` na raiz do site com:

```env
DATABASE_URL=postgres://korre:troque_esta_senha@localhost:5432/korre
```

Depois rode:

```bash
npm install
npm run dev
```

## Editar SQL

- `001_extensions.sql`: extensoes do Postgres.
- `010_schema.sql`: tabelas e tipos principais.
- `020_indexes.sql`: indices para consulta e auditoria.
- `030_views.sql`: views simples para leitura.

Se voce alterar SQL depois que o volume ja existe, recrie o banco local:

```bash
cd database
docker compose down -v
docker compose up -d
```
