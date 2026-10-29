# Maintaining the Oxford SIAM Student Chapter website

This guide is for whoever looks after the website (usually the IT and Social Media
Officer). It explains how the pieces fit together and how to do every routine task.
Most tasks need only a web browser and a GitHub account.

- Live site: <https://people.maths.ox.ac.uk/siamsc/>
- Website source: <https://github.com/oxfordsiamsc/website>
- Seminar feed: <https://github.com/oxfordsiamsc/jams-seminars>

---

## 1. How it works

```
 maths.ox.ac.uk events (JAMS, series 650)
              │  read twice a day by a GitHub Action
              ▼
 oxfordsiamsc/jams-seminars ──► GitHub Pages: oxfordsiamsc.github.io/jams-seminars/
   slides.json, overrides.json        seminars.json  archive.json  jams.ics
                                            │ fetched by visitors' browsers
                                            ▼
 oxfordsiamsc/website  ──(git pull on gate)──►  /mi/share/htdocs/people/siamsc
   HTML, CSS, JS, images, data/*.json          served at people.maths.ox.ac.uk/siamsc
```

There are two GitHub repositories, both in the `oxfordsiamsc` organisation.

**`website`** holds the site itself: plain HTML pages, one stylesheet, a few scripts and
the images. It is a copy of what the department web server serves. Changes reach the live
site only when someone runs `git pull` on the server (see [§3](#3-publishing-changes)).

**`jams-seminars`** holds no pages, only data. A GitHub Action reads the Junior Applied
Mathematics Seminar listings on the department website and publishes three files
through GitHub Pages:

| File | Used by | Contents |
|---|---|---|
| `seminars.json` | Seminars page | upcoming talks, the 12 most recent ones, talks with slides |
| `archive.json` | Seminar Archive page | every talk since 2008 (talks are never removed) |
| `jams.ics` | "Subscribe to all seminars" | calendar feed people subscribe to |

Visitors' browsers download these files when they open the Seminars or Archive page.
So **seminar changes appear on the live site by themselves**, with no `git pull`.

### Why it is built this way

- **Security.** The department server *pulls* from a public repository, and GitHub never
  connects to it. No password, SSH key or token for any Oxford account is stored on GitHub.
- **No dependence on one person.** Everything lives in the organisation, not in a
  personal account, and anyone in the `siamsc` Unix group can publish.
- **Robust pages.** If GitHub is unreachable, the Seminars page still shows the last version
  written into its HTML, and every other page is plain static HTML.

---

## 2. Access you need

| What | Needed for | How to get it |
|---|---|---|
| Member of the GitHub org `oxfordsiamsc` | editing anything | an owner invites you: *People → Invite member* (username or email) |
| Owner of the org | inviting people, settings | an existing owner changes your role |
| Membership of the `siamsc` Unix group | publishing to the server | ask Mathematical Institute IT to add your maths username |
| A maths account with SSH to `gate.maths.ox.ac.uk` | publishing | your normal departmental account |

`popeye.maths.ox.ac.uk` refuses SSH; use `gate`. The site directory is shared on gate,
so you never need popeye.

Keep **at least two owners** on the GitHub organisation, so it never gets locked when
someone leaves. Two-factor authentication should be required for all members
(*Settings → Authentication security*).

---

## 3. Publishing changes

After changing anything in the `website` repository (directly, or through the data
Action), publish it:

```bash
ssh gate.maths.ox.ac.uk
git -C /mi/share/htdocs/people/siamsc pull --ff-only
```

That is all. Check the result at <https://people.maths.ox.ac.uk/siamsc/>; if the page
looks old, press Ctrl+F5 to bypass the browser cache.

The first time you run git there you may see a "dubious ownership" error, because the
directory belongs to the `siamsc` account. Allow it once:

```bash
git config --global --add safe.directory /mi/share/htdocs/people/siamsc
```

**Never edit files directly on the server.** The next `pull` would then fail, or worse,
the change would be lost. Always change GitHub first, then pull.

If `pull` refuses because files on the server were edited, see [§9](#9-troubleshooting).

---

## 4. Editing on GitHub without installing anything

1. Open the file on github.com, for example `data/committee.json`.
2. Click the pencil icon (*Edit this file*).
3. Make the change, then **Commit changes**, adding a short message such as
   "Add 2027 committee".
4. To upload images, open the folder (e.g. `assets/images/committee`) and use
   *Add file → Upload files*.

`main` is protected: it cannot be deleted or force-pushed, and every change stays in
the history. To undo something, open the commit on GitHub and revert it, or ask an owner.

---

## 5. Routine tasks

### 5.1 Change the committee (each year)

The committee shown on the home page and on About comes from `data/committee.json`.
**Do not edit those parts of the HTML.** They sit between
`<!-- BEGIN generated:... -->` and `<!-- END generated:... -->` comments and are rewritten
automatically.

1. Upload the photos to `assets/images/committee/`. Use square-ish JPG/PNG/WebP images
   of about 400×400 px, under 300 KB, and simple file names without spaces, e.g.
   `jane_doe.jpg`.
2. Edit `data/committee.json` and add a new year **at the top** of `committees`:

   ```json
   {
     "year": 2027,
     "members": [
       { "name": "Jane Doe", "role": "President", "photo": "jane_doe.jpg",
         "profile": "https://www.maths.ox.ac.uk/people/jane.doe" },
       { "name": "John Smith", "role": "Treasurer" }
     ]
   }
   ```

   - `photo` is optional; without it a grey silhouette is shown.
   - `profile` is optional; with it the card links to that page.
   - Members appear in the order you list them.
   - `home_years` (at the top of the file) sets how many recent committees the home page
     shows (2 by default). About shows all years.
3. Commit. Within a minute the **Build pages from data** Action regenerates
   `index.html` and `about.html` and commits them as `github-actions[bot]`. You can watch it
   under the *Actions* tab.
4. Publish ([§3](#3-publishing-changes)).

JSON is strict: names in double quotes, commas between items, no comma after the last item.
If the Action fails, the error usually points at the line with the typo.

### 5.2 Add, change or remove a sponsor

1. Upload the logo to `assets/images/sponsors/` (a wide PNG with transparent background
   looks best).
2. Edit `data/sponsors.json`:

   ```json
   { "name": "Example Ltd", "url": "https://example.com/", "logo": "example.png" }
   ```

3. Commit, wait for the Action, then publish.

### 5.3 Update the termcard

The termcard image is `assets/images/siam termcard.png`, shown on the Seminars page and
linked from the "Termcard" menu item. Replace it by uploading a new file **with exactly
the same name**, then publish. If you rename it, also update the two references in
`seminars.html`.

### 5.4 Seminars: nothing to do in most cases

Talks are entered on the department website by the seminar organisers. Twice a day
(05:17 and 17:17 UTC) the Action in `jams-seminars` picks them up, and the website shows
them automatically. This covers:

- the highlights (next and most recent talk), which switch automatically as talks pass;
- the upcoming list with "Add to calendar";
- the archive;
- the subscribable calendar.

To refresh immediately, go to `jams-seminars` → *Actions* → **Update seminars** →
*Run workflow*.

### 5.5 Add slides for a talk

In the `jams-seminars` repository, edit `slides.json` and add:

```json
{ "id": "83067", "slides": "https://link-to-the-slides" }
```

The `id` is the number at the end of the talk's department link
(`https://www.maths.ox.ac.uk/node/83067`). Committing triggers a rebuild. The talk gets a
**Slides** button on the Seminars page and in the archive, and appears under "Past seminars".

For a talk that is not on the department site, you can also give `title`, `speaker`,
`affiliation`, `room`, `start` (ISO time in UTC, e.g. `2026-11-03T12:30:00Z`) and `url`.

### 5.6 Correct a talk (room change, wrong time, typo…)

The department page is the source, so the best fix is to have the department page
corrected. Until then, or if that is not possible, add an entry to `overrides.json` in
`jams-seminars`:

```json
{ "id": "83068", "room": "L5", "note": "Moved from C3; department page not yet updated" }
```

Any field can be overridden (`room`, `title`, `speaker`, `affiliation`, `start`, `end`,
`url`). Overrides always win, so **remove the entry once the department page is
correct**, to avoid it hiding a later change. `note` is just for the record.

### 5.7 Change text on a page

Edit the page's `.html` file on GitHub (`about.html`, `contact.html`, …), commit and publish.
Keep to the existing structure: text goes inside `<div class="post-content">`.

### 5.8 Menu, header and footer

These are not in each page. They are built by `assets/js/site-shell.js`:

- menu items: the `navItems` list at the top (label, link, and `external: true` for other sites);
- the Instagram/LinkedIn links and footer text are in `renderHeader` and `renderFooter`.

### 5.9 Add a new page

1. Copy `contact.html` (the simplest page) to e.g. `events.html`.
2. Change `<title>`, the `description` and `og:` meta tags, and the `<h1>`.
3. Replace the content inside `<div class="post-content">`.
4. Add it to `navItems` in `assets/js/site-shell.js` if it should be in the menu.
5. Commit and publish.

### 5.10 Change styles

All styles are in `assets/css/style.css`, with the colours as variables at the top
(`--oxford-navy`, `--oxford-gold`, …). There is no build step. `style.css.map` is an old
leftover and can be ignored.

---

## 6. The seminar feed in more detail

Repository `oxfordsiamsc/jams-seminars`:

| File | Edited by | Purpose |
|---|---|---|
| `scripts/build.py` | rarely, by a maintainer | scraper and generator |
| `slides.json` | you | slides links |
| `overrides.json` | you | manual corrections |
| `seminars.json`, `archive.json`, `jams.ics` | the Action only | published data; **do not edit** |
| `.github/workflows/update.yml` | rarely | schedule and commit logic |

How the Action works:

- It runs twice a day, when you run it by hand, and when `slides.json`, `overrides.json` or
  the script change.
- It reads <https://www.maths.ox.ac.uk/events/list/650> and every page of
  <https://www.maths.ox.ac.uk/events/past/650>.
- It commits only when something actually changed. Every 45 days without changes it makes an
  empty "keep alive" commit, because GitHub disables scheduled workflows after 60 days
  without activity.
- GitHub Pages republishes automatically after each commit, usually within a minute.

Times are stored in UTC and shown in UK time (GMT/BST handled automatically).

**If the department redesigns its events pages**, the scraper may stop finding talks. In
that case the Action fails, GitHub emails the repository admins, and the website keeps
showing the last good data. To fix it, someone comfortable with Python needs to update the
`parse()` function in `scripts/build.py`. Run it locally with `python scripts/build.py`
and compare the output with the department page.

---

## 7. Calendar subscriptions

"Subscribe to all seminars" on the Seminars page offers:

- **Google Calendar**: a one-click subscribe link to `jams.ics`.
- **Outlook / Oxford account**: Outlook on the web, which also covers the new Outlook desktop app.
- **Apple Calendar**: a `webcal://` link.
- **Copy calendar link**: for anything else, including classic Outlook (*Add calendar →
  From Internet*).

The feed is `https://oxfordsiamsc.github.io/jams-seminars/jams.ics`. **Never move or rename
it**, because every subscriber would silently stop getting updates. Calendar apps
refresh subscriptions on their own schedule (Google can take up to a day).

The department also has its own feed (`/events/list/650/calendar.ics`). We don't use it:
it lacks speaker names, and Google Calendar fails to subscribe to it.

---

## 8. Security rules

- **Never commit passwords, keys, tokens or personal email addresses.** Both repositories
  are public. Secret scanning with push protection is on and will block most secrets, but
  don't rely on it.
- **Don't give GitHub any access to the department server.** That means no deploy keys
  and no Actions that SSH into `gate`. Publishing stays a manual `git pull`.
- `.htaccess` makes the web server return 404 for `.git`, other hidden files and editor
  backups (`*~`). Don't remove it: until October 2026 the `.git` folder was publicly
  downloadable.
- Actions may only use GitHub's own actions (`actions/checkout`, `actions/setup-python`).
  Avoid adding third-party actions.
- Commits made through the GitHub website use your account's no-reply email if
  *Keep my email addresses private* is enabled in your GitHub email settings. Please enable it.
- When someone leaves the committee, remove them from the organisation, or downgrade them
  to member, and ask IT to remove them from the `siamsc` group.

---

## 9. Troubleshooting

**The live site didn't change after my edit.**
Did you publish ([§3](#3-publishing-changes))? For committee or sponsor changes, did the
**Build pages from data** Action finish? Then hard-refresh with Ctrl+F5.

**`git pull` says local changes would be overwritten.**
Someone edited files on the server. Inspect them with
`git -C /mi/share/htdocs/people/siamsc status` and `git ... diff`. If the edits matter, copy
them into GitHub first. Then discard them with
`git -C /mi/share/htdocs/people/siamsc checkout -- <file>` and pull again.

**`Permission denied` when pulling.**
Your account is not in the `siamsc` group (check with `id`), or a file was created
without group write permission. Fix the latter with `chmod g+w <file>`.

**Seminars page shows old talks / the archive says it could not be loaded.**
Open <https://oxfordsiamsc.github.io/jams-seminars/seminars.json>. If it fails, check
*Settings → Pages* in `jams-seminars`. If it is old, check the latest run under *Actions*.

**A talk is missing.**
Check that it is on the department page for series 650. If it is listed somewhere
else, it is not a JAMS talk for the scraper. Add it via `slides.json` with full details,
or ask the organisers to file it under JAMS.

**The data Action failed after editing `committee.json`.**
Almost always a JSON typo. Open the failed run to see the line, fix it and commit again.

---

## 10. What else is on the server

`/mi/share/htdocs/people/siamsc` also contains, outside git:

- `siamsc/`: an old duplicate copy of the whole site, reachable at `.../siamsc/siamsc/`.
  Nothing links to it.
- `*.html~`, `.Rhistory`: editor and R leftovers (hidden from the web by `.htaccess`).
- `.git-old-zoegdr/`: the previous git history, from `zoegdr/Oxford_SIAM_Website` (hidden).

They are kept only for safety and can be deleted once nobody needs them. The template
files `example_posts/`, `script/`, `minima.gemspec`, `History.markdown`, `feed.xml` and
`CODE_OF_CONDUCT.md` come from the original Jekyll theme and are unused by the current site.

`/home/siamsc` is the private home directory of the shared `siamsc` account. It is not part
of the website.

---

## 11. Handover checklist for a new maintainer

- [ ] Invited to the GitHub organisation `oxfordsiamsc` as **owner**
- [ ] Two-factor authentication enabled on their GitHub account
- [ ] Added to the `siamsc` Unix group by Maths IT
- [ ] Can SSH to `gate.maths.ox.ac.uk` and run the publish command ([§3](#3-publishing-changes))
- [ ] Has read this file
- [ ] The previous maintainer is downgraded or removed once the handover is done
