// ===============================================================
// Mushahid Raza — Personal Site
// Only what earns its place: status bar, nav state, mobile menu,
// reveal-on-scroll, and the metric counters.
// ===============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Live "uptime" since career start ----------
  const uptimeEl = document.getElementById('uptime-text');
  if (uptimeEl) {
    const start = new Date(2021, 7, 1); // August 2021
    const now = new Date();
    let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months -= 1;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    parts.push(`${remMonths}m`);
    uptimeEl.textContent = `${parts.join(' ')} in Program & Product Operations`;
  }

  // ---------- Status bar + nav scroll state ----------
  const statusBar = document.getElementById('status-bar');
  const nav = document.getElementById('nav');
  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', scrolled);
    statusBar.classList.toggle('hide', scrolled);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobile menu ----------
  const burger = document.getElementById('nav-burger');
  const links = document.getElementById('nav-links');

  const closeMenu = () => {
    burger.classList.remove('open');
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  };

  burger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Metric counters ----------
  const counters = document.querySelectorAll('.count');

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.round(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : target;
    };
    requestAnimationFrame(step);
  };

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(el => countObserver.observe(el));

  // ---------- Cursor spotlight ----------
  const root = document.documentElement;
  window.addEventListener('mousemove', (e) => {
    root.style.setProperty('--mx', `${e.clientX}px`);
    root.style.setProperty('--my', `${e.clientY}px`);
  }, { passive: true });

  // ---------- Hero network canvas ----------
  // Visualizes the actual cross-functional teams from the resume —
  // Product, Engineering, Policy, CX, Safety, Operations, Risk —
  // converging on a single center node. Not decoration; the diagram.
  const canvas = document.getElementById('network-canvas');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let w = 0, h = 0;

    const labels = ['Product', 'Engineering', 'Policy', 'CX', 'Safety', 'Operations', 'Risk'];
    const nodes = labels.map((label, i) => {
      const angle = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      return {
        label,
        fx: 0.5 + Math.cos(angle) * 0.40,
        fy: 0.5 + Math.sin(angle) * 0.40,
        phase: Math.random() * Math.PI * 2,
      };
    });
    const centerNode = { fx: 0.5, fy: 0.5 };
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    const frame = (t) => {
      ctx.clearRect(0, 0, w, h);
      const cx = centerNode.fx * w, cy = centerNode.fy * h;

      nodes.forEach((n) => {
        let nx = n.fx * w + Math.sin(t / 1800 + n.phase) * 4;
        let ny = n.fy * h + Math.cos(t / 2200 + n.phase) * 4;

        const dx = nx - mouse.x, dy = ny - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 60) {
          const force = ((60 - dist) / 60) * 10;
          nx += (dx / dist) * force;
          ny += (dy / dist) * force;
        }

        const grad = ctx.createLinearGradient(cx, cy, nx, ny);
        grad.addColorStop(0, 'rgba(242, 169, 59, 0.28)');
        grad.addColorStop(1, 'rgba(143, 174, 139, 0.10)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();

        ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242, 169, 59, 0.85)';
        ctx.fill();

        ctx.font = '500 11px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(163, 156, 143, 0.8)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = nx > cx ? 'left' : 'right';
        ctx.fillText(n.label, nx + (nx > cx ? 10 : -10), ny);
      });

      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f2a93b';
      ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(242, 169, 59, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (!reduceMotion) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }

});
