# Personal site

Install dependencies with `npm ci`, run `npm run dev` for local development, and
run `npm run build` to generate the site in `dist/`.

## Updating the resume

Keep your private ResumeQuiver export at `resume/AurelioFlorez-Resume.yaml`.
The entire `resume/` directory is ignored by Git. The renderer in
`scripts/resume/` comes from ResumeQuiver and uses the same PDF layout, selection
flags, and hidden contact fields. Entries and bullets default to selected when
the flag is omitted.
Experience and project entries with no selected bullets are omitted.
The template uses slightly tighter line spacing to keep the current resume on
one page.

When the local YAML is present, every site build validates it and regenerates
`static/resume.pdf`. While `npm run dev` is running, edits to the YAML or renderer
also regenerate the PDF automatically. Invalid YAML fails the build.

Commit the updated `static/resume.pdf` along with any renderer changes. A fresh
checkout or deployment without the private YAML uses that committed PDF. Astro
serves it at the existing `/resume.pdf` URL via `public/` and `dist/`.

To generate just the site's resume from your local YAML:

```sh
npm run resume:build
```

To render another YAML export, optionally choosing an output path:

```sh
npm run resume:render -- path/to/resume.yaml output/resume.pdf
```

Only the public PDF and renderer belong in Git. Keep YAML exports private.
Deploy through the site's normal build process. Run `npm run resume:test` for
the date formatting tests.
