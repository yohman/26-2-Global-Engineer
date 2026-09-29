import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const siteOrigin = 'https://yohman.github.io';
const story = {
  id: 'journey-test1234', alias: 'Student', marker: { color: '#20567c', symbol: '旅' },
  origin: { country: 'Japan', place: 'Kashiwa', point: [139.9, 35.8] },
  hops: [{ country: 'Philippines', point: [121, 14], reason: 'A rail connection', lens: 'Infrastructure' }]
};

function database() {
  const authors = new Map(), sessions = new Map(), adminSessions = new Map(), stories = new Map(), images = new Map(), hiddenBuiltins = new Map(), builtinOverrides = new Map();
  return {
    authors, stories,
    prepare(query) {
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async first() {
          if (query.includes('FROM admin_sessions')) return adminSessions.get(args[0]) || null;
          if (query.includes('FROM sessions')) return sessions.get(args[0]) || null;
          if (query.includes('FROM story_images') && query.includes('COUNT')) return { total: [...images.values()].filter(image => image.story_id === args[0]).length };
          if (query.includes('FROM story_images')) {
            const image = images.get(args[0]);
            return image && (!args[1] || (image.story_id === args[1] && (!query.includes('owner_email = ?') || image.owner_email === args[2]))) ? image : null;
          }
          if (query.includes('FROM builtin_overrides')) return builtinOverrides.get(args[0]) || null;
          if (query.includes('FROM stories') && query.includes('COUNT')) return { total: stories.size };
          if (query.includes('FROM stories')) return stories.get(args[0]) || null;
          return null;
        },
        async all() {
          if (query.includes('FROM hidden_builtins')) return { results: [...hiddenBuiltins.keys()].map(id => ({ id })) };
          if (query.includes('FROM builtin_overrides')) return { results: [...builtinOverrides.entries()].map(([id, row]) => ({ id, ...row })) };
          return { results: [...stories.values()] };
        },
        async run() {
          if (query.startsWith('CREATE TABLE')) return { meta: { changes: 0 } };
          if (query.startsWith('INSERT OR IGNORE INTO authors')) { authors.set(args[0], { email: args[0] }); return { meta: { changes: 1 } }; }
          if (query.startsWith('INSERT INTO sessions')) { sessions.set(args[0], { email: args[1], expires_at: args[2] }); return { meta: { changes: 1 } }; }
          if (query.startsWith('INSERT INTO admin_sessions')) { adminSessions.set(args[0], { email: args[1], expires_at: args[2] }); return { meta: { changes: 1 } }; }
          if (query.startsWith('DELETE FROM sessions')) { sessions.delete(args[0]); return { meta: { changes: 1 } }; }
          if (query.startsWith('DELETE FROM admin_sessions')) { adminSessions.delete(args[0]); return { meta: { changes: 1 } }; }
          if (query.startsWith('INSERT OR REPLACE INTO hidden_builtins')) { hiddenBuiltins.set(args[0], args[1]); return { meta: { changes: 1 } }; }
          if (query.startsWith('DELETE FROM hidden_builtins')) { hiddenBuiltins.delete(args[0]); return { meta: { changes: 1 } }; }
          if (query.startsWith('INSERT OR IGNORE INTO builtin_overrides')) {
            if (builtinOverrides.has(args[0])) return { meta: { changes: 0 } };
            builtinOverrides.set(args[0], { record: args[1], revision: 1, updated_at: args[2] });
            return { meta: { changes: 1 } };
          }
          if (query.startsWith('UPDATE builtin_overrides')) {
            const current = builtinOverrides.get(args[2]);
            if (!current || current.revision !== args[3]) return { meta: { changes: 0 } };
            builtinOverrides.set(args[2], { record: args[0], revision: current.revision + 1, updated_at: args[1] });
            return { meta: { changes: 1 } };
          }
          if (query.startsWith('INSERT INTO story_images')) { images.set(args[0], { id: args[0], story_id: args[1], owner_email: args[2], mime: args[3], data: [...args[4]] }); return { meta: { changes: 1 } }; }
          if (query.startsWith('DELETE FROM story_images')) {
            for (const [id, image] of images) if (image.story_id === args[0]) images.delete(id);
            return { meta: { changes: 1 } };
          }
          if (query.startsWith('INSERT OR IGNORE INTO stories')) {
            if (stories.has(args[0])) return { meta: { changes: 0 } };
            stories.set(args[0], { record: args[1], revision: 1, updated_at: args[2] });
            return { meta: { changes: 1 } };
          }
          if (query.startsWith('UPDATE stories')) {
            const current = stories.get(args[2]);
            if (!current || current.revision !== args[3]) return { meta: { changes: 0 } };
            stories.set(args[2], { record: args[0], revision: current.revision + 1, updated_at: args[1] });
            return { meta: { changes: 1 } };
          }
          if (query.startsWith('DELETE FROM stories')) {
            const current = stories.get(args[0]);
            if (!current || current.revision !== args[1]) return { meta: { changes: 0 } };
            stories.delete(args[0]);
            return { meta: { changes: 1 } };
          }
          throw new Error('Unexpected query: ' + query);
        }
      };
    }
  };
}

