const {
  databaseConfigured,
  metadataFromHeaders,
  saveComplaint,
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
  const category = clean(body.category, 80) || 'Nao informado';
  const name = clean(body.name, 80) || 'Nao informado';
  const email = clean(body.email, 120) || 'Nao informado';
  const appVersion = clean(body.appVersion, 40) || 'Nao informado';
  const device = clean(body.device, 120) || 'Nao informado';
  const message = String(body.message || '').trim().slice(0, 2500);
  const page = event.headers.referer || event.headers.referrer || 'Nao informado';

  return [
    'Nova reclamacao do KORRE',
    '',
    `Categoria: ${category}`,
    `Nome: ${name}`,
    `E-mail: ${email}`,
    `Versao do app: ${appVersion}`,
    `Aparelho: ${device}`,
    `Pagina: ${page}`,
    '',
    'Mensagem:',
    message,
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
    const message = String(body.message || '').trim();

    if (body.website) {
      return response(200, { ok: true });
    }

    if (message.length < 10) {
      return response(400, {
        error: 'Descreva a reclamacao com pelo menos 10 caracteres.',
      });
    }

    const dbEnabled = databaseConfigured();
    const telegramEnabled = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

    if (!dbEnabled && !telegramEnabled) {
      return response(500, { error: 'Nenhum destino configurado para receber a reclamacao.' });
    }

    const savedId = dbEnabled
      ? await saveComplaint(body, metadataFromHeaders(event.headers || {}))
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
    return response(500, { error: 'Erro inesperado ao salvar a reclamacao.' });
  }
};
