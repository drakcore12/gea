// Google Analytics 4
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', 'G-43XJ69N8VD');

const analyticsScript = document.createElement('script');
analyticsScript.async = true;
analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-43XJ69N8VD';
document.head.appendChild(analyticsScript);

const themeStylesheet = document.createElement('link');
themeStylesheet.rel = 'stylesheet';
themeStylesheet.href = './theme.css';
document.head.appendChild(themeStylesheet);

const root = document.documentElement;
const themeStorageKey = 'gea-theme-manual-override';
let themeTimer;
let themeButton;

function scheduledTheme(date = new Date()) {
  const hour = date.getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

function nextThemeBoundary(date = new Date()) {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  if (date.getHours() < 6) next.setHours(6);
  else if (date.getHours() < 18) next.setHours(18);
  else { next.setDate(next.getDate() + 1); next.setHours(6); }
  return next;
}

function readManualTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(themeStorageKey) || 'null');
    if (saved && ['light', 'dark'].includes(saved.theme) && Number(saved.expiresAt) > Date.now()) return saved;
    localStorage.removeItem(themeStorageKey);
  } catch (_) {}
  return null;
}

function saveManualTheme(theme) {
  try { localStorage.setItem(themeStorageKey, JSON.stringify({ theme, expiresAt: nextThemeBoundary().getTime() })); } catch (_) {}
}

function updateThemeControl(theme, override) {
  if (!themeButton) return;
  const nextMode = theme === 'dark' ? 'claro' : 'oscuro';
  const source = override ? 'Selección manual hasta el próximo cambio automático.' : 'Automático según la hora local.';
  themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  themeButton.setAttribute('aria-label', `Activar modo ${nextMode}. ${source}`);
  themeButton.title = `Activar modo ${nextMode}. ${source}`;
  themeButton.querySelector('.sr-only').textContent = `Tema actual: ${theme === 'dark' ? 'oscuro' : 'claro'}. ${source}`;
}

function applyTheme(theme, override = null) { root.setAttribute('data-theme', theme); updateThemeControl(theme, override); }
function scheduleThemeCheck() { window.clearTimeout(themeTimer); themeTimer = window.setTimeout(applyResolvedTheme, Math.max(1000, nextThemeBoundary().getTime() - Date.now() + 750)); }
function applyResolvedTheme() { const override = readManualTheme(); applyTheme(override ? override.theme : scheduledTheme(), override); scheduleThemeCheck(); }

function createThemeControl() {
  const navWrap = document.querySelector('.nav-wrap');
  if (!navWrap) return;
  themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.className = 'theme-toggle';
  themeButton.innerHTML = '<svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg><svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg><span class="sr-only"></span>';
  navWrap.insertBefore(themeButton, navWrap.querySelector('.button-header') || null);
  themeButton.addEventListener('click', () => { const selectedTheme = (root.getAttribute('data-theme') || scheduledTheme()) === 'dark' ? 'light' : 'dark'; saveManualTheme(selectedTheme); applyResolvedTheme(); });
}

createThemeControl();
applyResolvedTheme();
document.addEventListener('visibilitychange', () => { if (!document.hidden) applyResolvedTheme(); });

const whatsappNumber = '573017605677';
const messages = { general: 'Hola, Soluciones GEA. Quiero solicitar información o una cotización.', gas: 'Hola, Soluciones GEA. Necesito una cotización para un servicio de gas.', electricidad: 'Hola, Soluciones GEA. Necesito una cotización para un servicio eléctrico.', agua: 'Hola, Soluciones GEA. Necesito una cotización para un servicio de agua.', mantenimiento: 'Hola, Soluciones GEA. Estoy interesado en un plan de mantenimiento preventivo.' };
function whatsappUrl(message) { return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`; }
document.querySelectorAll('[data-whatsapp]').forEach((link) => { const key = link.dataset.whatsapp || 'general'; link.href = whatsappUrl(messages[key] || messages.general); });

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => { const isOpen = nav.classList.toggle('is-open'); menuButton.setAttribute('aria-expanded', String(isOpen)); menuButton.textContent = isOpen ? 'Cerrar' : 'Menú'; });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.textContent = 'Menú'; }));
}

const leadForm = document.querySelector('#lead-form');
if (leadForm) {
  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(leadForm);
    const message = ['Hola, Soluciones GEA. Quiero solicitar una cotización.', '', `Nombre: ${data.get('nombre')}`, `Teléfono: ${data.get('telefono')}`, `Servicio: ${data.get('servicio')}`, `Necesidad: ${data.get('detalle')}`].join('\n');
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
