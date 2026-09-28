# Atlas story service (Cloudflare)

This is a prepared Cloudflare Worker and D1 database for the five-student Atlas. It is not connected to the public site until its deployment URL is configured. The current Google submission path remains active during the transition.

The public `GET /stories` endpoint returns published journeys for the class map. A `PUT /stories/:id` creates or revises one journey, requires the shared class password, and checks the story revision before saving. The password is a Cloudflare Worker secret, not part of this repository or browser storage. The same password gives access to all class stories, as requested. Student submissions should omit private details and should only use photos with permission.

## Remote setup

1. In your Cloudflare account, create a D1 database named `global-engineer-atlas` (Asia-Pacific location is suitable). Note its database ID.
2. Copy `wrangler.jsonc.example` to `wrangler.jsonc`, then replace `REPLACE_WITH_D1_DATABASE_ID`. Do not commit credentials or a password. The database ID itself is not a secret.
3. From this directory, run `npx wrangler d1 execute global-engineer-atlas --remote --file=./schema.sql` and `npx wrangler deploy`. Wrangler will invite you to sign in if needed.
4. In the Cloudflare dashboard, open the Worker → Settings → Variables and Secrets. Add `CLASS_PASSWORD` as a **secret**, with a unique password shared privately with the five students. Never paste it into GitHub or chat.
5. Check `https://<your-worker>.workers.dev/stories` from a browser. It should return `{ "stories": [] }`.

After those checks, the course Atlas can be connected to the Worker URL and its Google form submission retired. Do not make that switch before an actual class story is saved, read back on another device, and edited successfully.

The Worker permits browser requests from the course's GitHub Pages origin and `localhost:4173` for testing. Public reads are intentional; write requests require the secret. A shared password is simple, but it does not establish individual authorship or prevent classmates who know it from editing each other's stories. Keep a copy of important story text.
