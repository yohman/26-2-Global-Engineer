const allowedOrigins = new Set([
  'https://yohman.github.io',
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]);
const storyIdPattern = /^journey-[A-Za-z0-9-]{8,70}$/;
const imageIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const imageLimit = 700000;
const instructorEmail = 'ykawano@reitaku.ac.jp';
const builtinIds = new Set(['yoh-draft', 'simulated-mina']);

function cors(origin) {
  return allowedOrigins.has(origin) ? {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  } : { Vary: 'Origin' };
}

function json(data, status, origin) {
  return Response.json(data, { status, headers: { ...cors(origin), 'Cache-Control': 'no-store' } });
}

function text(value, maximum) {
  return String(value ?? '').trim().slice(0, maximum);
}

function emailAddress(value) {
  const valueText = text(value, 255).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueText) || valueText.length > 254) throw new Error('Enter a valid email address');
  return valueText;
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

function imageId(value) {
  const id = text(value, 36);
  if (id && !imageIdPattern.test(id)) throw new Error('Invalid image reference');
  return id;
}

function cleanStory(input, id) {
  if (!input || input.id !== id || !storyIdPattern.test(id)) throw new Error('Invalid story ID');
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
    id, alias, title: text(input.title, 120),
    marker: { color, symbol },
    origin: {
      country: text(origin.country, 100) || 'Japan',
      place: text(origin.place, 100),
      point: point(origin.point),
      year: year(origin.year),
      engineering: text(origin.engineering, 2000),
      trace: text(origin.trace, 700),
      mediaUrl: url(origin.mediaUrl),
      imageId: imageId(origin.imageId)
    },
    hops: input.hops.map((hop, index) => {
      if (!text(hop?.country, 100)) throw new Error('Connection country required');
      const fromIndex = hop.fromIndex === undefined ? index : Number(hop.fromIndex);
      if (!Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex > index) throw new Error('Invalid connection origin');
      return {
        country: text(hop.country, 100),
        fromIndex,
        place: text(hop.place, 100),
        point: point(hop.point),
        year: year(hop.year),
        lens: text(hop.lens, 40),
        tags: Array.isArray(hop.tags) ? hop.tags.slice(0, 4).map(value => text(value, 40)).filter(Boolean) : [],
        reason: text(hop.reason, 2000),
        trace: text(hop.trace, 700),
        mediaUrl: url(hop.mediaUrl),
        imageId: imageId(hop.imageId)
      };
    })
  };
  if (new TextEncoder().encode(JSON.stringify(cleaned)).length > 20000) throw new Error('Story is too long');
  return cleaned;
}

function cleanBuiltinStory(input, id) {
  if (!builtinIds.has(id) || input?.id !== id) throw new Error('Invalid built-in journey');
  const temporaryId = `journey-builtin-${id}`;
  const cleaned = cleanStory({ ...input, id: temporaryId }, temporaryId);
  const extra = moment => ({
    dateLabel: text(moment?.dateLabel, 50),
    period: text(moment?.period, 80),
    beat: text(moment?.beat, 60),
    engineering: text(moment?.engineering, 2000),
    image: /^lectures\/assets\/[A-Za-z0-9._-]+$/.test(moment?.image || '') ? moment.image : '',
    imageAlt: text(moment?.imageAlt, 200),
    sourceLabel: text(moment?.sourceLabel, 80),
    costUrl: url(moment?.costUrl)
  });
  cleaned.id = id;
  cleaned.kicker = text(input.kicker, 120);
  cleaned.simulated = id === 'simulated-mina';
  cleaned.origin = { ...cleaned.origin, ...extra(input.origin) };
  cleaned.hops = cleaned.hops.map((hop, index) => ({ ...hop, ...extra(input.hops[index]) }));
  if (new TextEncoder().encode(JSON.stringify(cleaned)).length > 30000) throw new Error('Story is too long');
  return cleaned;
}

function equalSecret(a, b) {
  const one = new TextEncoder().encode(a || '');
  const two = new TextEncoder().encode(b || '');
  let diff = one.length ^ two.length;
  for (let i = 0; i < Math.max(one.length, two.length); i++) diff |= (one[i] || 0) ^ (two[i] || 0);
  return diff === 0 && one.length > 0;
}

