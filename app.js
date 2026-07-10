// Google Analytics 4
window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', 'G-43XJ69N8VD');

const analyticsScript = document.createElement('script');
analyticsScript.async = true;
analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-43XJ69N8VD';
document.head.appendChild(analyticsScript);

// Tema claro/oscuro
const root = document.documentElement;
const themeStorageKey = 'gea-theme-manual-override';
const logoPositive = './assets/img/imagotipo-horizontal-color-transparente.png';
const logoNegative = './assets/img/imagotipo-horizontal-negativo-transparente.png';

let themeTimer;
let themeButton;

function scheduledTheme(date = new Date()) {
  const hour = date.getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

function nextThemeBoundary(date = new Date()) {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);

  if (date.getHours() < 6) {
    next.setHours(6);
  } else if (date.getHours() < 18) {
    next.setHours(18);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(6);
  }

  return next;
}

function readManualTheme() {
  try {
    const savedTheme = JSON.parse(localStorage.getItem(themeStorageKey) || 'null');

    if (
      savedTheme &&
      ['light', 'dark'].includes(savedTheme.theme) &&
      Number(savedTheme.expiresAt) > Date.now()
    ) {
      return savedTheme;
    }

    localStorage.removeItem(themeStorageKey);
  } catch (_) {
    // La página puede seguir funcionando aunque localStorage esté bloqueado.
  }

  return null;
}

function saveManualTheme(theme) {
  try {
    localStorage.setItem(
      themeStorageKey,
      JSON.stringify({
        theme,
        expiresAt: nextThemeBoundary().getTime(),
      }),
    );
  } catch (_) {
    // La selección se aplica durante la sesión aunque no pueda guardarse.
  }
}

function syncHeaderLogo(theme) {
  const headerLogo = document.querySelector('.brand-image');

  if (headerLogo) {
    headerLogo.src = theme === 'dark' ? logoNegative : logoPositive;
  }
}

function updateThemeControl(theme, override) {
  if (!themeButton) return;

  const nextMode = theme === 'dark' ? 'claro' : 'oscuro';
  const source = override
    ? 'Selección manual hasta el próximo cambio automático.'
    : 'Automático según la hora local.';

  themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  themeButton.setAttribute('aria-label', `Activar modo ${nextMode}. ${source}`);
  themeButton.title = `Activar modo ${nextMode}. ${source}`;

  const accessibleText = themeButton.querySelector('.sr-only');
  if (accessibleText) {
    accessibleText.textContent = `Tema actual: ${theme === 'dark' ? 'oscuro' : 'claro'}. ${source}`;
  }
}

function applyTheme(theme, override = null) {
  root.setAttribute('data-theme', theme);
  syncHeaderLogo(theme);
  updateThemeControl(theme, override);
}

function scheduleThemeCheck() {
  window.clearTimeout(themeTimer);

  themeTimer = window.setTimeout(
    applyResolvedTheme,
    Math.max(1000, nextThemeBoundary().getTime() - Date.now() + 750),
  );
}

function applyResolvedTheme() {
  const override = readManualTheme();
  applyTheme(override ? override.theme : scheduledTheme(), override);
  scheduleThemeCheck();
}

function createThemeControl() {
  const navWrap = document.querySelector('.nav-wrap');
  if (!navWrap) return;

  themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.className = 'theme-toggle';
  themeButton.innerHTML = `
    <svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
    </svg>
    <svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path>
    </svg>
    <span class="sr-only"></span>
  `;

  navWrap.insertBefore(themeButton, navWrap.querySelector('.button-header') || null);

  themeButton.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || scheduledTheme();
    const selectedTheme = currentTheme === 'dark' ? 'light' : 'dark';

    saveManualTheme(selectedTheme);
    applyResolvedTheme();
  });
}

// Enlace para reseñas de Google
function addGoogleReviewLink() {
  const socialLinks = document.querySelector('.contact-section .social-links');

  if (!socialLinks || document.querySelector('[data-google-review]')) return;

  const reviewLink = document.createElement('a');
  reviewLink.href = 'https://g.page/r/CawVQrcAW8KpEBM/review';
  reviewLink.target = '_blank';
  reviewLink.rel = 'noopener noreferrer';
  reviewLink.dataset.googleReview = 'true';
  reviewLink.textContent = 'Califica nuestro servicio en Google';
  reviewLink.style.cssText = [
    'display:inline-flex',
    'align-items:center',
    'justify-content:center',
    'margin-top:18px',
    'padding:11px 15px',
    'border:1px solid rgba(255,255,255,.65)',
    'border-radius:10px',
    'color:#fff',
    'font-weight:800',
    'text-decoration:none',
    'transition:.2s ease',
  ].join(';');

  reviewLink.addEventListener('mouseenter', () => {
    reviewLink.style.background = 'rgba(255,255,255,.14)';
  });

  reviewLink.addEventListener('mouseleave', () => {
    reviewLink.style.background = 'transparent';
  });

  reviewLink.addEventListener('click', () => {
    gtag('event', 'google_review_click', { link_url: reviewLink.href });
  });

  socialLinks.insertAdjacentElement('afterend', reviewLink);
}

