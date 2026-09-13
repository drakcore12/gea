(() => {
  'use strict';

  const WHATSAPP_NUMBER = '573017605677';
  const MESSAGE = 'Hola, Soluciones GEA. Quiero solicitar información o una cotización.';

  function installStyles() {
    if (document.querySelector('style[data-floating-whatsapp-styles]')) return;

    const style = document.createElement('style');
    style.dataset.floatingWhatsappStyles = 'true';
    style.textContent = `
      .floating-whatsapp[data-floating-whatsapp] {
        position: fixed !important;
        right: max(18px, env(safe-area-inset-right)) !important;
        bottom: max(18px, env(safe-area-inset-bottom)) !important;
        left: auto !important;
        z-index: 90;
        width: 64px !important;
        height: 64px !important;
        min-width: 64px;
        min-height: 64px;
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: 0 !important;
        color: #fff !important;
        background: #25d366 !important;
        border: 0 !important;
        border-radius: 999px !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.24) !important;
        text-decoration: none !important;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
      }

      .floating-whatsapp[data-floating-whatsapp] .floating-whatsapp__icon {
        width: 34px;
        height: 34px;
        display: block;
        flex: 0 0 auto;
      }

      .floating-whatsapp[data-floating-whatsapp] .floating-whatsapp__label {
        display: none;
      }

      .floating-whatsapp[data-floating-whatsapp]:focus-visible {
        outline: 3px solid #fff;
        outline-offset: 3px;
        box-shadow: 0 0 0 6px rgba(37, 211, 102, 0.45), 0 12px 30px rgba(0, 0, 0, 0.24) !important;
      }

      @media (hover: hover) and (pointer: fine) {
        .floating-whatsapp[data-floating-whatsapp]:hover {
          transform: translateY(-3px) scale(1.03);
          background: #20bd5a !important;
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28) !important;
        }
      }

      @media (max-width: 760px) {
        body.has-floating-whatsapp {
          padding-bottom: calc(64px + env(safe-area-inset-bottom));
        }

        .floating-whatsapp[data-floating-whatsapp] {
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          height: auto !important;
          min-width: 0;
          min-height: 60px;
          justify-content: center;
          gap: 10px;
          padding: 14px max(20px, env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left)) !important;
          border-radius: 0 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.22) !important;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.2;
          text-align: center;
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.18) !important;
        }

        .floating-whatsapp[data-floating-whatsapp] .floating-whatsapp__icon {
          width: 28px;
          height: 28px;
        }

        .floating-whatsapp[data-floating-whatsapp] .floating-whatsapp__label {
          display: inline;
        }

        .floating-whatsapp[data-floating-whatsapp]:active {
          transform: scale(0.99);
          background: #20bd5a !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createButton() {
    if (document.querySelector('[data-floating-whatsapp]')) return;

    installStyles();
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
    link.innerHTML = `
      <svg class="floating-whatsapp__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M13.601 2.326A7.854 7.854 0 0 0 7.994.001C3.564.001-.032 3.597-.032 8.027c0 1.414.369 2.794 1.07 4L0 16l4.1-1.074a8 8 0 0 0 3.894 1.06h.003c4.43 0 8.026-3.596 8.026-8.026a7.95 7.95 0 0 0-2.422-5.634zM7.994 14.63a6.63 6.63 0 0 1-3.38-.925l-.242-.144-2.433.638.65-2.37-.158-.245a6.6 6.6 0 1 1 5.563 3.046zm3.633-4.967c-.2-.1-1.18-.582-1.363-.648-.183-.067-.316-.1-.45.1-.133.2-.516.648-.632.782-.116.133-.233.15-.433.05-.2-.1-.843-.311-1.605-.99-.593-.529-.994-1.182-1.11-1.382-.117-.2-.013-.308.087-.407.09-.09.2-.233.3-.35.1-.116.133-.2.2-.333.067-.133.033-.25-.017-.35-.05-.1-.45-1.083-.616-1.483-.162-.39-.327-.337-.45-.343a8.5 8.5 0 0 0-.383-.007c-.133 0-.35.05-.533.25-.183.2-.7.683-.7 1.666 0 .983.717 1.933.817 2.066.1.133 1.41 2.153 3.416 3.018.477.206.85.329 1.14.421.479.152.915.131 1.26.08.384-.057 1.18-.483 1.347-.95.166-.466.166-.866.116-.95-.05-.083-.183-.133-.383-.233z"/>
      </svg>
      <span class="floating-whatsapp__label">Escríbenos por WhatsApp</span>
    `;

    document.body.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton, { once: true });
  } else {
    createButton();
  }
})();
