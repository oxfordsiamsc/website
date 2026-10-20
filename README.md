# Oxford SIAM Student Chapter website

Source of <https://people.maths.ox.ac.uk/siamsc/>, served by the Mathematical Institute
web server from `/mi/share/htdocs/people/siamsc`.

## Editing

Edit the files here on GitHub (pencil icon) or in a local clone and commit to `main`.
The pages are plain HTML; shared header, footer and navigation live in
`assets/js/site-shell.js`, styles in `assets/css/style.css`.

The Seminars page fills itself from the
[jams-seminars](https://github.com/oxfordsiamsc/jams-seminars) feed.

## Publishing

The department server pulls from this public repository; GitHub has no access to the
server. After changes are merged, someone in the `siamsc` group runs on `gate.maths.ox.ac.uk`:

```bash
git -C /mi/share/htdocs/people/siamsc pull --ff-only
```

`.htaccess` stops the web server from exposing `.git` and other hidden files.
