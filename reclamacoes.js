document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('[data-complaint-form]');
  if (!form) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-form-status]');

  function setStatus(message, type) {
    status.textContent = message;
    status.dataset.status = type || '';
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    submitButton.disabled = true;
    setStatus('Enviando...', 'loading');

    try {
      const response = await fetch('/api/reclamacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            'API nao encontrada. Abra o site por um servidor que rode /api/reclamacao.',
          );
        }

        throw new Error(
          data.error || `Nao foi possivel enviar. Status ${response.status}.`,
        );
      }

      form.reset();
      setStatus('Reclamacao enviada. Obrigado por avisar a equipe.', 'success');
    } catch (error) {
      if (error instanceof TypeError) {
        setStatus(
          'API indisponivel. Rode por uma hospedagem com serverless, como Vercel, e configure o TELEGRAM_CHAT_ID.',
          'error',
        );
        return;
      }

      setStatus(error.message || 'Nao foi possivel enviar agora.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
});
