# Atlas story service (Cloudflare)

This is a prepared Cloudflare Worker and D1 database for the five-student Atlas. It is not connected to the public site until its deployment URL is configured. The current Google submission path remains active during the transition.

The public `GET /stories` endpoint returns published journeys for the class map. A `PUT /stories/:id` creates or revises one journey, requires the shared class password, and checks the story revision before saving. The password is a Cloudflare Worker secret, not part of this repository or browser storage. The same password gives access to all class stories, as requested. Student submissions should omit private details and should only use photos with permission.

## Git-connected deployment

The D1 database, `stories` table, and `DB` binding were created in Cloudflare on 2026-09-28. Its database ID in `wrangler.jsonc` is not a secret. GitHub Builds is connected to `yohman/26-2-Global-Engineer` with `/atlas-backend/` as its root; the first successful build replaces the starter Worker.

1. In the existing Worker, use **Settings → Builds → GitHub** to connect `yohman/26-2-Global-Engineer`. Set the root directory to `atlas-backend`, the branch to `main`, and the deploy command to `npx wrangler deploy`. The Worker name and Wrangler `name` both equal `global-engineer-atlas`.
2. In **Settings → Runtime variables and secrets**, add `CLASS_PASSWORD` as a **secret**, with a unique password shared privately with the five students. Never paste it into GitHub or chat.
3. Check `https://global-engineer-atlas.ykawano.workers.dev/stories` from a browser. It should return `{ "stories": [] }`.

After those checks, the course Atlas can be connected to the Worker URL and its Google form submission retired. Do not make that switch before an actual class story is saved, read back on another device, and edited successfully.

The Worker permits browser requests from the course's GitHub Pages origin and `localhost:4173` for testing. Public reads are intentional; write requests require the secret. A shared password is simple, but it does not establish individual authorship or prevent classmates who know it from editing each other's stories. Keep a copy of important story text.
