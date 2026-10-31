(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (saved in localStorage) ---------- */
  const toggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const isLight = theme === 'light';
    toggle.setAttribute('aria-checked', String(isLight));
    toggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }
  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Typing animation ---------- */
  const typedEl = document.getElementById('typed');
  const words = ['HNDIT Undergraduate', 'Developer', 'Creator', 'Gamer', 'AI-Powered Builder'];

  if (typedEl && reduceMotion) typedEl.textContent = words[0];
  if (typedEl && !reduceMotion) {
    let w = 0, i = 0, deleting = false;
    typedEl.textContent = '';

    (function type() {
      const word = words[w];
      i += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, i);

      let delay = deleting ? 45 : 95;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(type, delay);
    })();
  }

  /* ---------- Scroll reveal (also triggers skill bars) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Count-up for hero stat badges (4+, 10+) ---------- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!target) return;

    el.textContent = '0' + suffix;
    setTimeout(() => {
      const start = performance.now(), dur = 1400;
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    }, 900);
  });

  /* ---------- Scroll progress, sticky header shadow, back-to-top ---------- */
  const progress = document.getElementById('progress');
  const topbar = document.getElementById('topbar');
  const toTop = document.getElementById('to-top');
  let ticking = false;

  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = scrollY;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    topbar.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 600);
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Mouse spotlight on glass cards ---------- */
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const card = e.target.closest && e.target.closest('.glass');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Cursor glow (smooth follow) ---------- */
  const glow = document.getElementById('cursor-glow');
  if (glow && matchMedia('(hover: hover)').matches) {
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      glow.style.opacity = 1;
    }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Active nav link ---------- */
  const links = document.querySelectorAll('.nav a');
  const sections = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navObserver.observe(s));
  }

  /* ---------- Project filter ---------- */
  const filterBtns = document.querySelectorAll('.project-filter');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterBtns.forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    projectCards.forEach(card => {
      card.style.display = (f === 'All' || card.dataset.category === f) ? '' : 'none';
    });
  }));
})();
