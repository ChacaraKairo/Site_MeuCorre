create or replace view vw_vehicle_suggestions_summary as
select
  id,
  created_at,
  status,
  tipo,
  marca,
  modelo,
  motor,
  ano,
  consumo_medio,
  contribuidor_nome,
  contribuidor_email,
  lgpd_consent
from community_vehicle_suggestions;

create or replace view vw_vehicle_defaults_review as
select
  tipo,
  marca,
  modelo,
  motor,
  count(*) as sugestoes,
  round(avg(consumo_medio), 2) as consumo_medio_sugerido,
  round(avg(valor_oleo_filtros), 2) as valor_oleo_filtros_medio,
  round(avg(intervalo_oleo_filtros_km), 0) as intervalo_oleo_filtros_km_medio,
  round(avg(valor_jogo_pneus), 2) as valor_jogo_pneus_medio,
  round(avg(durabilidade_pneus_km), 0) as durabilidade_pneus_km_media
from community_vehicle_suggestions
where status in ('novo', 'revisado', 'aprovado')
group by tipo, marca, modelo, motor;

create or replace view vw_complaints_summary as
select
  id,
  created_at,
  status,
  category,
  name,
  email,
  app_version,
  device
from complaints;
