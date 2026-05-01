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
      whatsapp: contact.whatsappRaw ? 'https://wa.me/' + contact.whatsappRaw : '',
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
  }

  applyEditableConfig();

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
