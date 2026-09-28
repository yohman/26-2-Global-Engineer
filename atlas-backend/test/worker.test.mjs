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
  const authors = new Map(), sessions = new Map(), stories = new Map(), images = new Map();
  return {
    authors,
    prepare(query) {
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async first() {
          if (query.includes('FROM sessions')) return sessions.get(args[0]) || null;
          if (query.includes('FROM story_images') && query.includes('COUNT')) return { total: [...images.values()].filter(image => image.story_id === args[0]).length };
          if (query.includes('FROM story_images')) {
            const image = images.get(args[0]);
            return image && (!args[1] || (image.story_id === args[1] && image.owner_email === args[2])) ? image : null;
          }
          if (query.includes('FROM stories') && query.includes('COUNT')) return { total: stories.size };
          if (query.includes('FROM stories')) return stories.get(args[0]) || null;
          return null;
        },
        async all() {
          return { results: [...stories.values()] };
        },
        async run() {
          if (query.startsWith('CREATE TABLE')) return { meta: { changes: 0 } };
          if (query.startsWith('INSERT OR IGNORE INTO authors')) { authors.set(args[0], { email: args[0] }); return { meta: { changes: 1 } }; }
          if (query.startsWith('INSERT INTO sessions')) { sessions.set(args[0], { email: args[1], expires_at: args[2] }); return { meta: { changes: 1 } }; }
          if (query.startsWith('DELETE FROM sessions')) { sessions.delete(args[0]); return { meta: { changes: 1 } }; }
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
