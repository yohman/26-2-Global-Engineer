(() => {
  const feed = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSojEChcFESrqEY6EskmTxxeubXiDHcKVZCHbvq1SssogP68w-9IZejJF0tF0BnYBo-8qppx8BXQTtK/pub?gid=335386714&single=true&output=csv';
  const form = document.querySelector('#question-form');
  const list = document.querySelector('#question-list');
  const status = document.querySelector('#questions-status');
  const receipt = document.querySelector('#submission-status');
  const submit = form.querySelector('button');
  const t = value => document.documentElement.lang === 'ja' ? window.COURSE_TRANSLATIONS?.ja?.[value] || value : value;
  let pending = null, timer = null, rows = [], message = 'Loading questions…', submissionMessage = '';

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
      const questions = document.createElement('ol'); row.slice(2, 6).filter(value => value.trim()).forEach(value => { const li = document.createElement('li'); li.textContent = value; questions.append(li); });
      article.append(name, questions); list.append(article);
    });
  }
  async function load() {
    try {
      const response = await fetch(feed + '&refresh=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Feed unavailable');
      const source = await response.text();
      if (/^\s*</.test(source)) throw new Error('Not CSV');
      const table = parseCSV(source);
      if (!table[0]?.some(cell => cell.includes('Question 1'))) throw new Error('Unexpected fields');
      rows = table.slice(1).filter(row => row[1]?.trim() && row[2]?.trim() && row[3]?.trim()).reverse();
      message = rows.length ? 'Questions submitted by the class' : 'No questions yet. Start the conversation.';
      if (pending && rows.some(row => row[1] === pending[0] && row.slice(2, 6).every((value, index) => value === pending[index + 1]))) {
        pending = null; clearTimeout(timer); submissionMessage = 'Confirmed—your questions are on the class page.'; submit.disabled = false; form.reset();
      }
    } catch { message = 'Questions could not be loaded. Please try Refresh.'; }
    render();
  }
  form.addEventListener('submit', event => {
    if (pending) { event.preventDefault(); return; }
    // Native POST into an invisible frame avoids a cross-origin fetch that cannot confirm saving.
    const fields = [...form.querySelectorAll('input,textarea')]; fields.forEach(field => field.value = field.value.trim());
    if (!form.reportValidity()) { event.preventDefault(); return; }
    pending = fields.map(field => field.value); submit.disabled = true;
    submissionMessage = 'Sending… Your text stays here until saving is confirmed.'; render();
    let attempts = 0;
    const check = async () => {
      await load();
      if (!pending) return;
      if (++attempts < 12) timer = setTimeout(check, 10000);
      else { pending = null; submit.disabled = false; submissionMessage = 'Confirmation is delayed. Refresh the class questions before resubmitting; your text has been kept.'; render(); }
    };
    timer = setTimeout(check, 3000);
  });
  document.querySelector('#question-receipt').addEventListener('load', () => {
    if (!pending) return;
    submissionMessage = 'Sent to Google; checking the class page. Published questions may take a minute to appear.'; render();
  });
  document.querySelector('#refresh-questions').addEventListener('click', load);
  window.addEventListener('course-language-change', render);
  load();
})();
