/* =====================================================
   AURUM OPTICS — GSAP Cinematic Animation System
   Defensive: always works, even without CDN
===================================================== */

/* ───────────── SAFETY FLAGS ───────────── */
const HAS_GSAP = typeof gsap !== 'undefined';
const HAS_LENIS = typeof Lenis !== 'undefined';
const HAS_ST = HAS_GSAP && typeof ScrollTrigger !== 'undefined';

/* ───────────── UTILITIES ───────────── */
const qs = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];

function gTo(el, props) { if (HAS_GSAP && el) try { gsap.to(el, props); } catch (e) { } }
function gFromTo(el, from, to, st) { if (HAS_GSAP && el) try { gsap.fromTo(el, from, st ? { ...to, scrollTrigger: st } : to); } catch (e) { } }

function splitIntoWords(el) {
  if (!el) return [];
  el.innerHTML = el.innerHTML.replace(/(\S+)/g,
    '<span class="split-w" style="display:inline-block;overflow:hidden;"><span class="split-i" style="display:inline-block;">$1</span></span>');
  return qsa('.split-i', el);
}

/* ═══════════════════════════════════════
   1. LENIS SMOOTH SCROLL
═══════════════════════════════════════ */
let lenis = null;
if (HAS_LENIS) {
  try {
    lenis = new Lenis({
      duration: 1.4,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2,
    });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
  } catch (e) { console.warn('Lenis unavailable:', e); lenis = null; }
}

if (HAS_ST) {
  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

/* ═══════════════════════════════════════
   2. PAGE LOADER — always hides
═══════════════════════════════════════ */
const loader = qs('#pageLoader');
const loaderBar = qs('#loaderBar');

document.body.style.overflow = 'hidden';

function hideLoader() {
  if (!loader || loader._gone) return;
  loader._gone = true;
  loader.style.transition = 'opacity 0.6s ease';
  loader.style.opacity = '0';
  document.body.style.overflow = '';
  setTimeout(() => {
    loader.style.display = 'none';
    initHeroAnimations();
    initParticles();
  }, 660);
}

if (HAS_GSAP && loaderBar) {
  gsap.to(loaderBar, {
    width: '100%', duration: 1.4, ease: 'power2.inOut',
    onComplete: () => gsap.to(loader, { opacity: 0, duration: 0.7, ease: 'power2.inOut', onComplete: hideLoader })
  });
} else {
  // No GSAP — CSS fallback loader bar, hide after 1.8s
  if (loaderBar) loaderBar.style.width = '100%';
  setTimeout(hideLoader, 1800);
}

/* ═══════════════════════════════════════
   3. CUSTOM CURSOR (desktop only)
═══════════════════════════════════════ */
const cursorDot = qs('#cursorDot');
const cursorRing = qs('#cursorRing');

if (HAS_GSAP && cursorDot && cursorRing) {
  gsap.set([cursorDot, cursorRing], { xPercent: -50, yPercent: -50 });

  let mx = innerWidth / 2, my = innerHeight / 2;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(cursorDot, { x: mx, y: my, duration: 0.1, ease: 'none' });
    gsap.to(cursorRing, { x: mx, y: my, duration: 0.5, ease: 'power2.out' });
  });

  qsa('a, button, .product-card, .exp-card, .testimonial-card, .magnetic-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursorRing, { scale: 1.8, borderColor: 'var(--gold)', duration: 0.3 });
      gsap.to(cursorDot, { scale: 0, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursorRing, { scale: 1, borderColor: 'rgba(201,168,76,0.25)', duration: 0.3 });
      gsap.to(cursorDot, { scale: 1, duration: 0.2 });
    });
  });
}

/* ═══════════════════════════════════════
   4. MAGNETIC BUTTONS
═══════════════════════════════════════ */
if (HAS_GSAP) {
  qsa('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    });
  });
}

