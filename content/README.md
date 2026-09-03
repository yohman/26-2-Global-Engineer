# Weekly agenda content

Each teaching week is an editable Markdown file in `content/weeks/`.

1. Edit the front matter and sections for a week.
2. Save the Markdown file. The agenda reads it directly when the page loads.
3. Add resources using the format below.

`publish_at` is Japan time. Students see the date and title before that time, but not the details. Add `?planning=1` to `agenda.html` (or open it locally) to inspect every week, expanded.

```yaml
week: 3
date: 2026-10-13
publish_at: 2026-10-13T09:00:00+09:00
title: GIS・データ・公共サービス
subtitle: GIS, Data & Public Service
kind: Guest 01
lead: Yoko Myers
make_id: make03
```

Use any `## Section name` needed by that week. The agenda renders only sections that exist. Resources have one line each:

```md
- [Title](https://example.com) — Source / author | Optional short note {READ}
```

Valid categories are `READ`, `VIEW`, `EXPLORE`, `TOOLS`, and `REFERENCE`.

## Guest profiles

Each guest profile is an editable Markdown file in `content/guests/`. The guest page reads these files directly. Use front matter for `id`, `name`, `role`, `date`, `week`, `arc`, and an optional `image`; use a `## Bio` section for the full profile. A bare filename such as `image: Yoko.jpg` means the image is in `content/guests/`, beside the Markdown files. Explicit paths also work. Set the matching weekly file's `guest_id` to show the profile image as a circular agenda icon.
