/*
  Configuracoes editaveis do site KORRE.

  Como usar:
  - Troque somente os textos dentro das aspas.
  - Se ainda nao tiver algum link, deixe vazio: ''.
  - WhatsApp e telefone devem ficar so com numeros nos campos Raw.
    Exemplo Brasil/Sao Paulo: '5511999999999'.
  - O site preenche automaticamente botoes, rodape, redes sociais e contatos.
*/
window.KORRE_CONFIG = {
  app: {
    name: 'KORRE',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.korucompany.korre',
    appStoreUrl: '',
    officialSiteUrl: '',
  },

  company: {
    name: 'Koru Company',
    siteUrl: 'https://site-koru-company.vercel.app',
  },

  contact: {
    email: 'suporte@korucompany.com.br',
    phoneLabel: '',
    phoneRaw: '',
    whatsappLabel: '',
    whatsappRaw: '',
    address: '',
  },

  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
    xTwitter: '',
    threads: '',
    github: '',
    telegram: '',
    discord: '',
    bluesky: '',
    pinterest: '',
  },
};