function request(path, method = 'GET', body, token, origin = siteOrigin, contentType = 'application/json') {
  const headers = { Origin: origin };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = contentType;
  return new Request(`https://atlas.example${path}`, {
    method, headers, body: body === undefined ? undefined : contentType === 'application/json' ? JSON.stringify(body) : body
  });
}

async function login(db, email = 'student@example.edu', password = 'class-secret') {
  const response = await worker.fetch(request('/session', 'POST', { email, password }), { DB: db, CLASS_PASSWORD: 'class-secret' });
  return { response, data: await response.json() };
}

test('session identifies author without exposing email in public stories', async () => {
  const db = database(), env = { DB: db, CLASS_PASSWORD: 'class-secret' };
  const { response, data } = await login(db);
  assert.equal(response.status, 200);
  assert.equal(data.email, 'student@example.edu');
  assert.equal(db.authors.has('student@example.edu'), true);
  let result = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story, revision: 0 }, data.token), env);
  assert.equal(result.status, 200);
  assert.equal((await result.json()).revision, 1);
  result = await worker.fetch(request('/stories'), env);
  const publicList = await result.json();
  assert.equal(publicList.stories[0].editable, false);
  assert.equal(JSON.stringify(publicList).includes('student@example.edu'), false);
  result = await worker.fetch(request('/stories', 'GET', undefined, data.token), env);
  assert.equal((await result.json()).stories[0].editable, true);
  const other = await login(db, 'other@example.edu');
  result = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story, revision: 1 }, other.data.token), env);
  assert.equal(result.status, 403);
  result = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story: { ...story, title: 'Revised' }, revision: 1 }, data.token), env);
  assert.equal((await result.json()).revision, 2);
  result = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story, revision: 1 }, data.token), env);
  assert.equal(result.status, 409);
  result = await worker.fetch(request(`/stories/${story.id}`, 'DELETE', { revision: 2 }, data.token), env);
  assert.equal(result.status, 200);
  result = await worker.fetch(request('/stories'), env);
  assert.equal((await result.json()).stories.length, 0);
});

test('image upload is owner-only and can be attached to a frame', async () => {
  const db = database(), env = { DB: db, CLASS_PASSWORD: 'class-secret' };
  const { data } = await login(db);
  await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story, revision: 0 }, data.token), env);
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  let result = await worker.fetch(request(`/stories/${story.id}/images`, 'POST', png, data.token, siteOrigin, 'image/png'), env);
  assert.equal(result.status, 201);
  const { imageId } = await result.json();
  result = await worker.fetch(request(`/images/${imageId}`), env);
  assert.equal(result.headers.get('Content-Type'), 'image/png');
  assert.deepEqual(new Uint8Array(await result.arrayBuffer()), png);
  const updated = { ...story, hops: [{ ...story.hops[0], imageId }] };
  result = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story: updated, revision: 1 }, data.token), env);
  assert.equal(result.status, 200);
  result = await worker.fetch(request('/stories'), env);
  assert.equal((await result.json()).stories[0].hops[0].imageId, imageId);
  const other = await login(db, 'other@example.edu');
  result = await worker.fetch(request(`/stories/${story.id}/images`, 'POST', png, other.data.token, siteOrigin, 'image/png'), env);
  assert.equal(result.status, 403);
});

