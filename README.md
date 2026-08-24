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

- Course pages are the `.html` files in the root.
- Japanese translations are centralized in `assets/i18n.js`.
- Shared colors and layout are in `assets/styles.css`.
- Mobile navigation and resource filtering are in `assets/site.js`.

For frequent course changes, keep English as the source text in each page and
update the matching Japanese value in `assets/i18n.js`. The language system,
navigation, and layout do not need to change when weeks, guests, or assignments
are revised.
