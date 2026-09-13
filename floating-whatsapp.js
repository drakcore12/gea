(() => {
  'use strict';

  const WHATSAPP_NUMBER = '573017605677';
  const MESSAGE = 'Hola, Soluciones GEA. Quiero solicitar información o una cotización.';

  function stylesheetUrl() {
    const script = document.currentScript || document.querySelector('script[data-floating-whatsapp-script]');
    const href = new URL('/floating-whatsapp.css', window.location.origin);

    if (script?.src) {
      const scriptUrl = new URL(script.src, window.location.href);
      const version = scriptUrl.searchParams.get('v');
      if (version) href.searchParams.set('v', version);
    }

    return href.toString();
  }

  function ensureStylesheet() {
    if (document.querySelector('link[data-floating-whatsapp-styles]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheetUrl();
    link.dataset.floatingWhatsappStyles = 'true';
    document.head.appendChild(link);
  }

  function createWhatsappIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'floating-whatsapp__icon');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M13.601 2.326A7.854 7.854 0 0 0 7.994.001C3.564.001-.032 3.597-.032 8.027c0 1.414.369 2.794 1.07 4L0 16l4.1-1.074a8 8 0 0 0 3.894 1.06h.003c4.43 0 8.026-3.596 8.026-8.026a7.95 7.95 0 0 0-2.422-5.634zM7.994 14.63a6.63 6.63 0 0 1-3.38-.925l-.242-.144-2.433.638.65-2.37-.158-.245a6.6 6.6 0 1 1 5.563 3.046zm3.633-4.967c-.2-.1-1.18-.582-1.363-.648-.183-.067-.316-.1-.45.1-.133.2-.516.648-.632.782-.116.133-.233.15-.433.05-.2-.1-.843-.311-1.605-.99-.593-.529-.994-1.182-1.11-1.382-.117-.2-.013-.308.087-.407.09-.09.2-.233.3-.35.1-.116.133-.2.2-.333.067-.133.033-.25-.017-.35-.05-.1-.45-1.083-.616-1.483-.162-.39-.327-.337-.45-.343a8.5 8.5 0 0 0-.383-.007c-.133 0-.35.05-.533.25-.183.2-.7.683-.7 1.666 0 .983.717 1.933.817 2.066.1.133 1.41 2.153 3.416 3.018.477.206.85.329 1.14.421.479.152.915.131 1.26.08.384-.057 1.18-.483 1.347-.95.166-.466.166-.866.116-.95-.05-.083-.183-.133-.383-.233z');
    svg.appendChild(path);
    return svg;
  }

  function createButton() {
    if (document.querySelector('[data-floating-whatsapp]')) return;

    ensureStylesheet();
    document.body.classList.add('has-floating-whatsapp');

    const link = document.createElement('a');
    link.className = 'floating-whatsapp';
    link.dataset.floatingWhatsapp = 'true';
    link.dataset.whatsapp = 'general';
    link.dataset.analytics = 'floating_whatsapp';
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Escríbenos por WhatsApp');
    link.title = 'Escríbenos por WhatsApp';

    const iconWrap = document.createElement('span');
    iconWrap.className = 'floating-whatsapp__icon-wrap';
    iconWrap.appendChild(createWhatsappIcon());

    const label = document.createElement('span');
    label.className = 'floating-whatsapp__label';
    label.textContent = 'Escríbenos por WhatsApp';

    link.append(iconWrap, label);
    document.body.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton, { once: true });
  } else {
    createButton();
  }
})();
