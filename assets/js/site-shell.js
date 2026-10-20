(function () {
  'use strict';
  var page = window.location.pathname.split('/').pop() || 'index.html';
  var navItems = [
    { href: 'about.html', label: 'About' },
    { href: 'sponsors.html', label: 'Sponsors' },
    { href: 'contact.html', label: 'Contact' },
    { href: 'https://www.amp26.com/', label: "Conference '26", external: true },
    { href: 'seminars.html', label: 'Seminars' },
    { href: 'seminars.html#termcard', label: 'Termcard', className: 'nav-item-termcard' }
  ];
  function navigation() {
    return navItems.map(function (item) {
      var external = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      var current = !item.external && item.href.split('#')[0] === page ? ' aria-current="page"' : '';
      var className = item.className ? ' ' + item.className : '';
      return '<a class="nav-item' + className + '" href="' + item.href + '"' + external + current + '>' + item.label + '</a>';
    }).join('');
  }
  function renderHeader() {
    var existingHeader = document.querySelector('.site-header');
    if (existingHeader) existingHeader.remove();
    var header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = '<div class="wrapper"><a class="home-link" href="index.html" aria-label="Oxford SIAM Student Chapter home"><svg class="home-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></a><nav class="site-nav" aria-label="Primary navigation"><input type="checkbox" id="nav-trigger" aria-label="Toggle navigation" /><label for="nav-trigger"><span class="menu-icon" aria-hidden="true"></span></label><div class="nav-items">' + navigation() + '</div></nav><div class="header-social" aria-label="Social media"><a href="https://www.instagram.com/oxfordsiamsc/" target="_blank" rel="noopener noreferrer" aria-label="Instagram: @oxfordsiamsc"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a><a href="https://www.linkedin.com/company/oxfordsiamsc/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn: Oxford SIAM Student Chapter"><i class="fa-brands fa-linkedin" aria-hidden="true"></i></a></div></div>';
    document.body.insertBefore(header, document.body.firstChild);
  }
  function renderFooter() {
    var existingFooter = document.querySelector('.site-footer');
    if (existingFooter) existingFooter.remove();
    var footer = document.createElement('footer');
    footer.className = 'site-footer h-card';
    footer.innerHTML = '<data class="u-url" value="/"></data><div class="wrapper"><div class="footer-col-wrapper"><div class="footer-col"><img src="assets/images/sponsors/SIAM_student.png" alt="SIAM student chapter logo"></div><div class="footer-col"><p>The University of Oxford SIAM Student Chapter is a fast-growing society devoted to facilitating engagement between the University of Oxford’s international applied mathematics community and industry through conferences, workshops, competitions, prizes and other events.</p><div class="footer-social"><span>Follow the Chapter</span><a href="https://www.instagram.com/oxfordsiamsc/" target="_blank" rel="noopener noreferrer" aria-label="Instagram: @oxfordsiamsc"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a><a href="https://www.linkedin.com/company/oxfordsiamsc/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn: Oxford SIAM Student Chapter"><i class="fa-brands fa-linkedin" aria-hidden="true"></i></a></div></div></div></div>';
    document.body.appendChild(footer);
  }
  function linkCommitteeProfiles() {
    var profiles = {
      'Thomas Higham': 'https://www.maths.ox.ac.uk/people/thomas.higham',
      'Mark Alvares': 'https://www.maths.ox.ac.uk/people/mark.alvaresperes',
      'Prof Dominic Vella': 'https://www.maths.ox.ac.uk/people/dominic.vella',
      'Jesus Ait Idir Lahuerta': 'https://www.maths.ox.ac.uk/people/jesus.aitidirlahuerta',
      'Francesco Hrobat': 'https://www.maths.ox.ac.uk/people/francesco.hrobat'
    };
    document.querySelectorAll('.committee').forEach(function (section) {
      var heading = section.querySelector('h2');
      if (!heading || heading.textContent.trim() !== 'Committee 2026') return;
      section.querySelectorAll('.committee-member').forEach(function (member) {
        var name = member.querySelector('h3');
        var url = name && profiles[name.textContent.trim()];
        if (!url) return;
        var link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'committee-profile-link';
        while (member.firstChild) link.appendChild(member.firstChild);
        member.appendChild(link);
      });
    });
  }
  function setupScrollReveals() {
    var targets = document.querySelectorAll('.committee, .social-follow, .sponsor, .post-header, .post-content > h2');
    if (!targets.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('motion-ready');
    targets.forEach(function (target, index) {
      target.classList.add('reveal-on-scroll');
      target.style.setProperty('--reveal-order', String(index % 4));
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (target) { observer.observe(target); });
  }
  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    linkCommitteeProfiles();
    setupScrollReveals();
  });
}());
