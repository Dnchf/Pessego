/* =========================================================
   PÊSSEGO — script.js
   1) Header com efeito ao rolar
   2) Menu hambúrguer responsivo
   3) Scroll reveal (Intersection Observer)
   4) Contadores animados nas estatísticas
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. HEADER AO ROLAR ---------- */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- 2. MENU HAMBÚRGUER ---------- */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('active');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  };

  hamburger.addEventListener('click', toggleMenu);

  // Fecha o menu ao clicar em um link (mobile)
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('active')) toggleMenu();
    });
  });

  /* ---------- 3. SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // anima uma vez só
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- 4. CONTADORES ANIMADOS ---------- */
  const counters = document.querySelectorAll('.stat__number');

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1400; // ms
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => counterObserver.observe(el));

  /* ---------- ANO NO FOOTER ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});