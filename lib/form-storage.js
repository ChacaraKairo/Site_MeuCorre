let pool;

function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL || process.env.PGHOST);
}

function getPool() {
  if (!databaseConfigured()) {
    return null;
  }

  if (!pool) {
    const { Pool } = require('pg');
    const config = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {};

    if (process.env.PGSSLMODE === 'require') {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = new Pool(config);
  }

  return pool;
}

function clean(value, limit) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, limit);
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }

  const raw = String(value).trim();
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function normalizeParameters(body) {
  return body.parametros_financeiros || body.parâmetros_financeiros || {};
}

function metadataFromHeaders(headers) {
  const forwardedFor = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
  const ipAddress = String(forwardedFor).split(',')[0].trim();

  return {
    sourcePage: headers.referer || headers.referrer || headers.Referer || 'Nao informado',
    userAgent: headers['user-agent'] || headers['User-Agent'] || 'Nao informado',
    ipAddress: ipAddress || null,
  };
}

async function saveVehicleSuggestion(body, metadata) {
  const db = getPool();
  if (!db) return null;

  const result = await db.query(
    `
      insert into community_vehicle_suggestions (
        tipo,
        marca,
        modelo,
        motor,
        ano,
        consumo_medio,
        valor_oleo_filtros,
        intervalo_oleo_filtros_km,
        valor_jogo_pneus,
        durabilidade_pneus_km,
        valor_manutencao_freios,
        intervalo_freios_km,
        valor_kit_transmissao,
        durabilidade_transmissao_km,
        parametros_financeiros,
        observacoes,
        contribuidor_nome,
        contribuidor_email,
        lgpd_consent,
        source_page,
        user_agent,
        ip_address,
        raw_payload
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15::jsonb, $16, $17, $18, $19, $20, $21, $22, $23::jsonb
      )
      returning id
    `,
    [
      clean(body.tipo, 40),
      clean(body.marca, 60),
      clean(body.modelo, 80),
      clean(body.motor, 80) || null,
      toNumberOrNull(body.ano),
      toNumberOrNull(body.consumo_medio),
      toNumberOrNull(body.valor_oleo_filtros),
      toNumberOrNull(body.intervalo_oleo_filtros_km),
      toNumberOrNull(body.valor_jogo_pneus),
      toNumberOrNull(body.durabilidade_pneus_km),
      toNumberOrNull(body.valor_manutenção_freios || body.valor_manutencao_freios),
      toNumberOrNull(body.intervalo_freios_km),
      toNumberOrNull(body.valor_kit_transmissao),
      toNumberOrNull(body.durabilidade_transmissao_km),
      JSON.stringify(normalizeParameters(body)),
      clean(body.observacoes, 3000),
      clean(body.contribuidor_nome, 80) || null,
      clean(body.contribuidor_email, 120) || null,
      Boolean(body.lgpd_consent),
      metadata.sourcePage,
      metadata.userAgent,
      metadata.ipAddress,
      JSON.stringify(body),
    ],
  );

  return result.rows[0].id;
}

async function saveComplaint(body, metadata) {
  const db = getPool();
  if (!db) return null;

  const result = await db.query(
    `
      insert into complaints (
        category,
        name,
        email,
        app_version,
        device,
        message,
        source_page,
        user_agent,
        ip_address,
        raw_payload
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb
      )
      returning id
    `,
    [
      clean(body.category, 80) || null,
      clean(body.name, 80) || null,
      clean(body.email, 120) || null,
      clean(body.appVersion, 40) || null,
      clean(body.device, 120) || null,
      clean(body.message, 2500),
      metadata.sourcePage,
      metadata.userAgent,
      metadata.ipAddress,
      JSON.stringify(body),
    ],
  );

  return result.rows[0].id;
}

module.exports = {
  databaseConfigured,
  metadataFromHeaders,
  saveComplaint,
  saveVehicleSuggestion,
};
