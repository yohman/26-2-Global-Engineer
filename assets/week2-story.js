// Narrative source of truth: content/week2-traffic-script.md.
(() => {
  const targets = [...document.querySelectorAll('[data-story-scene]')];
  let scenes;
  function parseScript(markdown) {
    const result = new Map();
    let scene, language;
    for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
      const heading = line.match(/^## ([\w-]+)\s*$/);
      const locale = line.match(/^### (en|ja)\s*$/);
      if (heading) {
        scene = heading[1]; language = null;
        if (result.has(scene)) throw new Error(`Duplicate scene: ${scene}`);
        result.set(scene, { en: [], ja: [] });
      } else if (locale && scene) language = locale[1];
      else if (scene && language) result.get(scene)[language].push(line);
    }
    for (const target of targets) {
      const entry = result.get(target.dataset.storyScene);
      if (!entry?.en.join('').trim() || !entry?.ja.join('').trim()) {
        throw new Error(`Missing English or Japanese: ${target.dataset.storyScene}`);
      }
    }
    return result;
  }
  function render() {
    if (!scenes) return;
    const language = document.documentElement.lang === 'ja' ? 'ja' : 'en';
    for (const target of targets) {
      const saved = window.COURSE_EDITOR?.get(`week-2:story/${target.dataset.storyScene}`);
      const paragraphs = (saved?.[language] || scenes.get(target.dataset.storyScene)[language].join('\n')).trim().split(/\n\s*\n/);
      // Text nodes keep authored text safe; blank lines become paragraph breaks.
      target.replaceChildren();
      paragraphs.forEach((text, index) => {
        if (index) target.append(document.createElement('br'), document.createElement('br'));
        target.append(document.createTextNode(text.replace(/\n/g, ' ')));
      });
    }
  }
  addEventListener('course-language-change', render);
  addEventListener('course-content-change', render);
  Promise.resolve(window.COURSE_EDITOR?.ready).then(() => fetch('content/week2-traffic-script.md', { cache: 'no-cache' }))
    .then(response => {
      if (!response.ok) throw new Error(`Script request failed: ${response.status}`);
      return response.text();
    })
    .then(markdown => {
      scenes = parseScript(markdown); render();
      targets.forEach(target => {
        const id = target.dataset.storyScene, source = scenes.get(id);
        window.COURSE_EDITOR?.attach(target.parentElement, { editId: `week-2:story/${id}`, title: id, originalContent: source.en.join('\n').trim(), originalJa: source.ja.join('\n').trim() });
      });
    })
    .catch(error => {
      console.error('Narrative could not load', error);
      for (const target of targets) target.textContent = document.documentElement.lang === 'ja'
        ? '物語を読み込めませんでした。ページを再読み込みしてください。'
        : 'The story could not load. Please reload the page.';
    });
})();
