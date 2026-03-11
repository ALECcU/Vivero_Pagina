/**
 * Vivero El Granjero — script.js
 * Animaciones, interacciones y efectos premium
 */

'use strict';

/* ================================================
   1. DOM REFERENCIAS
   ================================================ */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');
const backToTop = document.getElementById('backToTop');
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

// Referencia al contenedor donde vive el menú en desktop
const navInner = navbar.querySelector('.nav-inner');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';

  if (isOpen) {
    // TELEPORTACIÓN: mover navLinks al body para que position:fixed
    // quede relativo al viewport y no al navbar (que tiene backdrop-filter)
    document.body.appendChild(navLinks);

    // Mostrar overlay
    if (navOverlay) {
      navOverlay.style.display = 'block';
      requestAnimationFrame(() => navOverlay.classList.add('active'));
    }
  } else {
    closeMenu();
  }
});

// Close menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on overlay click (toca el fondo oscuro para cerrar)
if (navOverlay) {
  navOverlay.addEventListener('click', closeMenu);
}

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target) &&
    !navOverlay.contains(e.target)) {
    closeMenu();
  }
});

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  // TELEPORTACIÓN DE VUELTA: devolver navLinks a su lugar dentro del nav
  // (antes del botón hamburger) para que desktop siga funcionando
  if (navLinks.parentElement === document.body) {
    navInner.insertBefore(navLinks, hamburger);
  }

  // Ocultar overlay con transición
  if (navOverlay) {
    navOverlay.classList.remove('active');
    navOverlay.addEventListener('transitionend', () => {
      if (!navOverlay.classList.contains('active')) {
        navOverlay.style.display = 'none';
      }
    }, { once: true });
  }
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
      const el = entry.target;
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
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
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

/* ================================================
   13. GLOW PARALLAX EN SCROLL
   ================================================ */
(function initGlowParallax() {
  const glow1 = document.querySelector('.glow-1');
  const glow2 = document.querySelector('.glow-2');
  const glow3 = document.querySelector('.glow-3');
  if (!glow1 || !glow2 || !glow3) return;

  // Factores de desplazamiento por glow (más sutil en mobile)
  const factor = window.innerWidth < 768 ? 0.03 : 0.06;

  window.addEventListener('scroll', debounce(() => {
    const scrollY = window.scrollY;
    // Cada mancha se desplaza en dirección y velocidad distinta para dar profundidad
    glow1.style.transform = `translateY(${scrollY * factor}px) scale(1)`;
    glow2.style.transform = `translateY(${-scrollY * (factor * 0.7)}px) scale(1)`;
    glow3.style.transform = `translateY(${scrollY * (factor * 1.2)}px) scale(1)`;
  }, 16), { passive: true });
})();

/* ================================================
   14. FORMULARIO — ANTI-SPAM + FORMSPREE
   ================================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');
  const honeypot = document.getElementById('hp-field');
  if (!form) return;

  // Rate-limit: bloquear re-envío durante 30 segundos
  let lastSent = 0;
  const COOLDOWN = 30000;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ── Honeypot: si un bot llenó el campo oculto, salir silenciosamente
    if (honeypot && honeypot.value.trim() !== '') return;

    // ── Rate-limit básico
    const now = Date.now();
    if (now - lastSent < COOLDOWN) {
      showMsg('⏳ Por favor espera un momento antes de enviar de nuevo.', 'warn');
      return;
    }

    // ── Validación HTML5 manual
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // ── Envío a Formspree
    submitBtn.disabled = true;
    submitBtn.textContent = '🌿 Enviando…';

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        lastSent = Date.now();
        form.reset();
        showMsg('✅ ¡Mensaje enviado! Te contactaremos pronto. 🌱', 'ok');
      } else {
        const body = await res.json().catch(() => ({}));
        const errMsg = body?.errors?.map(e => e.message).join(', ') || 'Error desconocido.';
        showMsg(`❌ No se pudo enviar: ${errMsg}`, 'err');
      }
    } catch (_) {
      showMsg('❌ Sin conexión. Revisa tu internet e intenta de nuevo.', 'err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '🌿 Enviar mensaje';
    }
  });

  // Pequeño helper para mostrar mensajes bajo el formulario
  function showMsg(text, type) {
    let el = document.getElementById('form-feedback');
    if (!el) {
      el = document.createElement('p');
      el.id = 'form-feedback';
      el.style.cssText = `
        margin-top: 14px;
        font-size: 0.9rem;
        font-weight: 600;
        font-family: var(--font-body);
        text-align: center;
        padding: 10px 18px;
        border-radius: 10px;
        transition: opacity 0.4s ease;
      `;
      form.parentElement.appendChild(el);
    }
    const colors = {
      ok: { bg: 'rgba(31,79,46,0.1)', color: '#1F4F2E' },
      err: { bg: 'rgba(198,90,46,0.1)', color: '#C65A2E' },
      warn: { bg: 'rgba(127,175,58,0.1)', color: '#5A7A20' },
    };
    el.textContent = text;
    el.style.background = colors[type].bg;
    el.style.color = colors[type].color;
    el.style.opacity = '1';
    // Auto-ocultar tras 6 segundos
    setTimeout(() => { el.style.opacity = '0'; }, 6000);
  }
})();
