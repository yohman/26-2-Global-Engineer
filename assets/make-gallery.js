(() => {
  const config = window.MAKE_SUBMISSIONS_CONFIG || {};
  const assignments = config.assignments || {};
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  const requiredHeaders = [
    'Timestamp', 'Assignment', 'Student ID', 'Display Name', 'Project Title',
    'Description', 'Project URL', 'Thumbnail URL', 'UNIPA Confirmation'
  ];

  function parseCsv(text) {
    const rows = [];
    let row = [], value = '', quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const character = text[i];
      if (quoted && character === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (character === '"') quoted = !quoted;
      else if (!quoted && character === ',') { row.push(value); value = ''; }
      else if (!quoted && (character === '\n' || character === '\r')) {
        if (character === '\r' && text[i + 1] === '\n') i += 1;
        row.push(value);
        if (row.some((cell) => cell.trim())) rows.push(row);
        row = []; value = '';
      } else value += character;
    }
    if (value || row.length) { row.push(value); rows.push(row); }
    const headers = rows.shift() || [];
    return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header.trim(), (cells[index] || '').trim()])));
  }

  function csvUrl(url) {
    if (!url.includes('/pubhtml')) return url;
    return url.replace('/pubhtml', '/pub').replace(/([?&])single=true(&|$)/, '$1').replace(/[?&]$/, '') + (url.includes('?') ? '&' : '?') + 'output=csv';
  }

  async function loadSubmissions() {
    if (config.GOOGLE_MAKE_SHEET_URL) {
      try {
        const response = await fetch(csvUrl(config.GOOGLE_MAKE_SHEET_URL));
        if (!response.ok) throw new Error('Sheet request failed');
        return parseCsv(await response.text());
      } catch (error) {
        console.warn('MAKE submissions could not be loaded.', error);
      }
    }
    return isLocal ? (config.localSampleSubmissions || []) : [];
  }

  function value(row, header) { return row[header] || ''; }
  function assignmentKey(assignment) {
    return Object.entries(assignments).find(([key, item]) => key === assignment || item.title === assignment)?.[0] || assignment;
  }
  function latestSubmissions(rows) {
    const latest = new Map();
    rows.forEach((row, index) => {
      if (!requiredHeaders.slice(0, 3).every((header) => value(row, header))) return;
      const normalizedAssignment = assignmentKey(value(row, 'Assignment'));
      const key = `${value(row, 'Student ID')}\u0000${normalizedAssignment}`;
      const time = Date.parse(value(row, 'Timestamp'));
      const current = latest.get(key);
      if (!current || time >= current.time) latest.set(key, { row, normalizedAssignment, time: Number.isNaN(time) ? 0 : time, index });
    });
    return [...latest.values()].sort((a, b) => b.time - a.time || b.index - a.index)
      .map(({ row, normalizedAssignment }) => ({ ...row, _makeAssignmentKey: normalizedAssignment }));
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  function appendText(element, className, content) {
    if (!content) return;
    const child = document.createElement('p');
    child.className = className;
    child.textContent = content;
    element.append(child);
  }

  function renderGallery(target, submissions, assignment) {
    const matches = submissions.filter((row) => row._makeAssignmentKey === assignment);
    const gallery = target.querySelector('.make-gallery');
    if (!matches.length) {
      gallery.innerHTML = '<p class="make-gallery-empty">No submissions yet.</p>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'make-gallery-grid';
    matches.forEach((row) => {
      const card = document.createElement('article');
      card.className = 'make-gallery-card';
      const thumbnail = value(row, 'Thumbnail URL');
      if (thumbnail) {
        const image = document.createElement('img');
        image.src = thumbnail; image.alt = ''; image.loading = 'lazy';
        card.append(image);
      }
      appendText(card, 'make-gallery-name', value(row, 'Display Name'));
      const title = document.createElement('h3');
      title.textContent = value(row, 'Project Title') || 'Untitled project';
      card.append(title);
      appendText(card, 'make-gallery-description', value(row, 'Description'));
      const projectUrl = value(row, 'Project URL');
      if (projectUrl) {
        const link = document.createElement('a');
        link.className = 'make-gallery-link'; link.href = projectUrl; link.target = '_blank'; link.rel = 'noopener';
        link.textContent = 'VIEW PROJECT ↗'; card.append(link);
      }
      const updated = formatDate(value(row, 'Timestamp'));
      appendText(card, 'make-gallery-updated', updated ? `Updated ${updated}` : '');
      grid.append(card);
    });
    gallery.replaceChildren(grid);
  }

  function addAssignmentUi() {
    document.querySelectorAll('[data-make-assignment]').forEach((article) => {
      const assignment = assignments[article.dataset.makeAssignment];
      if (!assignment) return;
      const section = document.createElement('div');
      section.className = 'make-submission';
      if (assignment.formUrl) {
        const link = document.createElement('a');
        link.className = 'button'; link.href = assignment.formUrl; link.target = '_blank'; link.rel = 'noopener';
        link.textContent = 'SUBMIT / UPDATE YOUR MAKE'; section.append(link);
      }
      const note = document.createElement('p');
      note.className = 'make-submit-note';
      note.textContent = 'Submit again anytime to update your work. Your newest submission is the version shown here. Submit the same public URL to UNIPA.';
      section.append(note);
      const galleryTitle = document.createElement('h3');
      galleryTitle.className = 'make-gallery-title'; galleryTitle.textContent = 'CLASS MAKES'; section.append(galleryTitle);
      const gallery = document.createElement('div'); gallery.className = 'make-gallery'; section.append(gallery);
      article.append(section);
    });
  }

  addAssignmentUi();
  loadSubmissions().then((rows) => {
    const current = latestSubmissions(rows);
    document.querySelectorAll('[data-make-assignment]').forEach((article) => {
      const assignment = assignments[article.dataset.makeAssignment];
      if (assignment) renderGallery(article, current, article.dataset.makeAssignment);
    });
  });
})();