async function tokenHash(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function adminTokenHash(token, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(token));
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function bearer(request) {
  const match = /^Bearer ([A-Za-z0-9_-]{32,100})$/.exec(request.headers.get('Authorization') || '');
  return match?.[1] || '';
}

async function prepareTables(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS authors (email TEXT PRIMARY KEY, joined_at TEXT NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at TEXT NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at TEXT NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS story_images (id TEXT PRIMARY KEY, story_id TEXT NOT NULL, owner_email TEXT NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS hidden_builtins (id TEXT PRIMARY KEY, hidden_at TEXT NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS builtin_overrides (id TEXT PRIMARY KEY, record TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)').run();
}

async function sessionFor(request, env) {
  const token = bearer(request);
  if (!token) return null;
  const db = env.DB;
  await db.prepare('CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at TEXT NOT NULL)').run();
  const hash = await tokenHash(token);
  const adminHash = env.ADMIN_PASSWORD && !equalSecret(env.ADMIN_PASSWORD, env.CLASS_PASSWORD)
    ? await adminTokenHash(token, env.ADMIN_PASSWORD) : '';
  const admin = adminHash ? await db.prepare('SELECT email, expires_at FROM admin_sessions WHERE token_hash = ?').bind(adminHash).first() : null;
  if (admin && admin.email === instructorEmail && Date.parse(admin.expires_at) > Date.now()) return { email: admin.email, admin: true, token };
  const row = await db.prepare('SELECT email, expires_at FROM sessions WHERE token_hash = ?').bind(hash).first();
  return row && row.email !== instructorEmail && Date.parse(row.expires_at) > Date.now() ? { email: row.email, admin: false, token } : null;
}

function publicStory(row, session) {
  const { ownerEmail, ...story } = JSON.parse(row.record);
  return { ...story, revision: row.revision, updatedAt: row.updated_at, editable: Boolean(session && (session.admin || ownerEmail === session.email)) };
}

function validImage(bytes, mime) {
  if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const path = new URL(request.url).pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (origin && !allowedOrigins.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);

    if (path === '/session' && request.method === 'POST') {
      if (Number(request.headers.get('Content-Length')) > 1000) return json({ error: 'Request too large' }, 413, origin);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400, origin); }
      let email;
      try { email = emailAddress(body.email); } catch (error) { return json({ error: error.message }, 400, origin); }
      const admin = email === instructorEmail;
      if (admin && (!env.ADMIN_PASSWORD || equalSecret(env.ADMIN_PASSWORD, env.CLASS_PASSWORD))) return json({ error: 'Instructor access is not configured' }, 503, origin);
      if (!equalSecret(body.password, admin ? env.ADMIN_PASSWORD : env.CLASS_PASSWORD)) return json({ error: admin ? 'Instructor password rejected' : 'Class password rejected' }, 401, origin);
      await prepareTables(env.DB);
      const token = [...crypto.getRandomValues(new Uint8Array(32))].map(byte => byte.toString(16).padStart(2, '0')).join('');
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT OR IGNORE INTO authors (email, joined_at) VALUES (?, ?)').bind(email, now).run();
      await env.DB.prepare(admin ? 'INSERT INTO admin_sessions (token_hash, email, expires_at) VALUES (?, ?, ?)' : 'INSERT INTO sessions (token_hash, email, expires_at) VALUES (?, ?, ?)').bind(admin ? await adminTokenHash(token, env.ADMIN_PASSWORD) : await tokenHash(token), email, expiresAt).run();
      return json({ token, email, admin, expiresAt }, 200, origin);
    }

    if (path === '/stories' && request.method === 'GET') {
      const session = bearer(request) ? await sessionFor(request, env) : null;
      await env.DB.prepare('CREATE TABLE IF NOT EXISTS hidden_builtins (id TEXT PRIMARY KEY, hidden_at TEXT NOT NULL)').run();
      await env.DB.prepare('CREATE TABLE IF NOT EXISTS builtin_overrides (id TEXT PRIMARY KEY, record TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)').run();
      const rows = await env.DB.prepare('SELECT record, revision, updated_at FROM stories ORDER BY updated_at DESC LIMIT 20').all();
      const hidden = await env.DB.prepare('SELECT id FROM hidden_builtins').all();
      const overrides = await env.DB.prepare('SELECT id, record, revision, updated_at FROM builtin_overrides').all();
      const builtinOverrides = Object.fromEntries(overrides.results.filter(row => builtinIds.has(row.id)).map(row => [row.id, { ...JSON.parse(row.record), revision: row.revision, updatedAt: row.updated_at, editable: Boolean(session?.admin) }]));
      return json({ stories: rows.results.map(row => publicStory(row, session)), hiddenBuiltins: hidden.results.map(row => row.id), builtinOverrides }, 200, origin);
    }

    const builtinStoryMatch = /^\/builtins\/([A-Za-z0-9-]+)\/story$/.exec(path);
    if (builtinStoryMatch && request.method === 'PUT') {
      if (!builtinIds.has(builtinStoryMatch[1])) return json({ error: 'Journey not found' }, 404, origin);
      const session = await sessionFor(request, env);
      if (!session) return json({ error: 'Sign in again' }, 401, origin);
      if (!session.admin) return json({ error: 'Instructor access required' }, 403, origin);
      try {
        if (Number(request.headers.get('Content-Length')) > 33000) throw new Error('Story is too long');
        const body = await request.text();
        if (new TextEncoder().encode(body).length > 33000) throw new Error('Story is too long');
        const payload = JSON.parse(body);
        const revision = Number(payload.revision);
        if (!Number.isInteger(revision) || revision < 0) throw new Error('Invalid revision');
        const story = cleanBuiltinStory(payload.story, builtinStoryMatch[1]);
        await env.DB.prepare('CREATE TABLE IF NOT EXISTS builtin_overrides (id TEXT PRIMARY KEY, record TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)').run();
        const existing = await env.DB.prepare('SELECT record, revision FROM builtin_overrides WHERE id = ?').bind(story.id).first();
        if (revision !== (existing?.revision || 0)) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
        for (const id of [story.origin, ...story.hops].map(moment => moment.imageId).filter(Boolean)) {
          const image = await env.DB.prepare('SELECT id FROM story_images WHERE id = ? AND story_id = ?').bind(id, story.id).first();
          if (!image) throw new Error('Image is not part of this journey');
        }
        const updatedAt = new Date().toISOString();
        if (existing) {
          const result = await env.DB.prepare('UPDATE builtin_overrides SET record = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(story), updatedAt, story.id, revision).run();
          if (!result.meta.changes) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
        } else {
          const result = await env.DB.prepare('INSERT OR IGNORE INTO builtin_overrides (id, record, revision, updated_at) VALUES (?, ?, 1, ?)').bind(story.id, JSON.stringify(story), updatedAt).run();
          if (!result.meta.changes) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
        }
        return json({ ok: true, revision: revision + 1, updatedAt }, 200, origin);
      } catch (error) {
        return json({ error: error instanceof SyntaxError ? 'Invalid story JSON' : error.message }, 400, origin);
      }
    }

    const builtinMatch = /^\/builtins\/([A-Za-z0-9-]+)$/.exec(path);
    if (builtinMatch && ['DELETE', 'PUT'].includes(request.method)) {
      if (!builtinIds.has(builtinMatch[1])) return json({ error: 'Journey not found' }, 404, origin);
      const session = await sessionFor(request, env);
      if (!session) return json({ error: 'Sign in again' }, 401, origin);
      if (!session.admin) return json({ error: 'Instructor access required' }, 403, origin);
      await env.DB.prepare('CREATE TABLE IF NOT EXISTS hidden_builtins (id TEXT PRIMARY KEY, hidden_at TEXT NOT NULL)').run();
      if (request.method === 'DELETE') {
        await env.DB.prepare('INSERT OR REPLACE INTO hidden_builtins (id, hidden_at) VALUES (?, ?)').bind(builtinMatch[1], new Date().toISOString()).run();
      } else {
        await env.DB.prepare('DELETE FROM hidden_builtins WHERE id = ?').bind(builtinMatch[1]).run();
      }
      return json({ ok: true }, 200, origin);
    }

    if (path === '/session' && request.method === 'GET') {
      const session = await sessionFor(request, env);
      return session ? json({ email: session.email, admin: session.admin }, 200, origin) : json({ error: 'Sign in again' }, 401, origin);
    }
    if (path === '/session' && request.method === 'DELETE') {
      const token = bearer(request);
      if (token) {
        const hash = await tokenHash(token);
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
        if (env.ADMIN_PASSWORD && !equalSecret(env.ADMIN_PASSWORD, env.CLASS_PASSWORD)) {
          await env.DB.prepare('CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at TEXT NOT NULL)').run();
          await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await adminTokenHash(token, env.ADMIN_PASSWORD)).run();
        }
      }
      return json({ ok: true }, 200, origin);
    }

    const imageMatch = /^\/images\/([0-9a-f-]{36})$/i.exec(path);
    if (imageMatch && request.method === 'GET' && imageIdPattern.test(imageMatch[1])) {
      const row = await env.DB.prepare('SELECT mime, data FROM story_images WHERE id = ?').bind(imageMatch[1]).first();
      if (!row) return json({ error: 'Image not found' }, 404, origin);
      return new Response(new Uint8Array(row.data), {
        headers: { ...cors(origin), 'Content-Type': row.mime, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' }
      });
    }

    const imageUpload = /^\/(stories|builtins)\/(journey-[A-Za-z0-9-]{8,70}|yoh-draft|simulated-mina)\/images$/.exec(path);
    if (imageUpload && request.method === 'POST') {
      const session = await sessionFor(request, env);
      if (!session) return json({ error: 'Sign in again' }, 401, origin);
      const builtin = imageUpload[1] === 'builtins', storyId = imageUpload[2];
      if (builtin && (!session.admin || !builtinIds.has(storyId))) return json({ error: 'Instructor access required' }, 403, origin);
      if (!builtin) {
        if (!storyIdPattern.test(storyId)) return json({ error: 'Journey not found' }, 404, origin);
        const row = await env.DB.prepare('SELECT record FROM stories WHERE id = ?').bind(storyId).first();
        if (!row || (!session.admin && JSON.parse(row.record).ownerEmail !== session.email)) return json({ error: 'This is not your journey' }, 403, origin);
      }
      if (Number(request.headers.get('Content-Length')) > imageLimit) return json({ error: 'Image must be under 700 KB' }, 413, origin);
      const bytes = new Uint8Array(await request.arrayBuffer());
      const mime = (request.headers.get('Content-Type') || '').split(';')[0].toLowerCase();
      if (!bytes.length || bytes.length > imageLimit || !validImage(bytes, mime)) return json({ error: 'Use a JPEG, PNG, or WebP image under 700 KB' }, 400, origin);
      const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM story_images WHERE story_id = ?').bind(storyId).first();
      if (count.total >= 30) return json({ error: 'Image limit reached for this journey' }, 409, origin);
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO story_images (id, story_id, owner_email, mime, data, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, storyId, session.email, mime, bytes, new Date().toISOString()).run();
      return json({ imageId: id }, 201, origin);
    }

    const match = /^\/stories\/(journey-[A-Za-z0-9-]{8,70})$/.exec(path);
    if (!match || !['PUT', 'DELETE'].includes(request.method)) return json({ error: 'Not found' }, 404, origin);
    const session = await sessionFor(request, env);
    if (!session) return json({ error: 'Sign in again' }, 401, origin);
    const existing = await env.DB.prepare('SELECT record, revision FROM stories WHERE id = ?').bind(match[1]).first();
    if (existing && !session.admin && JSON.parse(existing.record).ownerEmail !== session.email) return json({ error: 'This is not your journey' }, 403, origin);
    try {
      if (Number(request.headers.get('Content-Length')) > 23000) throw new Error('Story is too long');
      const body = await request.text();
      if (new TextEncoder().encode(body).length > 23000) throw new Error('Story is too long');
      const payload = JSON.parse(body);
      const revision = Number(payload.revision);
      if (!Number.isInteger(revision) || revision < 0) throw new Error('Invalid revision');
      if (request.method === 'DELETE') {
        if (!existing) return json({ error: 'Journey not found' }, 404, origin);
        const result = await env.DB.prepare('DELETE FROM stories WHERE id = ? AND revision = ?').bind(match[1], revision).run();
        if (!result.meta.changes) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
        await env.DB.prepare('DELETE FROM story_images WHERE story_id = ?').bind(match[1]).run();
        return json({ ok: true }, 200, origin);
      }
      const story = cleanStory(payload.story, match[1]);
      const imageIds = [story.origin, ...story.hops].map(moment => moment.imageId).filter(Boolean);
      for (const id of imageIds) {
        const row = await env.DB.prepare('SELECT id FROM story_images WHERE id = ? AND story_id = ?').bind(id, story.id).first();
        if (!row) throw new Error('Image is not part of this journey');
      }
      const timestamp = new Date().toISOString();
      const ownerEmail = existing ? JSON.parse(existing.record).ownerEmail : session.email;
      const record = JSON.stringify({ ...story, ownerEmail });
      if (revision === 0) {
        if (existing) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
        const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM stories').first();
        if (count.total >= 12) return json({ error: 'Class Atlas is full' }, 409, origin);
        const result = await env.DB.prepare('INSERT OR IGNORE INTO stories (id, record, revision, updated_at) VALUES (?, ?, 1, ?)')
          .bind(story.id, record, timestamp).run();
        if (!result.meta.changes) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
      } else {
        if (!existing) return json({ error: 'Journey not found' }, 404, origin);
        const result = await env.DB.prepare('UPDATE stories SET record = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?')
          .bind(record, timestamp, story.id, revision).run();
        if (!result.meta.changes) return json({ error: 'Story changed elsewhere. Reload before saving.' }, 409, origin);
      }
      return json({ ok: true, revision: revision + 1, updatedAt: timestamp }, 200, origin);
    } catch (error) {
      return json({ error: error instanceof SyntaxError ? 'Invalid story JSON' : error.message }, 400, origin);
    }
  }
};
