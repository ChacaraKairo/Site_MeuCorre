const {
  databaseConfigured,
  metadataFromHeaders,
  saveVehicleSuggestion,
} = require('../../lib/form-storage');

function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  };
}

function clean(value, limit) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, limit);
}

function buildMessage(body, event) {
  const tipo = clean(body.tipo, 40);
  const marca = clean(body.marca, 60);
  const modelo = clean(body.modelo, 80);
  const motor = clean(body.motor, 80);
  const ano = clean(body.ano, 10);
  const consumo = clean(body.consumo_medio, 20);
  const nome = clean(body.contribuidor_nome, 80) || 'Nao informado';
  const email = clean(body.contribuidor_email, 120) || 'Nao informado';
  const obs = clean(body.observacoes, 3000);
  const page = event.headers.referer || event.headers.referrer || 'Nao informado';
  const parametros = JSON.stringify(body.parametros_financeiros || {}, null, 2).slice(0, 3500);

  return [
    'Nova sugestao comunitaria de veiculo - KORRE',
    '',
    `Veiculo: ${tipo} | ${marca} | ${modelo}`,
    `Motor/versao: ${motor || 'Nao informado'}`,
    `Ano: ${ano || 'Nao informado'}`,
    `Consumo medio: ${consumo || 'Nao informado'}`,
    `Contribuidor: ${nome}`,
    `Email: ${email}`,
    `Pagina: ${page}`,
    '',
    'Parametros financeiros (JSON):',
    parametros,
    '',
    'Observacoes:',
    obs,
  ].join('\n');
}

async function notifyTelegram(body, event) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { configured: false };
  }

  const telegramResponse = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(body, event),
        disable_web_page_preview: true,
      }),
    },
  );

  return { configured: true, ok: telegramResponse.ok };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Metodo nao permitido.' });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    if (body.website) {
      return response(200, { ok: true });
    }

    if (!clean(body.tipo, 40) || !clean(body.marca, 60) || !clean(body.modelo, 80)) {
      return response(400, { error: 'Tipo, marca e modelo sao obrigatorios.' });
    }

    if (Number(body.consumo_medio) <= 0) {
      return response(400, { error: 'Consumo medio invalido.' });
    }

    if (clean(body.observacoes, 3000).length < 10) {
      return response(400, { error: 'Observacoes muito curtas.' });
    }

    const dbEnabled = databaseConfigured();
    const telegramEnabled = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

    if (!dbEnabled && !telegramEnabled) {
      return response(500, { error: 'Nenhum destino configurado para receber a sugestao.' });
    }

    const savedId = dbEnabled
      ? await saveVehicleSuggestion(body, metadataFromHeaders(event.headers || {}))
      : null;
    const telegram = await notifyTelegram(body, event);

    if (telegram.configured && !telegram.ok && !savedId) {
      return response(502, { error: 'Nao foi possivel enviar para o Telegram.' });
    }

    return response(200, {
      ok: true,
      id: savedId,
      telegram: telegram.configured ? telegram.ok : null,
    });
  } catch (error) {
    return response(500, { error: 'Erro inesperado ao salvar sugestao.' });
  }
};