// WhatsApp
const whatsappNumber = '573017605677';
const whatsappMessages = {
  general: 'Hola, Soluciones GEA. Quiero solicitar información o una cotización.',
  gas: 'Hola, Soluciones GEA. Necesito una cotización para un servicio de gas.',
  electricidad: 'Hola, Soluciones GEA. Necesito una cotización para un servicio eléctrico.',
  agua: 'Hola, Soluciones GEA. Necesito una cotización para un servicio de agua.',
  mantenimiento: 'Hola, Soluciones GEA. Estoy interesado en un plan de mantenimiento preventivo.',
};

function whatsappUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function initializeWhatsappLinks() {
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    const messageKey = link.dataset.whatsapp || 'general';
    link.href = whatsappUrl(whatsappMessages[messageKey] || whatsappMessages.general);
  });
}

// Menú móvil
const verticalMenuIcon = `
  <svg class="menu-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="2"></circle>
    <circle cx="12" cy="12" r="2"></circle>
    <circle cx="12" cy="19" r="2"></circle>
  </svg>
`;

function initializeMobileMenu() {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (!menuButton || !nav) return;

  menuButton.innerHTML = verticalMenuIcon;

  function setMenuState(isOpen) {
    nav.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute(
      'aria-label',
      isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación',
    );
    menuButton.title = isOpen ? 'Cerrar menú' : 'Abrir menú';
  }

  setMenuState(false);

  menuButton.addEventListener('click', () => {
    setMenuState(!nav.classList.contains('is-open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });
}

// Botón flotante de WhatsApp
const whatsappIcon = `
  <svg class="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16.02 3.2c-7.08 0-12.8 5.7-12.8 12.74 0 2.24.59 4.43 1.7 6.35L3.1 28.8l6.72-1.76a12.83 12.83 0 0 0 6.2 1.58h.01c7.07 0 12.8-5.7 12.8-12.74C28.83 8.9 23.1 3.2 16.02 3.2Zm0 23.28h-.01a10.65 10.65 0 0 1-5.44-1.49l-.39-.23-3.99 1.04 1.07-3.88-.25-.4a10.5 10.5 0 0 1-1.63-5.64c0-5.82 4.77-10.56 10.64-10.56 5.86 0 10.63 4.74 10.63 10.56 0 5.82-4.77 10.6-10.63 10.6Zm5.83-7.92c-.32-.16-1.9-.93-2.2-1.04-.3-.11-.52-.16-.74.16-.21.32-.84 1.04-1.03 1.25-.19.21-.38.24-.7.08-.33-.16-1.37-.5-2.61-1.6-.97-.86-1.63-1.92-1.82-2.24-.19-.32-.02-.5.14-.66.15-.15.32-.38.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.74-1.76-1.01-2.41-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.4-.3.32-1.15 1.12-1.15 2.74 0 1.62 1.18 3.19 1.34 3.41.16.21 2.32 3.69 5.63 5.02.79.34 1.41.54 1.89.69.8.26 1.53.22 2.1.13.64-.1 1.9-.77 2.17-1.5.27-.74.27-1.38.19-1.51-.08-.14-.29-.22-.61-.38Z"></path>
  </svg>
`;

function initializeFloatingWhatsapp() {
  const floatingWhatsapp = document.querySelector('.floating-whatsapp');
  if (!floatingWhatsapp) return;

  floatingWhatsapp.innerHTML = whatsappIcon;
  floatingWhatsapp.title = 'Escribir por WhatsApp';

  Object.assign(floatingWhatsapp.style, {
    width: '68px',
    height: '68px',
    minHeight: '68px',
    padding: '0',
    display: 'inline-grid',
    placeItems: 'center',
  });

  const icon = floatingWhatsapp.querySelector('.whatsapp-icon');
  if (icon) {
    icon.style.cssText = 'width:36px;height:36px;display:block;fill:currentColor';
  }
}

// Formulario de contacto
function initializeLeadForm() {
  const leadForm = document.querySelector('#lead-form');
  if (!leadForm) return;

  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(leadForm);
    const message = [
      'Hola, Soluciones GEA. Quiero solicitar una cotización.',
      '',
      `Nombre: ${data.get('nombre')}`,
      `Teléfono: ${data.get('telefono')}`,
      `Servicio: ${data.get('servicio')}`,
      `Necesidad: ${data.get('detalle')}`,
    ].join('\n');

    gtag('event', 'generate_lead', { method: 'whatsapp_form' });
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  });
}

function updateFooterYear() {
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
}

createThemeControl();
applyResolvedTheme();
addGoogleReviewLink();
initializeWhatsappLinks();
initializeMobileMenu();
initializeFloatingWhatsapp();
initializeLeadForm();
updateFooterYear();

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) applyResolvedTheme();
});
