# Oxford SIAM Student Chapter website

Source of <https://people.maths.ox.ac.uk/siamsc/>, served by the Mathematical Institute
web server from `/mi/share/htdocs/people/siamsc`.

**Maintaining the site? Read [MAINTENANCE.md](MAINTENANCE.md)**: it covers every routine
task (committee, sponsors, slides, room changes, publishing) step by step.

## Editing

Edit the files here on GitHub (pencil icon) or in a local clone and commit to `main`.
The pages are plain HTML; shared header, footer and navigation live in
`assets/js/site-shell.js`, styles in `assets/css/style.css`.

### Committee and sponsors

Don't edit those sections of the HTML by hand. Edit the data instead:

- `data/committee.json`: one entry per year with `name`, `role`, optional `photo`
  (a file in `assets/images/committee/`, otherwise a silhouette is shown) and optional
  `profile` link. The home page shows the latest `home_years` committees, the About
  page shows all of them.
- `data/sponsors.json`: `name`, `url` and `logo` (a file in `assets/images/sponsors/`).

Upload new photos or logos first, then commit the JSON change. A GitHub Action
regenerates the HTML between the `BEGIN generated` / `END generated` comments and commits it.
Locally you can run `python scripts/build_pages.py`.

### Seminars

The Seminars page and the [archive](https://people.maths.ox.ac.uk/siamsc/seminars-archive.html)
fill themselves from the [jams-seminars](https://github.com/oxfordsiamsc/jams-seminars)
feed. Slides are added there, in `slides.json`.

## Publishing

The department server pulls from this public repository; GitHub has no access to the
server. After changes are merged, someone in the `siamsc` group runs on `gate.maths.ox.ac.uk`:

```bash
git -C /mi/share/htdocs/people/siamsc pull --ff-only
```

`.htaccess` stops the web server from exposing `.git` and other hidden files.