test('reject invalid password, unsafe links, and unauthenticated writes', async () => {
  const db = database(), env = { DB: db, CLASS_PASSWORD: 'class-secret' };
  assert.equal((await login(db, 'student@example.edu', 'wrong')).response.status, 401);
  assert.equal((await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story, revision: 0 }), env)).status, 401);
  const { data } = await login(db);
  const unsafe = { ...story, hops: [{ ...story.hops[0], mediaUrl: 'javascript:alert(1)' }] };
  assert.equal((await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story: unsafe, revision: 0 }, data.token), env)).status, 400);
  assert.equal((await worker.fetch(request('/stories', 'GET', undefined, undefined, 'https://unrelated.example'), env)).status, 403);
});

test('stores branching origins and rejects connections to a future marker', async () => {
  const db = database(), env = { DB: db, CLASS_PASSWORD: 'class-secret' };
  const { data } = await login(db);
  const branched = { ...story, hops: [
    { ...story.hops[0], fromIndex: 0 },
    { country: 'Colombia', point: [-74, 4], reason: 'A second branch', fromIndex: 0 },
    { country: 'Thailand', point: [100, 14], reason: 'Continue from Colombia', fromIndex: 2 }
  ] };
  let response = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story: branched, revision: 0 }, data.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/stories'), env);
  assert.deepEqual((await response.json()).stories[0].hops.map(hop => hop.fromIndex), [0, 0, 2]);
  const invalid = { ...branched, hops: branched.hops.map((hop, index) => index === 1 ? { ...hop, fromIndex: 2 } : hop) };
  response = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story: invalid, revision: 1 }, data.token), env);
  assert.equal(response.status, 400);
});

test('instructor secret grants access to every story without taking student ownership', async () => {
  const db = database(), env = { DB: db, CLASS_PASSWORD: 'class-secret', ADMIN_PASSWORD: 'different-instructor-secret' };
  const student = await login(db);
  let response = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story, revision: 0 }, student.data.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/session', 'POST', { email: 'ykawano@reitaku-u.co.jp', password: 'class-secret' }), env);
  assert.equal(response.status, 401);
  response = await worker.fetch(request('/session', 'POST', { email: 'ykawano@reitaku-u.co.jp', password: 'different-instructor-secret' }), env);
  assert.equal(response.status, 200);
  const instructor = await response.json();
  assert.equal(instructor.admin, true);
  response = await worker.fetch(request('/session', 'GET', undefined, instructor.token), { ...env, ADMIN_PASSWORD: 'rotated-instructor-secret' });
  assert.equal(response.status, 401);
  response = await worker.fetch(request('/stories', 'GET', undefined, instructor.token), env);
  assert.equal((await response.json()).stories[0].editable, true);
  response = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story: { ...story, title: 'Instructor edit' }, revision: 1 }, instructor.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/stories', 'GET', undefined, student.data.token), env);
  assert.equal((await response.json()).stories[0].editable, true);
  assert.equal(JSON.parse(db.stories.get(story.id).record).ownerEmail, 'student@example.edu');
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  response = await worker.fetch(request(`/stories/${story.id}/images`, 'POST', png, instructor.token, siteOrigin, 'image/png'), env);
  assert.equal(response.status, 201);
  const { imageId } = await response.json();
  response = await worker.fetch(request(`/stories/${story.id}`, 'PUT', { story: { ...story, title: 'Student edit', hops: [{ ...story.hops[0], imageId }] }, revision: 2 }, student.data.token), env);
  assert.equal(response.status, 200);
  const legacyId = 'journey-ownerless1234';
  db.stories.set(legacyId, { record: JSON.stringify({ ...story, id: legacyId }), revision: 1, updated_at: new Date().toISOString() });
  response = await worker.fetch(request('/stories', 'GET', undefined, instructor.token), env);
  assert.equal((await response.json()).stories.find(item => item.id === legacyId).editable, true);
  response = await worker.fetch(request(`/stories/${legacyId}`, 'PUT', { story: { ...story, id: legacyId, title: 'Legacy edit' }, revision: 1 }, instructor.token), env);
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(db.stories.get(legacyId).record).ownerEmail, undefined);
  response = await worker.fetch(request(`/stories/${legacyId}`, 'DELETE', { revision: 2 }, instructor.token), env);
  assert.equal(response.status, 200);
});

