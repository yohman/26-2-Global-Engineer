(() => {
  const config = window.ATLAS_CONFIG || {};
  const form = document.querySelector('#atlas-form');
  const formStatus = document.querySelector('#atlas-form-status');
  const feedStatus = document.querySelector('#atlas-status');
  const storyList = document.querySelector('#atlas-story-list');
  const dossier = document.querySelector('#atlas-dossier');
  const yearInput = document.querySelector('#atlas-year');
  const yearLabel = document.querySelector('#atlas-year-label');
  const submit = form.querySelector('[type="submit"]');
  const points = { japan: null, nation: null, world: null };
  const drafts = [];
  let feedReady = false;
  const opening = {
    id: 'instructor-banda-aceh', alias: 'Yoh', title: 'A bag of rice, a life redirected',
    japan: { place: 'Japan', story: 'At an IDP camp in Banda Aceh, a camp leader thanked Yoh simply for being Japanese. A rice sack carried the words “From the People of Japan.” The photograph is a starting point, not proof of the full supply route.', point: [138, 36] },
    nation: { name: 'Indonesia', place: 'Banda Aceh', point: [95.3238, 5.5483] },
    world: null, theme: 'Disaster & care', technology: 'Humanitarian food logistics', year: 2004,
    connection: 'After the Indian Ocean tsunami, Yoh’s encounter with the camp leader made a distant humanitarian system personal. The gratitude attached to a national identity rather than an individual act.',
    evidence: 'The photograph shows a rice sack bearing the World Food Programme mark and the words “From the People of Japan.”',
    controversy: 'A donation can be visible while the people receiving it, the local organizers, and the larger politics of aid remain less visible.',
    question: 'Whose stories are carried by aid, and whose are left out?',
    source: 'https://yohman.github.io/26-2-Global-Engineer/lectures/w01-journey.html', image: 'lectures/assets/banda-aceh-rice.png', kind: 'Instructor opening'
  };
  // A fully worked model of an Atlas contribution. The student and local scene
  // are invented; the project facts and the objection record are sourced.
  const simulated = {
    id: 'sample-kashiwa-manila-delhi', alias: 'Studio prototype',
    title: 'What travels with a train?', kind: 'Simulated story',
    japan: {
      place: 'Kashiwa Station', point: [139.9673, 35.8621],
      story: 'Imagine a student waiting for a train in Kashiwa. The platform feels ordinary: a timetable, a crossing, a promise that people can move. Which parts of that experience could travel—and which depend on this particular city?'
    },
    nation: { name: 'Philippines', place: 'Metro Manila', point: [121.0359, 14.6042] },
    world: { place: 'Delhi, India', point: [77.209, 28.6139] },
    theme: 'Infrastructure & trade', technology: 'Urban rail: tunnels, stations, rolling stock, and operating practice', year: 2018,
    connection: 'In 2018, JICA signed a Japanese ODA loan for the Philippines’ first subway. This map line is an inquiry connecting a familiar station in Japan with a Japanese-backed project in Manila—not a literal rail or supply route. Delhi offers a third place to compare how Japan-supported metro systems meet different cities.',
    evidence: 'JICA’s 2018 loan notice describes a 25 km Metro Manila subway with 13 underground stations and a ¥104.53 billion first-phase loan.',
    controversy: 'A later request to JICA questioned disclosure of the resettlement plan and compensation or assistance for affected people. The existence of the objection is documented; this sample does not decide its merits.',
    question: 'If a subway reduces congestion, who receives the benefit first—and who bears the cost of making room for it?',
    source: 'https://www.jica.go.jp/oda/project/PH-P267/',
    sources: [
      { label: 'Project and 2018 loan · JICA', url: 'https://www.jica.go.jp/oda/project/PH-P267/' },
      { label: 'Resettlement objection record · JICA', url: 'https://www.jica.go.jp/english/about/policy/environment/objection/philippines_02.html' },
      { label: '2025 Delhi Metro loan · JICA', url: 'https://www.jica.go.jp/english/overseas/india/information/press/2024/1565716_53431.html' }
    ],
    metrics: [
      { value: '25 km', label: 'planned subway length' },
      { value: '13', label: 'underground stations' },
      { value: '¥104.53bn', label: '2018 first-phase loan' }
    ],
    milestones: [
      { year: '2018', label: 'Japan–Philippines loan signed' },
      { year: '2023', label: 'Resettlement objection recorded' },
      { year: '2025', label: 'Delhi comparison: further JICA metro support' }
    ]
  };
  let records = [simulated, opening];
  let activeId = simulated.id;
  let picking = null;
  let selectedYear = 2026;

  if (typeof maplibregl === 'undefined') {
    feedStatus.textContent = 'Map unavailable. Please check your connection and reload.';
    submit.disabled = true;
    return;
  }
  const map = new maplibregl.Map({
    container: 'atlas-map',
    style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    center: [112, 22], zoom: 1.7,
    minZoom: 1, maxZoom: 12,
    attributionControl: false
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-left');
  const emptyCollection = () => ({ type: 'FeatureCollection', features: [] });
  map.on('load', () => {
    map.addSource('atlas-routes', { type: 'geojson', data: emptyCollection() });
    map.addSource('atlas-points', { type: 'geojson', data: emptyCollection() });
    map.addLayer({ id: 'atlas-route-lines', type: 'line', source: 'atlas-routes', paint: { 'line-color': ['case', ['get', 'active'], '#b6372e', '#143c63'], 'line-opacity': ['case', ['get', 'active'], .95, .5], 'line-width': ['case', ['get', 'active'], 4, 2] } });
    map.addLayer({ id: 'atlas-route-points', type: 'circle', source: 'atlas-points', paint: { 'circle-radius': ['case', ['get', 'active'], 8, 5], 'circle-color': ['match', ['get', 'step'], 'japan', '#b6372e', 'nation', '#143c63', '#2f6758'], 'circle-stroke-color': '#fffdf8', 'circle-stroke-width': 2 } });
    map.on('click', 'atlas-route-points', event => {
      if (picking) return;
      const id = event.features?.[0]?.properties?.id;
      if (id) showStory(id);
    });
    renderMap();
    const initialBounds = new maplibregl.LngLatBounds(simulated.japan.point, simulated.japan.point);
    initialBounds.extend(simulated.nation.point).extend(simulated.world.point);
    map.fitBounds(initialBounds, { padding: 75, maxZoom: 2.8, duration: 0 });
  });
  map.on('click', event => {
    if (!picking) return;
    const { lng, lat } = event.lngLat;
    if (picking === 'japan' && (lng < 122 || lng > 154 || lat < 20 || lat > 47)) {
      formStatus.textContent = 'For your first point, choose a place in Japan.';
      return;
    }
    points[picking] = [Number(lng.toFixed(4)), Number(lat.toFixed(4))];
    document.querySelector(`#point-${picking}`).textContent = `${lat.toFixed(2)}° N, ${lng.toFixed(2)}° E`;
    formStatus.textContent = `${picking === 'japan' ? 'Japan' : picking === 'nation' ? 'Nation' : 'Third place'} point chosen.`;
    picking = null;
    document.querySelector('.atlas-map-wrap').classList.remove('is-picking');
    document.querySelectorAll('[data-pick]').forEach(button => button.classList.remove('is-active'));
    document.querySelector('#contribute').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.querySelectorAll('[data-pick]').forEach(button => button.addEventListener('click', () => {
    picking = button.dataset.pick;
    document.querySelectorAll('[data-pick]').forEach(item => item.classList.toggle('is-active', item === button));
    document.querySelector('.atlas-map-wrap').classList.add('is-picking');
    formStatus.textContent = `Click the map to place your ${picking === 'japan' ? 'Japan' : picking === 'nation' ? 'nation' : 'third'} point.`;
    map.flyTo({ center: picking === 'japan' ? [138, 36] : map.getCenter(), zoom: picking === 'japan' ? 4.3 : Math.min(map.getZoom(), 3) });
    document.querySelector('.atlas-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  document.querySelector('#atlas-world').addEventListener('click', () => map.flyTo({ center: [112, 22], zoom: 1.7 }));
  document.querySelector('#atlas-japan').addEventListener('click', () => map.flyTo({ center: [138, 36], zoom: 4.3 }));

  function validPoint(value) {
    return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90;
  }
  function normalizeRecord(raw, alias, title) {
    if (!raw || raw.version !== 1 || typeof raw.id !== 'string' || !validPoint(raw.japan?.point) || !validPoint(raw.nation?.point)) return null;
    const clean = value => typeof value === 'string' ? value.slice(0, 700).trim() : '';
    const source = clean(raw.source);
    if (!/^https?:\/\//i.test(source)) return null;
    return {
      id: raw.id.slice(0, 100), alias: clean(alias).slice(0, 60), title: clean(title).slice(0, 100),
      japan: { place: clean(raw.japan.place), story: clean(raw.japan.story), point: raw.japan.point },
      nation: { name: clean(raw.nation.name), place: clean(raw.nation.place), point: raw.nation.point },
      world: raw.world?.place && validPoint(raw.world.point) ? { place: clean(raw.world.place), point: raw.world.point } : null,
      theme: clean(raw.theme), connection: clean(raw.connection), question: clean(raw.question), source
      ,technology: clean(raw.technology), evidence: clean(raw.evidence), controversy: clean(raw.controversy),
      year: Number.isInteger(Number(raw.year)) && Number(raw.year) >= 1900 && Number(raw.year) <= 2026 ? Number(raw.year) : 2026
    };
  }
  function parseCsv(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (char === '"') { if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted; }
      else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
      else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[index + 1] === '\n') index += 1; row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
      else cell += char;
    }
    row.push(cell); if (row.some(Boolean)) rows.push(row);
    return rows;
  }
  async function refresh() {
    if (!config.feedUrl) {
      feedStatus.textContent = 'Two model stories · live student publishing is being connected.';
      submit.disabled = true;
      feedReady = false;
      renderStories();
      return;
    }
    try {
      const response = await fetch(`${config.feedUrl}${config.feedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Feed returned ${response.status}`);
      const rows = parseCsv(await response.text());
      const headers = (rows.shift() || []).map(value => value.replace(/^\uFEFF/, '').trim().toLowerCase());
      const aliasCol = headers.indexOf('name or alias');
      const titleCol = headers.indexOf('atlas title');
      const recordCol = headers.indexOf('atlas record');
      if ([aliasCol, titleCol, recordCol].includes(-1)) throw new Error('Feed columns do not match the Atlas form.');
      records = rows.flatMap(row => {
        try { const record = normalizeRecord(JSON.parse(row[recordCol]), row[aliasCol], row[titleCol]); return record ? [record] : []; }
        catch { return []; }
      }).reverse();
      records.push(simulated, opening);
      const confirmedIds = new Set(records.map(record => record.id));
      for (let index = drafts.length - 1; index >= 0; index -= 1) if (confirmedIds.has(drafts[index].id)) drafts.splice(index, 1);
      drafts.forEach(draft => records.unshift(draft));
      const studentCount = records.filter(record => !record.kind).length;
      feedStatus.textContent = `${studentCount} class ${studentCount === 1 ? 'submission' : 'submissions'} + two model stories · student stories are not yet fact-checked`;
      feedReady = true;
      submit.disabled = false;
      renderStories(); renderMap();
    } catch (error) {
      feedReady = false;
      feedStatus.textContent = `Live stories unavailable: ${error.message}`;
      submit.disabled = true;
    }
  }
  function renderMap() {
    if (!map.getSource('atlas-routes')) return;
    const lines = [], circles = [];
    records.filter(record => record.year <= selectedYear).forEach(record => {
      const path = [record.japan.point, record.nation.point];
      if (record.world) path.push(record.world.point);
      lines.push({ type: 'Feature', properties: { id: record.id, active: record.id === activeId }, geometry: { type: 'LineString', coordinates: path } });
      path.forEach((point, index) => circles.push({ type: 'Feature', properties: { id: record.id, active: record.id === activeId, step: ['japan', 'nation', 'world'][index] }, geometry: { type: 'Point', coordinates: point } }));
    });
    map.getSource('atlas-routes').setData({ type: 'FeatureCollection', features: lines });
    map.getSource('atlas-points').setData({ type: 'FeatureCollection', features: circles });
  }
  function addText(parent, tag, value) { const node = document.createElement(tag); node.textContent = value; parent.append(node); return node; }
  function renderStories() {
    storyList.replaceChildren();
    const visible = records.filter(record => record.year <= selectedYear);
    if (!visible.length) { const empty = addText(storyList, 'p', records.length ? 'No field notes yet at this point in time.' : 'The map is waiting for its first student story.'); empty.className = 'atlas-empty'; return; }
    visible.forEach(record => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'atlas-story'; button.setAttribute('aria-expanded', String(activeId === record.id));
      addText(button, 'span', `${record.year} / ${record.kind || record.theme}`).className = 'atlas-tag'; addText(button, 'strong', record.title);
      addText(button, 'small', `${record.japan.place} → ${record.nation.name}${record.world ? ` → ${record.world.place}` : ''} · ${record.alias}`);
      button.addEventListener('click', () => showStory(activeId === record.id ? null : record.id)); storyList.append(button);
    });
    renderDossier();
  }
  function renderDossier() {
    dossier.replaceChildren();
    const record = records.find(item => item.id === activeId && item.year <= selectedYear);
    if (!record) { const empty = document.createElement('div'); empty.className = 'atlas-dossier-empty'; addText(empty, 'span', '01 / THE FIRST TRACE'); addText(empty, 'p', 'Choose a route above to read the story behind its line.'); dossier.append(empty); return; }
    const head = document.createElement('header'); head.className = 'atlas-dossier-head';
    addText(head, 'span', `FIELD NOTE / ${record.year} / ${record.alias}`); addText(head, 'h2', record.title);
    addText(head, 'p', `${record.japan.place}, Japan  ↗  ${record.nation.place}, ${record.nation.name}${record.world ? `  ↗  ${record.world.place}` : ''}`);
    dossier.append(head);
    if (record.kind === 'Simulated story') { const notice = addText(dossier, 'p', 'SIMULATED STUDENT STORY · The student and Kashiwa scene are fictional. Project figures, objection, and comparison are linked to JICA records. Map lines show questions, not literal routes.'); notice.className = 'atlas-simulation-notice'; }
    if (record.image) { const figure = document.createElement('figure'); figure.className = 'atlas-dossier-image'; const image = document.createElement('img'); image.src = record.image; image.alt = 'Yoh with a camp leader beside a World Food Programme rice sack from Japan in Banda Aceh'; figure.append(image); addText(figure, 'figcaption', 'Banda Aceh · the photograph that begins this inquiry'); dossier.append(figure); }
    if (record.metrics) { const metrics = document.createElement('div'); metrics.className = 'atlas-dossier-metrics'; record.metrics.forEach(metric => { const item = document.createElement('div'); addText(item, 'strong', metric.value); addText(item, 'span', metric.label); metrics.append(item); }); dossier.append(metrics); }
    if (record.milestones) { const timeline = document.createElement('div'); timeline.className = 'atlas-dossier-timeline'; addText(timeline, 'h3', 'A story in motion'); record.milestones.forEach(moment => { const item = document.createElement('div'); addText(item, 'strong', moment.year); addText(item, 'span', moment.label); timeline.append(item); }); dossier.append(timeline); }
    const grid = document.createElement('div'); grid.className = 'atlas-dossier-grid';
    const chapter = (number, title, body) => { const section = document.createElement('section'); addText(section, 'span', number); addText(section, 'h3', title); addText(section, 'p', body); grid.append(section); };
    chapter('01 / DEPARTURE', 'A place known', record.japan.story);
    chapter('02 / CONNECTION', 'What travels', record.connection);
    chapter('03 / ENGINEERING', record.technology || 'A system at work', `This connection enters the story in ${record.year}.`);
    chapter('04 / EVIDENCE', 'What we can point to', record.evidence || 'See the linked source.');
    chapter('05 / CONTROVERSY', 'What remains unsettled', record.controversy || 'Whose perspective is missing?');
    chapter('06 / NEXT QUESTION', 'Where the inquiry goes', record.question);
    dossier.append(grid);
    const footer = document.createElement('div'); footer.className = 'atlas-dossier-foot';
    const sources = record.sources || [{ label: 'Open the evidence ↗', url: record.source }];
    const links = document.createElement('div'); links.className = 'atlas-evidence-links';
    sources.forEach(source => { const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `${source.label} ↗`; links.append(link); }); footer.append(links);
    addText(footer, 'span', record.kind === 'Simulated story' ? 'SIMULATED / SOURCED PROJECT FACTS' : record.kind ? 'INSTRUCTOR OPENING / MAP POINTS APPROXIMATE' : 'STUDENT-SUBMITTED / NOT FACT-CHECKED'); dossier.append(footer);
  }
  function showStory(id) {
    activeId = id; renderStories(); renderMap();
    const record = records.find(item => item.id === id);
    if (!record) return;
    const points = [record.japan.point, record.nation.point, ...(record.world ? [record.world.point] : [])];
    const bounds = new maplibregl.LngLatBounds(points[0], points[0]); points.slice(1).forEach(point => bounds.extend(point));
    map.fitBounds(bounds, { padding: 70, maxZoom: 5, duration: 850 });
    dossier.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  yearInput.addEventListener('input', () => {
    selectedYear = Number(yearInput.value); yearLabel.textContent = String(selectedYear);
    if (records.find(record => record.id === activeId)?.year > selectedYear) activeId = null;
    renderStories(); renderMap();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!config.feedUrl) { formStatus.textContent = 'Publishing is not ready yet. Your story has not been sent.'; return; }
    if (!points.japan || !points.nation) { formStatus.textContent = 'Choose both the Japan and nation points on the map.'; return; }
    const values = Object.fromEntries(new FormData(form));
    if (values.worldPlace && !points.world) { formStatus.textContent = 'Choose a map point for the third place, or leave that place blank.'; return; }
    const record = { version: 1, id: crypto.randomUUID(), japan: { place: values.japanPlace.trim(), story: values.localStory.trim(), point: points.japan }, nation: { name: values.nation.trim(), place: values.nationPlace.trim(), point: points.nation }, world: values.worldPlace ? { place: values.worldPlace.trim(), point: points.world } : null, theme: values.theme, technology: values.technology.trim(), year: Number(values.year), connection: values.connection.trim(), evidence: values.evidence.trim(), controversy: values.controversy.trim(), source: values.source.trim(), question: values.question.trim() };
    submit.disabled = true; formStatus.textContent = 'Sending your route…';
    try {
      const body = new URLSearchParams({ [config.fields.alias]: values.alias.trim(), [config.fields.title]: values.title.trim(), [config.fields.record]: JSON.stringify(record) });
      await fetch(config.formResponseUrl, { method: 'POST', mode: 'no-cors', credentials: 'omit', body });
      const draft = normalizeRecord(record, values.alias, values.title); draft.kind = 'Awaiting confirmation'; drafts.unshift(draft);
      records.unshift(draft); activeId = draft.id; renderStories(); renderMap();
      form.reset(); Object.keys(points).forEach(key => { points[key] = null; document.querySelector(`#point-${key}`).textContent = 'Not chosen'; });
      formStatus.textContent = 'Sent to Google. Your route is shown provisionally; it will be confirmed when it appears in the live class feed.';
      await refresh();
    } catch {
      formStatus.textContent = 'Could not send this route. Nothing was confirmed; please try again.';
    } finally { submit.disabled = !feedReady; }
  });
  refresh(); setInterval(refresh, 30000);
})();
