# 2026-2 Global Engineer

Static course website built with plain HTML, CSS, and JavaScript.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload everything in this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.

No build step or package installation is required.

## Edit

- Weekly agenda content lives in `content/weeks/`. The agenda reads those Markdown files directly, so saving an edit is enough—there is no data-generation step.
- Use `agenda.html?planning=1` to view every weekly entry expanded before its publish date. Public visitors see details only after each Markdown file's `publish_at` time.
- Weekly MAKE buttons use the matching `make_id` in the Markdown front matter and the pre-filled URL in `assets/make-submissions-config.js`.
- Guest profiles and their images live in `content/guests/`; a bare `image` filename in guest front matter is resolved from that same folder and used on the guest page and connected guest week.
- Course pages are the `.html` files in the root.
- Japanese translations are centralized in `assets/i18n.js`.
- Shared colors and layout are in `assets/styles.css`.
- Mobile navigation and resource filtering are in `assets/site.js`.

For frequent course changes, keep English as the source text in each page and
update the matching Japanese value in `assets/i18n.js`. The language system,
navigation, and layout do not need to change when weeks, guests, or assignments
are revised.
