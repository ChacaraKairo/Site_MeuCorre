const {
  databaseConfigured,
  metadataFromHeaders,
  saveVehicleSuggestion,
} = require('../lib/form-storage');

function json(response, statusCode, data) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(data));
}

function clean(value, limit) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, limit);
}

function readBody(request) {
  if (request.body && typeof request.body === 'object') {
    return Promise.resolve(request.body);
  }

  return new Promise((resolve, reject) => {
    let data = '';

    request.on('data', (chunk) => {
      data += chunk;
    });

    request.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function buildMessage(body, request) {
  const tipo = clean(body.tipo, 40);
  const marca = clean(body.marca, 60);
  const modelo = clean(body.modelo, 80);
  const motor = clean(body.motor, 80);
  const ano = clean(body.ano, 10);
  const consumo = clean(body.consumo_medio, 20);
  const nome = clean(body.contribuidor_nome, 80) || 'Nao informado';
  const email = clean(body.contribuidor_email, 120) || 'Nao informado';
  const obs = clean(body.observacoes, 3000);
  const page = request.headers.referer || 'Nao informado';
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

async function notifyTelegram(body, request) {
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
        text: buildMessage(body, request),
        disable_web_page_preview: true,
      }),
    },
  );

  return { configured: true, ok: telegramResponse.ok };
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    json(response, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const body = await readBody(request);

    if (body.website) {
      json(response, 200, { ok: true });
      return;
    }

    if (!clean(body.tipo, 40) || !clean(body.marca, 60) || !clean(body.modelo, 80)) {
      json(response, 400, { error: 'Tipo, marca e modelo sao obrigatorios.' });
      return;
    }

    if (Number(body.consumo_medio) <= 0) {
      json(response, 400, { error: 'Consumo medio invalido.' });
      return;
    }

    if (clean(body.observacoes, 3000).length < 10) {
      json(response, 400, { error: 'Observacoes muito curtas.' });
      return;
    }

    const dbEnabled = databaseConfigured();
    const telegramEnabled = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

    if (!dbEnabled && !telegramEnabled) {
      json(response, 500, { error: 'Nenhum destino configurado para receber a sugestao.' });
      return;
    }

    const savedId = dbEnabled
      ? await saveVehicleSuggestion(body, metadataFromHeaders(request.headers))
      : null;
    const telegram = await notifyTelegram(body, request);

    if (telegram.configured && !telegram.ok && !savedId) {
      json(response, 502, { error: 'Nao foi possivel enviar para o Telegram.' });
      return;
    }

    json(response, 200, {
      ok: true,
      id: savedId,
      telegram: telegram.configured ? telegram.ok : null,
    });
  } catch (error) {
    json(response, 500, { error: 'Erro inesperado ao salvar sugestao.' });
  }
};
