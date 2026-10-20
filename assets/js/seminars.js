/* Builds the seminar highlights and lists from the JAMS feed.
   Data: https://github.com/oxfordsiamsc/jams-seminars (updated twice a day from maths.ox.ac.uk).
   If the feed cannot be loaded, the static HTML already on the page is left as it is. */
(function () {
  var FEED = "https://oxfordsiamsc.github.io/jams-seminars/seminars.json";
  var TZ = "Europe/London";
  var DEFAULT_MINUTES = 30;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function startOf(e) { return new Date(e.start); }
  function endOf(e) { return e.end ? new Date(e.end) : new Date(startOf(e).getTime() + DEFAULT_MINUTES * 60000); }
  function fmt(d, opts) { return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: TZ }, opts)).format(d); }
  function compact(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function location(e) { return (e.room ? e.room + ", " : "") + "Mathematical Institute, University of Oxford"; }
  function details(e) {
    return "Junior Applied Mathematics Seminar. Speaker: " + e.speaker +
      (e.affiliation ? " (" + e.affiliation + ")" : "") + ". Details: " + e.url;
  }
  function q(params) {
    return Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&");
  }
  function icsText(s) { return String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n"); }

  function calendarMenu(e) {
    var s = startOf(e), en = endOf(e), title = "JAMS: " + e.title;
    var google = "https://calendar.google.com/calendar/render?" + q({
      action: "TEMPLATE", text: title, dates: compact(s) + "/" + compact(en), details: details(e), location: location(e)
    });
    var outlook = "https://outlook.office.com/calendar/0/deeplink/compose?" + q({
      path: "/calendar/action/compose", rru: "addevent", subject: title,
      startdt: s.toISOString(), enddt: en.toISOString(), body: details(e), location: location(e)
    });
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Oxford SIAM Student Chapter//JAMS//EN", "BEGIN:VEVENT",
      "UID:jams-" + e.id + "@siamsc.maths.ox.ac.uk", "DTSTAMP:" + compact(new Date()),
      "DTSTART:" + compact(s), "DTEND:" + compact(en), "SUMMARY:" + icsText(title),
      "DESCRIPTION:" + icsText(details(e)), "LOCATION:" + icsText(location(e)), "URL:" + e.url,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var icsHref = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    return '<details class="calendar-menu">' +
      '<summary class="calendar-button"><i class="fa-regular fa-calendar-plus" aria-hidden="true"></i> Add to calendar</summary>' +
      '<ul class="calendar-options">' +
      '<li><a href="' + esc(google) + '" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-google" aria-hidden="true"></i> Google Calendar</a></li>' +
      '<li><a href="' + esc(outlook) + '" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-microsoft" aria-hidden="true"></i> Outlook</a></li>' +
      '<li><a href="' + esc(icsHref) + '" download="jams-' + esc(e.id) + '.ics"><i class="fa-solid fa-download" aria-hidden="true"></i> Apple / other (.ics)</a></li>' +
      "</ul></details>";
  }

  function slidesButton(e) {
    return '<a class="slides-button" href="' + esc(e.slides) + '" target="_blank" rel="noopener noreferrer">' +
      '<i class="fa-solid fa-person-chalkboard" aria-hidden="true"></i> Slides</a>';
  }

  function row(e, opts) {
    var s = startOf(e), en = endOf(e);
    var action = opts.calendar ? calendarMenu(e) : (e.slides ? slidesButton(e) : "");
    var idAttr = opts.headingId ? ' id="' + opts.headingId + '"' : "";
    var who = esc(e.speaker) + (e.affiliation ? " · " + esc(e.affiliation) : "");
    var when = fmt(s, { hour: "2-digit", minute: "2-digit" }) + "–" + fmt(en, { hour: "2-digit", minute: "2-digit" }) +
      (e.room ? " · " + esc(e.room) + ", Mathematical Institute" : "");
    return '<div class="event-row has-actions">' +
      '<div class="event-date"><span>' + fmt(s, { day: "2-digit" }) + "</span><small>" +
      fmt(s, { month: "short" }) + " " + fmt(s, { year: "numeric" }) + "</small></div>" +
      '<div class="event-details"><h3' + idAttr + '><a href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer">' +
      esc(e.title) + "</a></h3>" +
      '<p class="event-meta">' + who + "</p>" +
      '<p class="event-meta">' + when + "</p></div>" +
      '<div class="event-actions">' + action + "</div></div>";
  }

  function fill(id, markup) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = markup;
  }

  function render(data) {
    var now = new Date();
    var seen = {}, all = [];
    (data.upcoming || []).concat(data.past || []).forEach(function (e) {
      if (!seen[e.id]) { seen[e.id] = true; all.push(e); }
    });
    var future = all.filter(function (e) { return endOf(e) > now; })
      .sort(function (a, b) { return startOf(a) - startOf(b); });
    var done = all.filter(function (e) { return endOf(e) <= now; })
      .sort(function (a, b) { return startOf(b) - startOf(a); });
    var withSlides = (data.slides || []).filter(function (e) { return e.start && endOf(e) <= now; })
      .sort(function (a, b) { return startOf(b) - startOf(a); });

    var empty = '<p class="seminar-list-note">No seminars scheduled yet: see the termcard above or the ' +
      '<a href="https://www.maths.ox.ac.uk/events/list/650" target="_blank" rel="noopener noreferrer">Oxford Mathematics event page</a>.</p>';

    fill("next-seminar", future.length ? row(future[0], { calendar: true, headingId: "next-seminar-heading" }) : empty);
    if (done.length) fill("recent-seminar", row(done[0], { headingId: "recent-seminar-heading" }));
    fill("upcoming-list", future.length ? future.map(function (e) { return row(e, { calendar: true }); }).join("") : empty);
    if (withSlides.length) fill("past-list", withSlides.map(function (e) { return row(e, {}); }).join(""));
  }

  document.addEventListener("click", function (ev) {
    var copy = ev.target.closest && ev.target.closest(".calendar-copy");
    if (copy && navigator.clipboard) {
      var label = copy.querySelector("span");
      navigator.clipboard.writeText(copy.getAttribute("data-copy")).then(function () {
        label.textContent = "Link copied";
        setTimeout(function () { label.textContent = "Copy calendar link"; }, 2000);
      });
    }
    // Close any open calendar menu when clicking elsewhere.
    document.querySelectorAll(".calendar-menu[open]").forEach(function (menu) {
      if (!menu.contains(ev.target)) menu.removeAttribute("open");
    });
  });

  if (!window.fetch || !window.Intl) return;
  var ctrl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
  fetch(FEED, { cache: "no-cache", signal: ctrl ? ctrl.signal : undefined })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { clearTimeout(timer); render(data); })
    .catch(function () { /* keep the static fallback */ });
})();
