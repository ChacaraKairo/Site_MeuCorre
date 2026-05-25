document.addEventListener('DOMContentLoaded', function () {
  const config = window.KORRE_CONFIG || {};

  function setLink(element, url) {
    if (!url) {
      element.hidden = true;
      return;
    }

    element.hidden = false;
    element.href = url;
  }

  function buildWhatsAppLink(rawNumber, message) {
    if (!rawNumber) return '';
    const clean = String(rawNumber).replace(/\D/g, '');
    if (!clean) return '';
    const text = encodeURIComponent(message || 'Olá! Quero falar sobre o app KORRE.');
    return 'https://wa.me/' + clean + '?text=' + text;
  }

  function applyEditableConfig() {
    const app = config.app || {};
    const company = config.company || {};
    const contact = config.contact || {};
    const social = config.social || {};

    const linkMap = {
      playStoreUrl: app.playStoreUrl,
      appStoreUrl: app.appStoreUrl,
      officialSiteUrl: app.officialSiteUrl,
      companySiteUrl: company.siteUrl,
      email: contact.email ? 'mailto:' + contact.email : '',
      phone: contact.phoneRaw ? 'tel:' + contact.phoneRaw : '',
      whatsapp: contact.whatsappRaw ? buildWhatsAppLink(contact.whatsappRaw, 'Olá! Quero falar com a equipe do KORRE.') : '',
      instagram: social.instagram,
      facebook: social.facebook,
      tiktok: social.tiktok,
      youtube: social.youtube,
      linkedin: social.linkedin,
      xTwitter: social.xTwitter,
      threads: social.threads,
      github: social.github,
      telegram: social.telegram,
      discord: social.discord,
      bluesky: social.bluesky,
      pinterest: social.pinterest,
    };

    const textMap = {
      email: contact.email,
      emailLabel: contact.email || 'E-mail',
      phoneLabel: contact.phoneLabel || contact.phoneRaw || 'Telefone',
      whatsappLabel: contact.whatsappLabel || contact.whatsappRaw || 'WhatsApp',
    };

    document.querySelectorAll('[data-config-link]').forEach(function (element) {
      setLink(element, linkMap[element.dataset.configLink]);
    });

    document.querySelectorAll('[data-config-text]').forEach(function (element) {
      const value = textMap[element.dataset.configText];
      if (value) {
        element.textContent = value;
      }
    });

    document.querySelectorAll('[data-whatsapp-message]').forEach(function (element) {
      const message = element.getAttribute('data-whatsapp-message') || 'Olá! Quero falar com a equipe do KORRE.';
      const link = buildWhatsAppLink(contact.whatsappRaw, message);
      setLink(element, link);
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    });
  }

  async function shareApp() {
    const app = config.app || {};
    const url = app.playStoreUrl || window.location.href;
    const payload = {
      title: 'KORRE',
      text: 'Conheça o KORRE e transforme cada corrida em número claro.',
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        window.alert('Link copiado para a área de transferência.');
        return;
      }

      window.prompt('Copie o link do KORRE:', url);
    } catch (error) {
      // Usuário pode cancelar o share sem ser erro real.
    }
  }

  function setupShareButtons() {
    document.querySelectorAll('[data-share-app]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        shareApp();
      });
    });
  }

  applyEditableConfig();
  setupShareButtons();

  const anoAtualSpan = document.getElementById('anoAtual');
  if (anoAtualSpan) {
    anoAtualSpan.textContent = new Date().getFullYear();
  }

  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(function (element) {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -40px 0px',
    },
  );

  revealElements.forEach(function (element) {
    observer.observe(element);
  });
});
