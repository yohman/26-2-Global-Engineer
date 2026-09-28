# Class Atlas service

The course Atlas is hosted on GitHub Pages. Its small story service deploys from this folder to Cloudflare Worker `global-engineer-atlas`, with D1 bound as `DB`. The only required secret is `CLASS_PASSWORD`, configured in Cloudflare Runtime variables and secrets. Do not put it in GitHub.

The landing view is public. `GET /stories` returns the class journeys without author email addresses. `POST /session` accepts an email and the class password, saves the normalized email in the D1 `authors` table, and returns a 12-hour random bearer token. The browser keeps the token in session storage; D1 stores only its SHA-256 hash. `GET /stories` with this token marks only that email's stories as editable. `PUT /stories/:id` and `DELETE /stories/:id` enforce ownership and revision checks. A new browser or an expired session requires signing in again.

This is **class-password identification, not verified email identity**. Anyone with the shared password can enter another person's email. Use a long private class password and only invite the five students. Add email verification later if stronger ownership is needed.

Images are resized in the browser and limited to 700 KB for D1 storage. `POST /stories/:id/images` requires the owner's token and accepts JPEG, PNG, or WebP; `GET /images/:id` serves the image publicly. D1's per-BLOB limit is 2 MB, so this class-sized design stays well below it. Upload only images the author has permission to publish.

The `stories` table was created before this author mode. The Worker creates `authors`, `sessions`, and `story_images` on the first successful login; `schema.sql` also records the full schema for a fresh installation. Existing journeys without an `ownerEmail` in their stored record remain publicly viewable but cannot be edited or deleted through the new author flow. The instructor can migrate one explicitly after confirming its owner's email.

Run `node --test test/worker.test.mjs` for service checks. A live password-protected create/edit/upload/delete should be verified with an authorized class account after deployment.