/* ═══════════════════════════════════════
   5. HERO ENTRANCE (called after loader hides)
═══════════════════════════════════════ */
function initHeroAnimations() {
  if (!HAS_GSAP) {
    // CSS fallback — just make everything visible
    qsa('#heroEyebrow, #heroTitle .hero-line, #heroSubtitle, #heroActions, #heroStats, #heroScroll')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.fromTo('#heroEyebrow',
    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }
  );

  qsa('#heroTitle .hero-line').forEach((line, i) => {
    tl.fromTo(line,
      { y: '100%', opacity: 0, clipPath: 'inset(100% 0 0 0)' },
      { y: '0%', opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.1 },
      i === 0 ? '-=0.5' : '-=0.7'
    );
  });

  tl.fromTo('#heroSubtitle',
    { opacity: 0, y: 30, filter: 'blur(8px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }, '-=0.5');

  tl.fromTo('#heroActions',
    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');

  tl.fromTo('#heroStats',
    { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.9 }, '-=0.7');

  tl.fromTo('#heroScroll',
    { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.4');
}

/* ═══════════════════════════════════════
   6. HERO IMAGE PARALLAX
═══════════════════════════════════════ */
if (HAS_ST) {
  gsap.to('#heroBg', {
    yPercent: 25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ═══════════════════════════════════════
   7. HERO MOUSE PARALLAX
═══════════════════════════════════════ */
const heroContent = qs('#heroContent');
document.addEventListener('mousemove', e => {
  if (!heroContent || !HAS_GSAP || scrollY > innerHeight * 0.5) return;
  gsap.to(heroContent, {
    x: (e.clientX / innerWidth - 0.5) * 14,
    y: (e.clientY / innerHeight - 0.5) * 8,
    duration: 1.0, ease: 'power2.out'
  });
});

/* ═══════════════════════════════════════
   8. NAVBAR
═══════════════════════════════════════ */
const navbar = qs('#navbar');
if (HAS_ST) {
  ScrollTrigger.create({
    start: 'top -80px', end: 99999,
    onUpdate: self => {
      if (self.scroll() > 80) navbar.classList.add('scrolled');
      else if (self.direction === -1 && self.scroll() < 80) navbar.classList.remove('scrolled');
    }
  });
} else {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', scrollY > 80);
  }, { passive: true });
}

/* ═══════════════════════════════════════
   9. MOBILE HAMBURGER
═══════════════════════════════════════ */
const hamburger = qs('#hamburger');
const navLinks = qs('#navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open && HAS_GSAP) {
    gsap.fromTo(qsa('.nav-link, .nav-cta-link'),
      { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, delay: 0.1 });
  }
  if (lenis) open ? lenis.stop() : lenis.start();
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
}));
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }
});

/* ═══════════════════════════════════════
   10. SCROLL REVEAL — split titles
═══════════════════════════════════════ */
if (HAS_ST) {
  qsa('.gsap-split-title').forEach(title => {
    const words = splitIntoWords(title);
    gsap.fromTo(words,
      { y: '120%', opacity: 0, rotateX: -60 },
      {
        y: '0%', opacity: 1, rotateX: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out',
        scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  qsa('.gsap-reveal-up').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  qsa('.gsap-reveal-left').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -80, filter: 'blur(4px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  qsa('.gsap-reveal-right').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 80, filter: 'blur(4px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  // Eyebrow line expand
  qsa('.section-eyebrow-luxury .eyebrow-line').forEach(line => {
    gsap.fromTo(line,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: line, start: 'top 90%' }
      }
    );
  });

  // Marquee strip
  gsap.fromTo('.marquee-strip',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.marquee-strip', start: 'top 95%' }
    }
  );
}

/* ═══════════════════════════════════════
   11. STAGGER CARD REVEALS
═══════════════════════════════════════ */
if (HAS_ST) {
  const cardGroups = new Map();
  qsa('.gsap-stagger-card').forEach(card => {
    const p = card.parentElement;
    if (!cardGroups.has(p)) cardGroups.set(p, []);
    cardGroups.get(p).push(card);
  });
  cardGroups.forEach((cards, parent) => {
    gsap.fromTo(cards,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: parent, start: 'top 80%', toggleActions: 'play none none none' }
      }
    );
  });
}

