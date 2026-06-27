do $$
begin
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum ('novo', 'revisado', 'aprovado', 'rejeitado');
  end if;
end
$$;

create table if not exists community_vehicle_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status submission_status not null default 'novo',

  tipo text not null,
  marca text not null,
  modelo text not null,
  motor text,
  ano integer,
  consumo_medio numeric(10, 2) not null,

  valor_oleo_filtros numeric(12, 2),
  intervalo_oleo_filtros_km integer,
  valor_jogo_pneus numeric(12, 2),
  durabilidade_pneus_km integer,
  valor_manutencao_freios numeric(12, 2),
  intervalo_freios_km integer,
  valor_kit_transmissao numeric(12, 2),
  durabilidade_transmissao_km integer,

  parametros_financeiros jsonb not null default '{}'::jsonb,
  observacoes text not null,
  contribuidor_nome text,
  contribuidor_email text,
  lgpd_consent boolean not null default false,

  source_page text,
  user_agent text,
  ip_address text,
  raw_payload jsonb not null default '{}'::jsonb,

  constraint community_vehicle_suggestions_tipo_check
    check (tipo in ('moto', 'carro', 'bicicleta', 'van', 'carro_eletrico')),
  constraint community_vehicle_suggestions_consumo_check
    check (consumo_medio > 0),
  constraint community_vehicle_suggestions_observacoes_check
    check (length(trim(observacoes)) >= 10)
);

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status submission_status not null default 'novo',

  category text,
  name text,
  email text,
  app_version text,
  device text,
  message text not null,

  source_page text,
  user_agent text,
  ip_address text,
  raw_payload jsonb not null default '{}'::jsonb,

  constraint complaints_message_check
    check (length(trim(message)) >= 10)
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_community_vehicle_suggestions_updated_at on community_vehicle_suggestions;
create trigger set_community_vehicle_suggestions_updated_at
before update on community_vehicle_suggestions
for each row execute function set_updated_at();

drop trigger if exists set_complaints_updated_at on complaints;
create trigger set_complaints_updated_at
before update on complaints
for each row execute function set_updated_at();
