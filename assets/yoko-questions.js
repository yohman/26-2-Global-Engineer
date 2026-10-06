(() => {
  const config = window.ASSIGNMENT_SUBMISSION_CONFIG || {};
  const storyMode = config.mode === 'story';
  const feed = config.feed || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSojEChcFESrqEY6EskmTxxeubXiDHcKVZCHbvq1SssogP68w-9IZejJF0tF0BnYBo-8qppx8BXQTtK/pub?gid=335386714&single=true&output=csv';
  const form = document.querySelector('#question-form');
  const list = document.querySelector('#question-list');
  const status = document.querySelector('#questions-status');
  const receipt = document.querySelector('#submission-status');
  const submit = form.querySelector('button');
  const t = value => document.documentElement.lang === 'ja' ? window.COURSE_TRANSLATIONS?.ja?.[value] || value : value;
  let pending = null, pendingCount = 0, timer = null, rows = [], allRows = [], message = storyMode ? 'Loading submissions…' : 'Loading questions…', submissionMessage = '';
  const matches = (row, values) => values.every((value, index) => (row[index + 1] || '') === value);
  const nameKey = row => row[1].normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

  function parseCSV(source) {
    const result = []; let row = [], field = '', quoted = false;
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (char === '"') { if (quoted && source[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
      else if (char === ',' && !quoted) { row.push(field); field = ''; }
      else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && source[i + 1] === '\n') i++; row.push(field); result.push(row); row = []; field = ''; }
      else field += char;
    }
    if (field || row.length) { row.push(field); result.push(row); }
    return result;
  }
  function render() {
    status.textContent = t(message); receipt.textContent = t(submissionMessage); list.replaceChildren();
    rows.forEach(row => {
      const article = document.createElement('article'); article.className = 'question-submission';
      const name = document.createElement('h3'); name.textContent = row[1];
      article.append(name);
      if (storyMode) {
        const link = document.createElement('a'); link.textContent = row[2];
        try { const url = new URL(row[3]); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid URL'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener'; } catch { link.textContent += ' (' + t('Invalid link') + ')'; }
        const description = document.createElement('p'); description.textContent = row[4] || ''; article.append(link, description);
      } else {
        const questions = document.createElement('ol'); row.slice(2, 6).filter(value => value.trim()).forEach(value => { const li = document.createElement('li'); li.textContent = value; questions.append(li); }); article.append(questions);
      }
      list.append(article);
    });
  }
  async function load() {
    if (config.publicationPending) {
      message = 'The class list is not published yet. Submissions are saved in the course response sheet.';
      render(); return;
    }
    try {
      const response = await fetch(feed + '&refresh=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Feed unavailable');
      const source = await response.text();
      if (/^\s*</.test(source)) throw new Error('Not CSV');
      let table = parseCSV(source);
      if (config.publicFieldsOnly) table = table.map(row => ['', ...row]);
      if (!table[0]?.some(cell => cell.includes(storyMode ? 'Story title' : 'Question 1'))) throw new Error('Unexpected fields');
      const latest = new Map();
      allRows = table.slice(1).filter(row => row[1]?.trim() && row[2]?.trim() && row[3]?.trim());
      // Google's response sheet appends rows in submission order; later rows replace earlier ones.
      allRows.forEach(row => { const key = nameKey(row); latest.delete(key); latest.set(key, row); });
      rows = [...latest.values()].reverse();
      message = storyMode ? (rows.length ? 'Latest submission per student' : 'No stories submitted yet.') : (rows.length ? 'Questions submitted by the class' : 'No questions yet. Start the conversation.');
      if (pending && allRows.filter(row => matches(row, pending)).length > pendingCount) {
        pending = null; clearTimeout(timer); submissionMessage = storyMode ? 'Confirmed—your latest story is on the class page.' : 'Confirmed—your questions are on the class page.'; submit.disabled = false; form.reset();
      }
    } catch { message = storyMode ? 'Submissions could not be loaded. Please try Refresh.' : 'Questions could not be loaded. Please try Refresh.'; }
    render();
  }
  form.addEventListener('submit', event => {
    if (pending) { event.preventDefault(); return; }
    // Native POST into an invisible frame avoids a cross-origin fetch that cannot confirm saving.
    const fields = [...form.querySelectorAll('input,textarea')]; fields.forEach(field => field.value = field.value.trim());
    if (!form.reportValidity()) { event.preventDefault(); return; }
    pending = fields.map(field => field.value); pendingCount = allRows.filter(row => matches(row, pending)).length; submit.disabled = true;
    submissionMessage = 'Sending… Your text stays here until saving is confirmed.'; render();
    if (config.publicationPending) {
      const frame = document.querySelector('#question-receipt'); frame.hidden = false;
      frame.style.cssText = 'width:100%;height:520px;border:0;margin-top:1rem;background:white';
      return;
    }
    let attempts = 0;
    const check = async () => {
      await load();
      if (!pending) return;
      if (++attempts < 12) timer = setTimeout(check, 10000);
      else { pending = null; submit.disabled = false; submissionMessage = 'Confirmation is delayed. Refresh the class submissions before resubmitting; your text has been kept.'; render(); }
    };
    timer = setTimeout(check, 3000);
  });
  document.querySelector('#question-receipt').addEventListener('load', () => {
    if (!pending) return;
    if (config.publicationPending) {
      pending = null; submit.disabled = false;
      submissionMessage = 'Check the Google receipt below to confirm your submission. Your latest submission counts.';
      render(); return;
    }
    submissionMessage = 'Sent to Google; checking the class page. Published submissions may take a minute to appear.'; render();
  });
  document.querySelector('#refresh-questions').addEventListener('click', load);
  window.addEventListener('course-language-change', render);
  load();
})();