/* ═══════════════════════════════════════
   12. PARALLAX (scrub)
═══════════════════════════════════════ */
if (HAS_ST) {
  // Divider bg
  gsap.fromTo('#parallaxBg',
    { yPercent: -20 },
    {
      yPercent: 20, ease: 'none',
      scrollTrigger: { trigger: '#parallaxDivider', start: 'top bottom', end: 'bottom top', scrub: true }
    }
  );
  // Story image
  gsap.to('.story-img', {
    yPercent: -10, ease: 'none',
    scrollTrigger: { trigger: '.story-image-wrap', start: 'top bottom', end: 'bottom top', scrub: true }
  });
}

/* ═══════════════════════════════════════
   13. HORIZONTAL SCROLL (pinned, desktop)
═══════════════════════════════════════ */
if (HAS_ST && innerWidth >= 900) {
  const wrapper = qs('#hScrollWrapper');
  const track = qs('#hScrollTrack');
  if (wrapper && track) {
    const dist = track.scrollWidth - innerWidth + 80;
    if (dist > 0) {
      gsap.to(track, {
        x: -dist, ease: 'none',
        scrollTrigger: {
          trigger: wrapper, start: 'top top',
          end: `+=${dist}`, pin: true, scrub: 0.8,
          anticipatePin: 1, invalidateOnRefresh: true
        }
      });
    }
  }
}

/* ═══════════════════════════════════════
   14. 3D CARD TILT
═══════════════════════════════════════ */
if (HAS_GSAP) {
  // Product cards
  qsa('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 1000, duration: 0.4, ease: 'power2.out' });
      const shimmer = qs('.product-shimmer', card);
      if (shimmer) gsap.to(shimmer, {
        background: `radial-gradient(circle at ${x * 50 + 50}% ${y * 50 + 50}%,rgba(201,168,76,.12) 0%,transparent 60%)`,
        opacity: 1, duration: 0.3
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' });
      const shimmer = qs('.product-shimmer', card);
      if (shimmer) gsap.to(shimmer, { opacity: 0, duration: 0.3 });
    });
  });

  // Testimonial + exp cards
  qsa('.testimonial-card, .exp-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      gsap.to(card, { rotateY: x * 5, rotateX: -y * 5, transformPerspective: 800, scale: 1.02, duration: 0.3 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1,0.5)' });
    });
  });

  // Product image zoom on hover
  qsa('.product-img-wrap').forEach(wrap => {
    const img = qs('.product-img', wrap);
    if (!img) return;
    gsap.set(img, { scale: 1.08 });
    wrap.addEventListener('mouseenter', () => gsap.to(img, { scale: 1, duration: 0.7, ease: 'power3.out' }));
    wrap.addEventListener('mouseleave', () => gsap.to(img, { scale: 1.08, duration: 0.7, ease: 'power3.out' }));
  });
}

/* ═══════════════════════════════════════
   15. ANIMATED COUNTERS
═══════════════════════════════════════ */
if (HAS_GSAP) {
  qsa('.counter').forEach(el => {
    const obj = { val: 0 };
    const target = +el.dataset.target;
    const st = HAS_ST ? { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } : null;
    gsap.to(obj, {
      val: target, duration: 2, ease: 'power2.out', round: true,
      onUpdate: () => { el.textContent = obj.val; },
      ...(st ? { scrollTrigger: st } : {})
    });
  });
} else {
  // Fallback: just set target value
  qsa('.counter').forEach(el => { el.textContent = el.dataset.target; });
}

