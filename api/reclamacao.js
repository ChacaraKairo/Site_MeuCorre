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
  const category = clean(body.category, 80) || 'Nao informado';
  const name = clean(body.name, 80) || 'Nao informado';
  const email = clean(body.email, 120) || 'Nao informado';
  const appVersion = clean(body.appVersion, 40) || 'Nao informado';
  const device = clean(body.device, 120) || 'Nao informado';
  const message = String(body.message || '').trim().slice(0, 2500);
  const page = request.headers.referer || 'Nao informado';

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

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    json(response, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    json(response, 500, {
      error: 'Telegram nao configurado no servidor.',
    });
    return;
  }

  try {
    const body = await readBody(request);
    const message = String(body.message || '').trim();

    if (body.website) {
      json(response, 200, { ok: true });
      return;
    }

    if (message.length < 10) {
      json(response, 400, {
        error: 'Descreva a reclamacao com pelo menos 10 caracteres.',
      });
      return;
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

    if (!telegramResponse.ok) {
      json(response, 502, {
        error: 'Nao foi possivel enviar para o Telegram.',
      });
      return;
    }

    json(response, 200, { ok: true });
  } catch (error) {
    json(response, 500, {
      error: 'Erro inesperado ao enviar a reclamacao.',
    });
  }
};
