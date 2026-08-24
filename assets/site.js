const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.site-nav a').forEach((link) => {
  if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
});

// Language is intentionally isolated from page layout. Revise or add Japanese
// copy in i18n.js without touching the visual templates.
const translations = window.COURSE_TRANSLATIONS?.ja || {};
const englishTitle = document.title;
const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    const tag = node.parentElement?.tagName;
    const text = node.nodeValue.trim();
    return text && tag !== 'SCRIPT' && tag !== 'STYLE'
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_REJECT;
  }
});

while (walker.nextNode()) {
  const node = walker.currentNode;
  textNodes.push({ node, english: node.nodeValue });
}

const languageButton = document.createElement('button');
languageButton.className = 'language-toggle';
languageButton.type = 'button';
nav?.append(languageButton);

function savedLanguage() {
  try { return localStorage.getItem('ge-language') || 'en'; }
  catch { return 'en'; }
}

function applyLanguage(language) {
  document.documentElement.lang = language;
  textNodes.forEach(({ node, english }) => {
    const key = english.trim();
    const leading = english.match(/^\s*/)?.[0] || '';
    const trailing = english.match(/\s*$/)?.[0] || '';
    node.nodeValue = language === 'ja' && translations[key]
      ? leading + translations[key] + trailing
      : english;
  });
  document.title = language === 'ja' && translations[englishTitle]
    ? translations[englishTitle]
    : englishTitle;
  languageButton.textContent = language === 'ja' ? 'EN' : 'JP';
  languageButton.setAttribute('aria-label', language === 'ja' ? 'Switch to English' : '日本語に切り替える');
  try { localStorage.setItem('ge-language', language); } catch {}
}

let language = savedLanguage();
applyLanguage(language);
languageButton.addEventListener('click', () => {
  language = language === 'en' ? 'ja' : 'en';
  applyLanguage(language);
});

const filterButtons = document.querySelectorAll('[data-filter]');
const resources = document.querySelectorAll('[data-kind]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    resources.forEach((resource) => {
      resource.hidden = filter !== 'all' && resource.dataset.kind !== filter;
    });
  });
});
