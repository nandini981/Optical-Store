// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ===== MOBILE HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close nav on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ===== SCROLL REVEAL ANIMATION =====
const revealElements = document.querySelectorAll(
  '.trust-badge, .service-card, .gallery-item, .why-card, .review-card, .about-content, .about-image-wrapper, .visit-info, .map-wrapper, .contact-info, .contact-form'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, index * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== CONTACT FORM =====
function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const btn = form.querySelector('button[type="submit"]');
  const successMsg = document.getElementById('formSuccess');

  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate form submission (replace with actual backend)
  setTimeout(() => {
    form.reset();
    btn.textContent = 'Send Message →';
    btn.disabled = false;
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 5000);
  }, 1200);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== STICKY CTA VISIBILITY =====
const stickyCta = document.getElementById('stickyCta');
const heroSection = document.querySelector('.hero');

window.addEventListener('scroll', () => {
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  if (heroBottom < 0) {
    stickyCta.style.opacity = '1';
    stickyCta.style.pointerEvents = 'all';
  } else {
    stickyCta.style.opacity = '0';
    stickyCta.style.pointerEvents = 'none';
  }
}, { passive: true });

// ===== TRUST BADGES COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const startTime = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + (target - start) * eased;
    el.textContent = isDecimal
      ? value.toFixed(1) + suffix
      : Math.floor(value).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// [CUSTOMIZE] The counter animation auto-detects numbers in trust badge text.
// No changes needed here when customizing for a new client.
const countersObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const trustBadges = document.querySelectorAll('.trust-text strong');
      trustBadges.forEach(badge => {
        const text = badge.textContent;
        // Match patterns like "500+", "4.8 Stars", "5.0 Stars"
        const decimalMatch = text.match(/^(\d+\.\d+)/);
        const intMatch = text.match(/^([\d,]+)\+/);
        if (decimalMatch) {
          animateCounter(badge, parseFloat(decimalMatch[1]), ' Stars');
        } else if (intMatch) {
          const num = parseInt(intMatch[1].replace(/,/g, ''), 10);
          animateCounter(badge, num, '+');
        }
      });
      countersObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const trustSection = document.querySelector('.trust-section');
if (trustSection) countersObserver.observe(trustSection);
