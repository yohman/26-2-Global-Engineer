const allowedOrigins = new Set([
  'https://yohman.github.io',
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]);

function cors(origin) {
  return allowedOrigins.has(origin) ? {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  } : { 'Vary': 'Origin' };
}

function json(data, status, origin) {
  return Response.json(data, { status, headers: { ...cors(origin), 'Cache-Control': 'no-store' } });
}

function text(value, maximum) {
  return String(value ?? '').trim().slice(0, maximum);
}

function point(value) {
  if (!Array.isArray(value) || value.length !== 2) throw new Error('Invalid map point');
  const [lng, lat] = value.map(Number);
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) throw new Error('Invalid map point');
  return [lng, lat];
}

function url(value) {
  const input = text(value, 500);
  if (!input) return '';
  const parsed = new URL(input);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid media URL');
  return parsed.href;
}

function year(value) {
  if (value === '' || value == null) return null;
  const result = Number(value);
  if (!Number.isInteger(result) || result < 1900 || result > 2100) throw new Error('Invalid year');
  return result;
}

function cleanStory(input, id) {
  if (!input || input.id !== id || !/^journey-[A-Za-z0-9-]{8,70}$/.test(id)) throw new Error('Invalid story ID');
  if (!Array.isArray(input.hops) || input.hops.length < 1 || input.hops.length > 25) throw new Error('A story needs 1–25 connections');
  const alias = text(input.alias, 60);
  if (!alias) throw new Error('Name or alias required');
  const color = text(input.marker?.color, 7);
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Invalid marker color');
  const symbol = text(input.marker?.symbol, 12);
  if (!symbol) throw new Error('Marker symbol required');
  const origin = input.origin || {};
  if (!text(origin.place, 100)) throw new Error('Starting place required');
  const cleaned = {
    id,
    alias,
    title: text(input.title, 120),
    marker: { color, symbol },
    origin: {
      place: text(origin.place, 100),
      point: point(origin.point),
      year: year(origin.year),
      engineering: text(origin.engineering, 700)
    },
    hops: input.hops.map(hop => {
      if (!text(hop?.country, 100)) throw new Error('Connection country required');
      return {
        country: text(hop.country, 100),
        place: text(hop.place, 100),
        point: point(hop.point),
        year: year(hop.year),
        lens: text(hop.lens, 40),
        reason: text(hop.reason, 500),
        trace: text(hop.trace, 700),
        mediaUrl: url(hop.mediaUrl)
      };
    })
  };
  if (new TextEncoder().encode(JSON.stringify(cleaned)).length > 18000) throw new Error('Story is too long');
  return cleaned;
}

function equalSecret(a, b) {
  const one = new TextEncoder().encode(a || '');
  const two = new TextEncoder().encode(b || '');
  let diff = one.length ^ two.length;
  for (let i = 0; i < Math.max(one.length, two.length); i++) diff |= (one[i] || 0) ^ (two[i] || 0);
  return diff === 0 && one.length > 0;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const path = new URL(request.url).pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (path === '/stories' && request.method === 'GET') {
      const rows = await env.DB.prepare('SELECT record, revision, updated_at FROM stories ORDER BY updated_at DESC LIMIT 20').all();
      return json({ stories: rows.results.map(row => ({ ...JSON.parse(row.record), revision: row.revision, updatedAt: row.updated_at })) }, 200, origin);
    }
    const match = /^\/stories\/(journey-[A-Za-z0-9-]{8,70})$/.exec(path);
    if (!match || request.method !== 'PUT') return json({ error: 'Not found' }, 404, origin);
    if (origin && !allowedOrigins.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
    if (!equalSecret(request.headers.get('Authorization')?.replace(/^Bearer /, ''), env.CLASS_PASSWORD)) return json({ error: 'Class password rejected' }, 401, origin);
    try {
      if (Number(request.headers.get('Content-Length')) > 20000) throw new Error('Story is too long');
      const body = await request.text();
      if (new TextEncoder().encode(body).length > 20000) throw new Error('Story is too long');
      const payload = JSON.parse(body);
      const revision = Number(payload.revision);
      if (!Number.isInteger(revision) || revision < 0) throw new Error('Invalid revision');
      const story = cleanStory(payload.story, match[1]);
      const timestamp = new Date().toISOString();
      if (revision === 0) {
        const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM stories').first();
        if (count.total >= 12) return json({ error: 'Class Atlas is full' }, 409, origin);
        const result = await env.DB.prepare('INSERT OR IGNORE INTO stories (id, record, revision, updated_at) VALUES (?, ?, 1, ?)')
          .bind(story.id, JSON.stringify(story), timestamp).run();
        if (!result.meta.changes) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
      } else {
        const result = await env.DB.prepare('UPDATE stories SET record = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?')
          .bind(JSON.stringify(story), timestamp, story.id, revision).run();
        if (!result.meta.changes) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
      }
      return json({ ok: true, revision: revision + 1, updatedAt: timestamp }, 200, origin);
    } catch (error) {
      return json({ error: error instanceof SyntaxError ? 'Invalid story JSON' : error.message }, 400, origin);
    }
  }
};
