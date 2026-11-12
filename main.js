/* ==========================================================================
   David Sargsyan AI Research Lab — Editorial Motion, Menu & Navigation
   ========================================================================== */
(function () {
  const root = document.documentElement;
  const body = document.body;
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js-enabled');

  // Smooth entry fade-in
  requestAnimationFrame(function () {
    root.classList.add('is-loaded');
  });

  // Top 1px brass scroll-progress bar
  const progressBar = document.getElementById('scroll-progress');
  let ticking = false;

  function updateProgress() {
    ticking = false;
    if (!progressBar) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
    progressBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateProgress();

  // Mobile Menu Drawer Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  function closeDrawer() {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
  }

  function openDrawer() {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    body.classList.add('menu-open');
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', function () {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close drawer when clicking any section anchor inside it
    const drawerAnchors = mobileDrawer.querySelectorAll('.mobile-drawer-nav a');
    drawerAnchors.forEach(function (anchor) {
      anchor.addEventListener('click', function () {
        closeDrawer();
      });
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        closeDrawer();
        menuToggle.focus();
      }
    });

    // Close drawer if viewport widens to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1080 && mobileDrawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  // Staggered Scroll-Triggered Reveals
  const revealNodes = document.querySelectorAll('[data-reveal]');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealNodes.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.getAttribute('data-delay');
          if (delay) {
            el.style.transitionDelay = delay + 'ms';
          }
          el.classList.add('is-visible');
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    revealNodes.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // Tabular Counter Roll-Up on Key Facts
  const counters = document.querySelectorAll('[data-count-to]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count-to') || '0', 10);
    if (prefersReduced || target === 0) {
      el.textContent = String(target);
      return;
    }
    const duration = 900;
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = String(target);
      }
    }
    requestAnimationFrame(frame);
  }

  if (counters.length > 0) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.35 }
      );
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }
  }

  // Subtle Cursor-Tracked Brass Sheen on Architectural Cards
  if (!prefersReduced) {
    const interactiveCards = document.querySelectorAll('.track-item, .system-card, .team-member');
    interactiveCards.forEach(function (card) {
      card.addEventListener(
        'pointermove',
        function (e) {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mx', x.toFixed(1) + 'px');
          card.style.setProperty('--my', y.toFixed(1) + 'px');
        },
        { passive: true }
      );
    });
  }

  // Full Page Refresh / Smooth Transition on Language Switch
  const langLinks = document.querySelectorAll('.lang-link, .mobile-lang-btn');
  langLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      closeDrawer();
      const targetUrl = link.href;
      if (prefersReduced) {
        if (link.getAttribute('aria-current') === 'page') {
          window.location.reload();
        } else {
          window.location.assign(targetUrl);
        }
        return;
      }
      root.classList.add('is-leaving');
      window.setTimeout(function () {
        if (link.getAttribute('aria-current') === 'page') {
          window.location.reload();
        } else {
          window.location.assign(targetUrl);
        }
      }, 210);
    });
  });

  // Restore visibility on bfcache navigation
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      root.classList.remove('is-leaving');
      root.classList.add('is-loaded');
    }
  });
})();
