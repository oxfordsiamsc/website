/* Seminar archive: every JAMS talk, grouped by academic year, with search.
   Data: https://github.com/oxfordsiamsc/jams-seminars (archive.json, updated twice a day). */
(function () {
  var FEED = "https://oxfordsiamsc.github.io/jams-seminars/archive.json";
  var TZ = "Europe/London";

  var list = document.getElementById("archive-list");
  var search = document.getElementById("archive-search");
  var slidesOnly = document.getElementById("archive-slides");
  var count = document.getElementById("archive-count");
  var talks = [];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(d, opts) { return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: TZ }, opts)).format(d); }
  // Oxford's academic year starts on 1 October.
  function academicYear(d) {
    var y = Number(fmt(d, { year: "numeric" })), m = Number(fmt(d, { month: "numeric" }));
    var start = m >= 10 ? y : y - 1;
    return start + "–" + String(start + 1).slice(2);
  }
  function normalise(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function row(t) {
    var d = new Date(t.start);
    var who = esc(t.speaker) + (t.affiliation ? " · " + esc(t.affiliation) : "");
    var slides = t.slides
      ? '<div class="event-actions"><a class="slides-button" href="' + esc(t.slides) + '" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-person-chalkboard" aria-hidden="true"></i> Slides</a></div>'
      : '<div class="event-actions"></div>';
    return '<div class="event-row has-actions archive-row">' +
      '<div class="event-date"><span>' + fmt(d, { day: "2-digit" }) + "</span><small>" + fmt(d, { month: "short" }) + " " + fmt(d, { year: "numeric" }) + "</small></div>" +
      '<div class="event-details"><h3><a href="' + esc(t.url) + '" target="_blank" rel="noopener noreferrer">' + esc(t.title) + "</a></h3>" +
      '<p class="event-meta">' + who + "</p></div>" + slides + "</div>";
  }

  function render() {
    var words = normalise(search.value).split(/\s+/).filter(Boolean);
    var shown = talks.filter(function (t) {
      if (slidesOnly.checked && !t.slides) return false;
      return words.every(function (w) { return t._text.indexOf(w) !== -1; });
    });
    var html = "", year = null, open = false;
    shown.forEach(function (t) {
      if (t._year !== year) {
        if (open) html += "</section>";
        year = t._year;
        html += '<section class="archive-year" aria-label="Academic year ' + year + '"><h2>' + year + "</h2>";
        open = true;
      }
      html += row(t);
    });
    if (open) html += "</section>";
    list.innerHTML = html || '<p class="seminar-list-note">No talks match your search.</p>';
    count.textContent = shown.length === talks.length
      ? talks.length + " talks since " + fmt(new Date(talks[talks.length - 1].start), { year: "numeric" })
      : shown.length + " of " + talks.length + " talks";
  }

  function fail() {
    count.innerHTML = 'The archive could not be loaded. Browse past talks on the <a href="https://www.maths.ox.ac.uk/events/past/650">Oxford Mathematics event page</a>.';
  }

  if (!window.fetch || !window.Intl) { fail(); return; }
  fetch(FEED, { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var now = new Date();
      talks = (data.seminars || []).filter(function (t) { return new Date(t.start) < now; });
      talks.forEach(function (t) {
        t._year = academicYear(new Date(t.start));
        t._text = normalise([t.title, t.speaker, t.affiliation].join(" "));
      });
      search.disabled = slidesOnly.disabled = false;
      search.addEventListener("input", render);
      slidesOnly.addEventListener("change", render);
      render();
    })
    .catch(fail);
})();
