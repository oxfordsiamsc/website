"""Regenerate the committee and sponsor sections of the website from data/*.json.

The generated HTML sits between marker comments, e.g.
    <!-- BEGIN generated:committee-all -->  ...  <!-- END generated:committee-all -->
Everything outside the markers is left untouched. Run from the repository root:
    python scripts/build_pages.py
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLACEHOLDER = "silhouettes_4.jpg"


def load(name):
    return json.loads((ROOT / "data" / name).read_text(encoding="utf-8"))


def member(m):
    photo = "assets/images/committee/" + (m.get("photo") or PLACEHOLDER)
    inner = (
        f'\n        <img src="{escape(photo)}" alt="{escape(m["name"])}" loading="lazy" />'
        f'\n        <h3>{escape(m["name"])}</h3>'
        f'\n        <p>{escape(m["role"])}</p>'
    )
    if m.get("profile"):
        inner = (
            f'\n        <a class="committee-profile-link" href="{escape(m["profile"])}" target="_blank" rel="noopener noreferrer">'
            + inner.replace("\n        ", "\n          ")
            + "\n        </a>"
        )
    return f'      <div class="committee-member">{inner}\n      </div>'


def committee(c):
    members = "\n".join(member(m) for m in c["members"])
    return (
        f'<section class="committee">\n  <h2>Committee {c["year"]}</h2>\n'
        f'  <div class="committee-grid">\n{members}\n  </div>\n</section>'
    )


def sponsor(s):
    return (
        '<div class="sponsor">\n'
        f'  <a href="{escape(s["url"])}" target="_blank" rel="noopener noreferrer">\n'
        f'    <img src="assets/images/sponsors/{escape(s["logo"])}" alt="{escape(s["name"])} logo" />\n'
        "  </a>\n"
        f'  <span class="sponsor-name">{escape(s["name"])}</span>\n'
        "</div>"
    )


def replace(page, block, content):
    path = ROOT / page
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(
        rf"(<!-- BEGIN generated:{block} [^>]*-->\n).*?(\n<!-- END generated:{block} -->)", re.S
    )
    if not pattern.search(text):
        raise SystemExit(f"{page}: markers for '{block}' not found")
    new = pattern.sub(lambda m: m.group(1) + content + m.group(2), text)
    if new != text:
        path.write_bytes(new.encode("utf-8"))
        print(f"updated {page} ({block})")


def main():
    data = load("committee.json")
    committees = sorted(data["committees"], key=lambda c: c["year"], reverse=True)
    replace("about.html", "committee-all", "\n\n".join(committee(c) for c in committees))
    recent = committees[: data.get("home_years", 2)]
    replace("index.html", "committee-recent", "\n\n".join(committee(c) for c in recent))
    replace("sponsors.html", "sponsors", "\n\n".join(sponsor(s) for s in load("sponsors.json")["sponsors"]))


if __name__ == "__main__":
    main()
