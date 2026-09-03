document.addEventListener('DOMContentLoaded', () => {

  /* 1.heder scroll */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* 2.menu hambúrguer */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('active');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  };

  hamburger.addEventListener('click', toggleMenu);

 
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('active')) toggleMenu();
    });
  });

  /* -3. scroll reveal */
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


  const heroEl = document.querySelector('.hero');
  const svgDeco = document.getElementById('svgDeco');

  if (heroEl && svgDeco && window.matchMedia('(pointer: fine)').matches) {
    const MAX_SHIFT = 26; // px de deslocamento máximo

    const onHeroMove = (e) => {
      const rect = heroEl.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;   // 0 -> 1
      const relY = (e.clientY - rect.top) / rect.height;   // 0 -> 1

      const offsetX = (relX - 0.5) * 2 * MAX_SHIFT; // -MAX_SHIFT..MAX_SHIFT
      const offsetY = (relY - 0.5) * 2 * MAX_SHIFT;

      svgDeco.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };

    const resetHeroMove = () => {
      svgDeco.style.transform = 'translate(0px, 0px)';
    };

    heroEl.addEventListener('mousemove', onHeroMove);
    heroEl.addEventListener('mouseleave', resetHeroMove);
  }

});