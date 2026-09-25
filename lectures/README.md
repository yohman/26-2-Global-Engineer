# Week 1 lecture source

`w01.md` is the editable Marp source, adapted from the Week 1 Marp format in
the local `26-2-Dataviz` course. `w01.html` is the static preview linked from
the Global Engineer Week 1 agenda. The opening visual is NASA Earth
Observatory's 2016 Black Marble map; its source and credit are in the slide.

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
