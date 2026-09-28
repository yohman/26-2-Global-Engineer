import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const origin = 'https://yohman.github.io';
const story = {
  id: 'journey-test1234', alias: 'Student', marker: { color: '#20567c', symbol: '旅' },
  origin: { place: 'Kashiwa', point: [139.9, 35.8], engineering: 'An idea begins here', trace: 'A source to follow', mediaUrl: 'https://example.org/source' },
  hops: [{ country: 'Philippines', point: [121, 14], reason: 'A rail connection', lens: 'Infrastructure' }]
};

function database() {
  const records = new Map();
  return {
    prepare(query) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() { return { total: records.size }; },
        async all() { return { results: [...records.values()].map(record => ({ record: record.data, revision: record.revision, updated_at: record.updatedAt })) }; },
        async run() {
          if (query.startsWith('INSERT')) {
            if (records.has(values[0])) return { meta: { changes: 0 } };
            records.set(values[0], { data: values[1], revision: 1, updatedAt: values[2] });
          } else {
            const existing = records.get(values[2]);
            if (!existing || existing.revision !== values[3]) return { meta: { changes: 0 } };
            records.set(values[2], { data: values[0], revision: existing.revision + 1, updatedAt: values[1] });
          }
          return { meta: { changes: 1 } };
        }
      };
    }
  };
}

function put(payload, password = 'class-secret', pageOrigin = origin) {
  return new Request(`https://atlas.example/stories/${story.id}`, {
    method: 'PUT', headers: { Origin: pageOrigin, Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

test('create, read, edit, and reject stale revisions', async () => {
  const env = { DB: database(), CLASS_PASSWORD: 'class-secret' };
  let response = await worker.fetch(put({ story, revision: 0 }), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).revision, 1);
  response = await worker.fetch(new Request('https://atlas.example/stories', { headers: { Origin: origin } }), env);
  const listing = await response.json();
  assert.equal(listing.stories[0].origin.place, 'Kashiwa');
  assert.equal(listing.stories[0].origin.trace, 'A source to follow');
  assert.equal(listing.stories[0].origin.mediaUrl, 'https://example.org/source');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  response = await worker.fetch(put({ story: { ...story, title: 'Revised' }, revision: 1 }), env);
  assert.equal((await response.json()).revision, 2);
  response = await worker.fetch(put({ story, revision: 1 }), env);
  assert.equal(response.status, 409);
});

test('reject wrong password, unrelated origin, and unsafe media links', async () => {
  const env = { DB: database(), CLASS_PASSWORD: 'class-secret' };
  assert.equal((await worker.fetch(put({ story, revision: 0 }, 'wrong'), env)).status, 401);
  assert.equal((await worker.fetch(put({ story, revision: 0 }, 'class-secret', 'https://unrelated.example'), env)).status, 403);
  const unsafe = { ...story, hops: [{ ...story.hops[0], mediaUrl: 'javascript:alert(1)' }] };
  assert.equal((await worker.fetch(put({ story: unsafe, revision: 0 }), env)).status, 400);
});
