create index if not exists idx_vehicle_suggestions_created_at
  on community_vehicle_suggestions (created_at desc);

create index if not exists idx_vehicle_suggestions_status
  on community_vehicle_suggestions (status);

create index if not exists idx_vehicle_suggestions_lookup
  on community_vehicle_suggestions (tipo, marca, modelo);

create index if not exists idx_vehicle_suggestions_parametros
  on community_vehicle_suggestions using gin (parametros_financeiros);

create index if not exists idx_vehicle_suggestions_raw_payload
  on community_vehicle_suggestions using gin (raw_payload);

create index if not exists idx_complaints_created_at
  on complaints (created_at desc);

create index if not exists idx_complaints_status
  on complaints (status);

create index if not exists idx_complaints_category
  on complaints (category);

create index if not exists idx_complaints_raw_payload
  on complaints using gin (raw_payload);