/* ═══════════════════════════════════════
   16. LOGO HOVER SPIN
═══════════════════════════════════════ */
const logoEl = qs('.logo');
const logoMark = qs('.logo-mark');
if (HAS_GSAP && logoEl && logoMark) {
  logoEl.addEventListener('mouseenter', () => gsap.to(logoMark, { rotation: 90, duration: 0.5, ease: 'power3.out' }));
  logoEl.addEventListener('mouseleave', () => gsap.to(logoMark, { rotation: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' }));
}

/* ═══════════════════════════════════════
   17. SCROLL PROGRESS BAR
═══════════════════════════════════════ */
const bar = document.createElement('div');
bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,#c9a84c,#e8d49e);z-index:99999;pointer-events:none;';
document.body.appendChild(bar);

function updateProgress() {
  const pct = scrollY / (document.body.scrollHeight - innerHeight) * 100;
  bar.style.width = pct + '%';
}
if (lenis) {
  lenis.on('scroll', ({ progress }) => { bar.style.width = (progress * 100) + '%'; });
} else {
  window.addEventListener('scroll', updateProgress, { passive: true });
}

/* ═══════════════════════════════════════
   18. STICKY MOBILE CTA
═══════════════════════════════════════ */
const stickyCta = qs('#stickyCta');
const heroSection = qs('.hero');

if (HAS_ST && stickyCta && heroSection) {
  ScrollTrigger.create({
    trigger: heroSection,
    start: 'bottom top',
    onEnter: () => stickyCta.classList.add('visible'),
    onLeaveBack: () => stickyCta.classList.remove('visible'),
  });
} else {
  // Fallback: native scroll for sticky CTA
  window.addEventListener('scroll', () => {
    if (!stickyCta || !heroSection) return;
    stickyCta.classList.toggle('visible', heroSection.getBoundingClientRect().bottom < 0);
  }, { passive: true });
}

/* ═══════════════════════════════════════
   19. SMOOTH ANCHOR SCROLL
═══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -80, duration: 1.8, easing: t => 1 - Math.pow(1 - t, 5) });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════
   20. CONTACT FORM
═══════════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault();
  const form = qs('#contactForm');
  const btn = form.querySelector('button[type="submit"]');
  const btnSpan = btn.querySelector('span');
  const successMsg = qs('#formSuccess');
  btnSpan.textContent = 'Sending...';
  btn.disabled = true;
  if (HAS_GSAP) gsap.to(btn, { opacity: 0.6, duration: 0.2 });
  setTimeout(() => {
    form.reset();
    btnSpan.textContent = 'Send Private Inquiry';
    btn.disabled = false;
    if (HAS_GSAP) gsap.to(btn, { opacity: 1, duration: 0.3 });
    successMsg.style.display = 'block';
    if (HAS_GSAP) gsap.fromTo(successMsg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
    setTimeout(() => {
      if (HAS_GSAP) gsap.to(successMsg, { opacity: 0, duration: 0.4, onComplete: () => { successMsg.style.display = 'none'; } });
      else successMsg.style.display = 'none';
    }, 6000);
  }, 1500);
}

/* ═══════════════════════════════════════
   21. PARTICLES
═══════════════════════════════════════ */
function initParticles() {
  const canvas = qs('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;

  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.4 + 0.2,
    sx: (Math.random() - 0.5) * 0.25,
    sy: -Math.random() * 0.35 - 0.08,
    a: Math.random() * 0.45 + 0.05,
    ad: (Math.random() - 0.5) * 0.008,
  }));

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.a})`; ctx.fill();
      p.x += p.sx; p.y += p.sy; p.a += p.ad;
      if (p.a < 0.03 || p.a > 0.55) p.ad *= -1;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
    });
    requestAnimationFrame(draw);
  })();

  window.addEventListener('resize', () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }, { passive: true });
}

/* ═══════════════════════════════════════
   22. ITALIC GLOW PULSE
═══════════════════════════════════════ */
if (HAS_GSAP) {
  setTimeout(() => {
    const el = qs('.hero-line--italic .split-word') || qs('.hero-line--italic');
    if (el) gsap.to(el, { textShadow: '0 0 40px rgba(201,168,76,0.5)', duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }, 2800);
}

/* ═══════════════════════════════════════
   23. MARQUEE PAUSE ON HOVER
═══════════════════════════════════════ */
const marqueeTrack = qs('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => { marqueeTrack.style.animationPlayState = 'paused'; });
  marqueeTrack.addEventListener('mouseleave', () => { marqueeTrack.style.animationPlayState = 'running'; });
}

/* ═══════════════════════════════════════
   24. REFRESH on load
═══════════════════════════════════════ */
window.addEventListener('load', () => { if (HAS_ST) ScrollTrigger.refresh(); });
