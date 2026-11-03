(() => {
  const story = window.JAN_ELLIQ_STORY;
  const stage = document.querySelector('#stage');
  const dialog = document.querySelector('#notes');
  const languageButton = document.querySelector('#language');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  let lang = 'ja';
  try { lang = localStorage.getItem('ge-language') === 'en' ? 'en' : 'ja'; } catch {}
  const fromHash = () => Math.max(0, Math.min(story.slides.length - 1, (Number(location.hash.slice(1)) || 1) - 1));
  let index = fromHash();
  const text = (en, ja) => lang === 'ja' ? ja : en;
  const svgNS = 'http://www.w3.org/2000/svg';

  function picture(metadata, rect) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', rect.join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', metadata.alt[lang]);
    const image = document.createElementNS(svgNS, 'image');
    image.setAttribute('href', `assets/jan-elliq/${metadata.file}`);
    image.setAttribute('width', metadata.size[0]);
    image.setAttribute('height', metadata.size[1]);
    svg.append(image);
    return svg;
  }
  function addParagraph(parent, copy, className) {
    const p = document.createElement('p'); p.textContent = copy;
    if (className) p.className = className;
    parent.append(p); return p;
  }
  function render() {
    const slide = story.slides[index];
    document.documentElement.lang = lang;
    document.title = text('Jan and ElliQ', 'JanとElliQ') + ` · ${index + 1}/${story.slides.length}`;
    const section = document.createElement('section');
    section.className = 'slide';
    section.setAttribute('aria-label', text(`Slide ${index + 1}`, `${index + 1}枚目`));
    const credit = document.querySelector('#credit');
    document.body.dataset.photo = String(Boolean(slide.image));
    if (slide.image) {
      const metadata = story.images[slide.image];
      const rectangles = metadata.rects || [metadata.rect];
      section.classList.add('photo'); section.dataset.panels = rectangles.length;
      rectangles.forEach(rect => section.append(picture(metadata, rect)));
      credit.textContent = metadata.credit;
    } else {
      credit.textContent = '';
      section.classList.add(slide.sources ? 'sources' : 'words');
      const copy = document.createElement('div');
      const heading = document.createElement('h1'); heading.textContent = slide[lang]; copy.append(heading);
      if (slide.sources) {
        addParagraph(copy, text('A classroom retelling by Yoh, based on Eli Saslow’s New York Times reporting, February 12, 2026.', 'Eli Saslowによる2026年2月12日のNew York Timesの報道をもとに、Yohが授業用に再構成。'));
        const link = document.createElement('a'); link.href = 'https://www.nytimes.com/2026/02/12/us/elliq-ai-robot-senior-companion.html'; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'To Stay in Her Home, She Let In an A.I. Robot'; copy.append(link);
        addParagraph(copy, 'Photographs: Ruth Fremson / The New York Times; Avishag Shaar-Yashuv / The New York Times.', 'source-credit');
        addParagraph(copy, text('Photographs and article summary supplied by Yoh. Phrases are paraphrases, not quotations. Health observations and pilot findings are reported claims, not proof of causation. Privacy questions remain open.', '写真と記事の要約はYohが提供。スライドの言葉は再話で、発言の引用ではありません。健康や試行プログラムに関する報告は、因果関係の証明とは区別しています。プライバシーについても問いを残しています。'));
        const back = document.createElement('a'); back.href = '../agenda.html#week-6'; back.textContent = text('Back to Week 6', '第6週の授業計画へ'); copy.append(back);
      } else if (slide.subEn) addParagraph(copy, text(slide.subEn, slide.subJa));
      section.append(copy);
    }
    stage.replaceChildren(section);
    document.querySelector('#position').textContent = `${String(index + 1).padStart(2,'0')} / ${story.slides.length}`;
    document.querySelector('#progress').style.width = `${(index + 1) / story.slides.length * 100}%`;
    previous.disabled = index === 0; next.disabled = index === story.slides.length - 1;
    previous.setAttribute('aria-label', text('Previous slide','前のスライド'));
    next.setAttribute('aria-label', text('Next slide','次のスライド'));
    languageButton.textContent = lang === 'ja' ? 'EN' : 'JP';
    languageButton.setAttribute('aria-label', text('日本語に切り替える','Switch to English'));
    document.querySelector('#notes-button').textContent = text('Notes','ノート');
    document.querySelector('#notes-title').textContent = text(`Slide ${index + 1} · Presenter notes`, `${index + 1}枚目・発表用ノート`);
    document.querySelector('#notes-copy').textContent = slide.notes?.[lang] || text('Allow a moment to look at the photograph.','少し間を取り、写真を見てもらう。');
    // Only one slide is mounted. Preload just the next photograph, keeping mobile memory modest.
    const upcoming = story.slides.slice(index + 1).find(item => item.image);
    if (upcoming) { const image = new Image(); image.src = `assets/jan-elliq/${story.images[upcoming.image].file}`; }
  }
  function go(number) {
    index = Math.max(0, Math.min(story.slides.length - 1, number));
    history.replaceState(null, '', `#${index + 1}`); render();
  }
  previous.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  languageButton.addEventListener('click', () => {
    lang = lang === 'ja' ? 'en' : 'ja';
    try { localStorage.setItem('ge-language', lang); } catch {}
    render();
  });
  document.querySelector('#notes-button').addEventListener('click', () => dialog.showModal());
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { document.querySelector('#fullscreen').title = text('Use your browser’s full-screen command.','ブラウザの全画面表示を使ってください。'); }
  }
  document.querySelector('#fullscreen').addEventListener('click', fullscreen);
  document.addEventListener('keydown', event => {
    if (dialog.open || event.altKey || event.metaKey || event.ctrlKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowRight','ArrowDown','PageDown',' '].includes(event.key)) { event.preventDefault(); go(index + 1); }
    else if (['ArrowLeft','ArrowUp','PageUp'].includes(event.key)) { event.preventDefault(); go(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); go(0); }
    else if (event.key === 'End') { event.preventDefault(); go(story.slides.length - 1); }
    else if (event.key.toLowerCase() === 'n') dialog.showModal();
    else if (event.key.toLowerCase() === 'f') fullscreen();
  });
  let touch;
  stage.addEventListener('touchstart', event => { if (event.touches.length === 1) touch = {x:event.touches[0].clientX,y:event.touches[0].clientY}; }, {passive:true});
  stage.addEventListener('touchend', event => {
    if (!touch || dialog.open || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x, dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
    touch = null;
  }, {passive:true});
  window.addEventListener('hashchange', () => { index = fromHash(); render(); });
  render();
})();
