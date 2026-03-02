/**
 * Vivero El Granjero — script.js
 * Animaciones, interacciones y efectos premium
 */

'use strict';

/* ================================================
   1. DOM REFERENCIAS
   ================================================ */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const backToTop   = document.getElementById('backToTop');
const particlesCt = document.getElementById('particles-container');

/* ================================================
   2. PARTÍCULAS FLOTANTES
   ================================================ */
(function createParticles() {
  const count = 50;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${1.5 + Math.random() * 3}px;
      height: ${1.5 + Math.random() * 3}px;
      animation-delay: ${Math.random() * 20}s;
      animation-duration: ${15 + Math.random() * 15}s;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    particlesCt.appendChild(p);
  }
})();

/* ================================================
   3. NAVBAR STICKY + SCROLL EFFECTS
   ================================================ */
const onScroll = debounce(() => {
  const scrollY = window.scrollY;

  // Navbar glass on scroll
  navbar.classList.toggle('scrolled', scrollY > 60);

  // Back to top button
  backToTop.classList.toggle('visible', scrollY > 400);

  // Parallax on hero visual
  const heroImg = document.querySelector('.hero-image');
  if (heroImg && scrollY < window.innerHeight) {
    heroImg.style.transform = `translateY(${scrollY * 0.08}px)`;
  }
}, 16);

window.addEventListener('scroll', onScroll, { passive: true });

/* ================================================
   4. HAMBURGER MENU
   ================================================ */
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMenu();
  }
});

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ================================================
   5. SMOOTH SCROLL (para navegadores sin scroll-behavior)
   ================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ================================================
   6. BACK TO TOP BUTTON
   ================================================ */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ================================================
   7. ANIMACIONES DE ENTRADA CON INTERSECTION OBSERVER
   ================================================ */

// Hero animations (trigger immediately on load)
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('.animate-fade-up, .animate-scale-in, .animate-fade-rotate')
      .forEach(el => el.classList.add('ready'));
  }, 100);
});

// Scroll reveal para secciones
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Stagger por posición en el grid
      const items = Array.from(entry.target.parentElement?.children || [entry.target]);
      const delay = items.indexOf(entry.target) * 100;
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -80px 0px'
});

document.querySelectorAll('.reveal-item').forEach(el => {
  revealObserver.observe(el);
});

/* ================================================
   8. CONTADOR ANIMADO
   ================================================ */
function animateCounter(element, target, duration = 2000, suffix = '') {
  const start = performance.now();
  const startVal = 0;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    element.textContent = current.toLocaleString('es-CO') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Observar cuando los contadores entran en vista
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target, 2200);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ================================================
   9. FLIP CARDS — soporte táctil
   ================================================ */
const flipCards = document.querySelectorAll('.service-card-flip');

// En mobile (touch), usar click para flip
let isTouchDevice = false;
document.addEventListener('touchstart', () => { isTouchDevice = true; }, { once: true });

flipCards.forEach(card => {
  card.addEventListener('click', () => {
    if (isTouchDevice || window.innerWidth <= 767) {
      card.classList.toggle('flipped');
    }
  });

  // Teclado accesible
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(card.classList.contains('flipped')));
    }
  });
});

// Cerrar flip al hacer click fuera en mobile
document.addEventListener('click', (e) => {
  if (isTouchDevice || window.innerWidth <= 767) {
    flipCards.forEach(card => {
      if (!card.contains(e.target)) {
        card.classList.remove('flipped');
        card.setAttribute('aria-pressed', 'false');
      }
    });
  }
});

/* ================================================
   10. PARALLAX SUAVE EN HERO BG GRADIENT
   ================================================ */
const heroBg = document.querySelector('.hero-bg-gradient');
window.addEventListener('mousemove', debounce((e) => {
  if (!heroBg || window.innerWidth < 1024) return;
  const x = (e.clientX / window.innerWidth  - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  heroBg.style.transform = `translate(${x}px, ${y}px)`;
}, 30));

/* ================================================
   11. LOGOS SLIDE PAUSA EN HOVER
   ================================================ */
const logosSlide = document.querySelector('.logos-slide');
if (logosSlide) {
  logosSlide.parentElement.addEventListener('mouseenter', () => {
    logosSlide.style.animationPlayState = 'paused';
  });
  logosSlide.parentElement.addEventListener('mouseleave', () => {
    logosSlide.style.animationPlayState = 'running';
  });
}

/* ================================================
   12. ACTIVE NAV LINK CON SCROLL SPY
   ================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-links .nav-link:not(.nav-link--cta)');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach(s => spyObserver.observe(s));

// Estilo activo en CSS inline
const style = document.createElement('style');
style.textContent = `.nav-link.active { color: var(--secondary) !important; }
.nav-link.active::after { width: 100% !important; }`;
document.head.appendChild(style);

/* ================================================
   UTILIDADES
   ================================================ */
function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
