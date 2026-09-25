# Week 1 lecture source

`w01.md` is the editable Marp source, adapted from the Week 1 Marp format in
the local `26-2-Dataviz` course. `w01.html` is the static preview linked from
the Global Engineer Week 1 agenda. The opening visual is NASA Earth
Observatory's 2016 Black Marble map. Each visual slide includes a clickable
source; the first slide links directly to the interactive NASA Worldview map.

The examples from Yoh's work are grounded in the published
[portfolio](https://yohman.github.io/yoh/), [biography](https://yohman.github.io/yoh/about.html),
[LinkedIn publications](https://www.linkedin.com/in/yohman/),
[GitHub profile](https://github.com/yohman), and project sites. The Noto map is
a 2024 historical teaching case, not current emergency guidance. Collaborative
projects are credited to their teams on the slides.

Visual assets and reuse notes for the current deck:

- `black-marble-2016.jpg`: NASA Earth Observatory, Suomi NPP/VIIRS, 2016;
  [NASA source](https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/).
- `submarine-cables-2015.png`: Greg Mahlknecht cable data and OpenStreetMap
  contributors, 2015 snapshot; [file and license details](https://commons.wikimedia.org/wiki/File:Submarine_cable_map_umap.png).
- `puerto-rico-night-2017.jpg`: NOAA/NESDIS and CIMSS, before and after Hurricane
  Maria, public domain; [file page](https://commons.wikimedia.org/wiki/File:Puerto_Rico_at_night_before_and_after_Hurricane_Maria.jpg).
- `john-hancock-center.jpg`: Nicolas G. Mertens, CC BY-SA 4.0; [file page](https://commons.wikimedia.org/wiki/File:Chicago,_IL%E2%80%94The_John_Hancock_(Fazlur_Khan_of_Skidmore,_Owings,_and_Merrill,_archs).jpg).
- `noto-crisis-map-2024.jpg` and `noto-students-2024.jpg`: images from the
  [2024 Noto crisis-map project log](https://yohman.github.io/noto/).
- `human-error-still.png`, `hypercities-portfolio.png`, `kashiwa-after-dark.png`,
  and `reitaku-360.png`: images from [Yoh's portfolio](https://yohman.github.io/yoh/);
  the slides link to each project's own site when available.

To rebuild the linked preview after editing the Markdown, run from the course
repository root:

```sh
npx @marp-team/marp-cli@4.5.1 --html --allow-local-files lectures/w01.md --output lectures/w01.html
```

For a live authoring view that reloads the Markdown source:

```sh
PORT=4182 npx @marp-team/marp-cli@4.5.1 --html --server lectures
```

Then open `http://127.0.0.1:4182/w01.md`. The committed HTML preview works on
the course website without a server or build step.