test('instructor access stays unavailable until a distinct secret is configured', async () => {
  const db = database();
  const req = request('/session', 'POST', { email: 'ykawano@reitaku-u.co.jp', password: 'class-secret' });
  let response = await worker.fetch(req, { DB: db, CLASS_PASSWORD: 'class-secret' });
  assert.equal(response.status, 503);
  response = await worker.fetch(request('/session', 'POST', { email: 'ykawano@reitaku-u.co.jp', password: 'class-secret' }), { DB: db, CLASS_PASSWORD: 'class-secret', ADMIN_PASSWORD: 'class-secret' });
  assert.equal(response.status, 503);
});

test('only instructor can hide and restore bundled journeys', async () => {
  const db = database(), env = { DB: db, CLASS_PASSWORD: 'class-secret', ADMIN_PASSWORD: 'different-instructor-secret' };
  const student = await login(db);
  const adminResponse = await worker.fetch(request('/session', 'POST', { email: 'ykawano@reitaku-u.co.jp', password: 'different-instructor-secret' }), env);
  const admin = await adminResponse.json();
  let response = await worker.fetch(request('/builtins/yoh-draft', 'DELETE', undefined, student.data.token), env);
  assert.equal(response.status, 403);
  response = await worker.fetch(request('/builtins/yoh-draft', 'DELETE', undefined, admin.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/stories'), env);
  assert.deepEqual((await response.json()).hiddenBuiltins, ['yoh-draft']);
  response = await worker.fetch(request('/builtins/simulated-mina', 'DELETE', undefined, admin.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/stories'), env);
  assert.deepEqual((await response.json()).hiddenBuiltins, ['yoh-draft', 'simulated-mina']);
  response = await worker.fetch(request('/builtins/yoh-draft', 'PUT', undefined, admin.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/stories'), env);
  assert.deepEqual((await response.json()).hiddenBuiltins, ['simulated-mina']);
  response = await worker.fetch(request('/builtins/unknown-story', 'DELETE', undefined, admin.token), env);
  assert.equal(response.status, 404);
});

test('instructor can edit and extend a built-in journey without changing its source', async () => {
  const db = database(), env = { DB: db, CLASS_PASSWORD: 'class-secret', ADMIN_PASSWORD: 'different-instructor-secret' };
  const student = await login(db);
  const adminResponse = await worker.fetch(request('/session', 'POST', { email: 'ykawano@reitaku-u.co.jp', password: 'different-instructor-secret' }), env);
  const admin = await adminResponse.json();
  const builtIn = { ...story, id: 'yoh-draft', title: 'Yoh story', kicker: 'YOH STORY', hops: [{ ...story.hops[0], beat: 'RESEARCH', engineering: 'Rice science travels', image: 'lectures/assets/irri-rice-science.png' }] };
  let response = await worker.fetch(request('/builtins/yoh-draft/story', 'PUT', { story: builtIn, revision: 0 }, student.data.token), env);
  assert.equal(response.status, 403);
  response = await worker.fetch(request('/builtins/yoh-draft/story', 'PUT', { story: builtIn, revision: 0 }, admin.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/stories'), env);
  let published = (await response.json()).builtinOverrides['yoh-draft'];
  assert.equal(published.hops[0].engineering, 'Rice science travels');
  assert.equal(published.hops[0].image, 'lectures/assets/irri-rice-science.png');
  assert.equal(published.editable, false);
  const extended = { ...published, hops: [...published.hops, { country: 'Colombia', point: [-76, 4], year: 1971, reason: 'Cassava research', fromIndex: 1 }] };
  response = await worker.fetch(request('/builtins/yoh-draft/story', 'PUT', { story: extended, revision: 1 }, admin.token), env);
  assert.equal(response.status, 200);
  response = await worker.fetch(request('/stories', 'GET', undefined, admin.token), env);
  published = (await response.json()).builtinOverrides['yoh-draft'];
  assert.equal(published.hops.length, 2);
  assert.equal(published.editable, true);
  response = await worker.fetch(request('/builtins/yoh-draft/story', 'PUT', { story: builtIn, revision: 1 }, admin.token), env);
  assert.equal(response.status, 409);
  assert.equal(db.stories.size, 0);
});
