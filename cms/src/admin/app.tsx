import type { StrapiApp } from '@strapi/strapi/admin';

function preventAutomaticBrowserTranslation() {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('translate', 'no');
  document.documentElement.classList.add('notranslate');
  document.body?.setAttribute('translate', 'no');
  document.body?.classList.add('notranslate');

  let googleMeta = document.querySelector<HTMLMetaElement>('meta[name="google"]');
  if (!googleMeta) {
    googleMeta = document.createElement('meta');
    googleMeta.name = 'google';
    document.head.appendChild(googleMeta);
  }
  googleMeta.content = 'notranslate';
}

// Apply the guard before React renders, then re-apply it during Strapi bootstrap
// in case the document body was not available while the module loaded.
preventAutomaticBrowserTranslation();

export default {
  config: {
    locales: ['zh'],
  },
  bootstrap(_app: StrapiApp) {
    preventAutomaticBrowserTranslation();
  },
};
