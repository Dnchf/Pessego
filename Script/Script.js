document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const themeButton = document.getElementById('theme-toggle');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const readTheme = () => {
        try {
            const value = localStorage.getItem('pessego-theme');
            return value === 'dark' || value === 'light' ? value : null;
        } catch (_) { return null; }
    };
    let chosenTheme = readTheme();
    const applyTheme = (theme) => {
        const dark = theme === 'dark';
        root.dataset.theme = dark ? 'dark' : 'light';
        themeButton.setAttribute('aria-pressed', String(dark));
        themeButton.title = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
    };
    applyTheme(chosenTheme || (systemTheme.matches ? 'dark' : 'light'));
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
        chosenTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(chosenTheme);
        try { localStorage.setItem('pessego-theme', chosenTheme); } catch (_) { }
    });
    systemTheme.addEventListener('change', (event) => {
        if (!chosenTheme) applyTheme(event.matches ? 'dark' : 'light');
    });
    window.addEventListener('storage', (event) => {
        if (event.key !== 'pessego-theme' && event.key !== null) return;
        chosenTheme = readTheme();
        applyTheme(chosenTheme || (systemTheme.matches ? 'dark' : 'light'));
    });

    // Header fixo e menu mobile acessível por teclado.
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const mobile = window.matchMedia('(max-width: 900px)');
    const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    const setMenu = (open, returnFocus = false) => {
        const isOpen = mobile.matches && open;
        nav.classList.toggle('active', isOpen);
        root.classList.toggle('menu-open', isOpen);
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        nav.inert = mobile.matches && !isOpen;
        if (nav.inert) nav.setAttribute('aria-hidden', 'true');
        else nav.removeAttribute('aria-hidden');
        if (returnFocus) hamburger.focus();
    };
    hamburger.addEventListener('click', () => setMenu(!nav.classList.contains('active')));
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobile.matches) setMenu(false, true);
        });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('active')) setMenu(false, true);
    });
    document.addEventListener('pointerdown', (event) => {
        if (!header.contains(event.target) && nav.classList.contains('active')) setMenu(false);
    });
    document.addEventListener('focusin', (event) => {
        if (!header.contains(event.target) && nav.classList.contains('active')) setMenu(false);
    });
    mobile.addEventListener('change', () => {
        const focusWouldBeHidden = mobile.matches && nav.contains(document.activeElement);
        setMenu(false, focusWouldBeHidden);
    });
    setMenu(false);
    root.classList.add('has-menu');

    // O menu indica a seção em leitura, com um cálculo por frame.
    const sectionLinks = [...nav.querySelectorAll('.nav__link')];
    const sections = [...document.querySelectorAll('main > section[id]')];
    let scrollFrame = 0;
    const updateCurrentSection = () => {
        scrollFrame = 0;
        const marker = header.getBoundingClientRect().height + 90;
        let current = '';
        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= marker) current = section.id;
        });
        sectionLinks.forEach(link => {
            if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };
    const scheduleSectionUpdate = () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateCurrentSection);
    };
    window.addEventListener('scroll', scheduleSectionUpdate, { passive: true });
    window.addEventListener('resize', scheduleSectionUpdate, { passive: true });
    updateCurrentSection();

    // Os detalhes continuam funcionando nativamente quando os scripts estão desligados.
    document.querySelectorAll('.disclosure').forEach(details => {
        const summary = details.querySelector('summary');
        let animation = null;
        let expanding = details.open;
        const settle = () => {
            details.open = expanding;
            if (animation) animation.cancel();
            animation = null;
            details.style.removeProperty('overflow');
            scheduleSectionUpdate();
        };
        summary.addEventListener('click', event => {
            if (reducedMotion.matches || !details.animate) return;
            event.preventDefault();
            const startHeight = details.getBoundingClientRect().height;
            expanding = animation ? !expanding : !details.open;
            if (animation) animation.cancel();
            details.open = true;
            const style = getComputedStyle(details);
            const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
            const endHeight = expanding ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + borders;
            details.style.overflow = 'hidden';
            animation = details.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], {
                duration: 300, easing: 'cubic-bezier(.22,1,.36,1)'
            });
            animation.onfinish = settle;
        });
        window.addEventListener('resize', () => { if (animation) settle(); }, { passive: true });
        reducedMotion.addEventListener('change', () => { if (animation) settle(); });
    });

    // Copia somente o texto escolhido; nenhuma mensagem é enviada pelo site.
    const copyButton = document.getElementById('copy-message');
    const messageField = document.getElementById('support-message');
    const copyStatus = document.getElementById('copy-status');
    if (copyButton && messageField && copyStatus) {
        copyButton.hidden = false;
        const fitMessage = () => {
            messageField.style.height = 'auto';
            messageField.style.height = `${messageField.scrollHeight}px`;
        };
        fitMessage();
        window.addEventListener('resize', fitMessage, { passive: true });
        if (document.fonts) document.fonts.ready.then(fitMessage);
        copyButton.addEventListener('click', async () => {
            let copied = false;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(messageField.value);
                    copied = true;
                }
            } catch (_) { /* Oferece seleção manual quando o navegador bloqueia a cópia. */ }
            if (!copied) {
                messageField.focus({ preventScroll: true });
                messageField.select();
                try { copied = document.execCommand('copy'); } catch (_) { }
                if (copied) copyButton.focus({ preventScroll: true });
            }
            copyStatus.textContent = copied
                ? 'Mensagem copiada! Cole na conversa com quem você quer acolher.'
                : 'Texto selecionado. Use a opção Copiar do seu dispositivo ou Ctrl/Cmd + C.';
        });
    }

    // Sem JavaScript, todo o conteúdo permanece visível.
    if (!reducedMotion.matches) root.classList.add('motion-ready');
    document.querySelectorAll('[data-stagger]').forEach(group => {
        [...group.children].forEach((item, index) => item.style.setProperty('--reveal-delay', `${Math.min(index * 70, 210)}ms`));
    });
    if ('IntersectionObserver' in window && !reducedMotion.matches) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('reveal-pending');
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });
        document.querySelectorAll('[data-reveal]').forEach(el => {
            if (el.getBoundingClientRect().top > window.innerHeight) {
                el.classList.add('reveal-pending');
                revealObserver.observe(el);
            }
        });
    }
    reducedMotion.addEventListener('change', (event) => {
        if (event.matches) {
            root.classList.remove('motion-ready');
            document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
        }
    });

    // Preserva o contador, caso a página inclua estatísticas.
    const counters = document.querySelectorAll('.stat__number');
    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        if (reducedMotion.matches) { el.textContent = target; return; }
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / 1400, 1);
            el.textContent = Math.floor((1 - (1 - progress) ** 2) * target);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        counters.forEach(el => counterObserver.observe(el));
    } else counters.forEach(el => el.textContent = el.getAttribute('data-count') || '0');
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const heroEl = document.querySelector('.hero');
    const svgDeco = document.getElementById('svgDeco');
    if (heroEl && svgDeco && !reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
        heroEl.addEventListener('mousemove', (event) => {
            const rect = heroEl.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 52;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 52;
            svgDeco.style.transform = `translate(${x}px, ${y}px)`;
        });
        heroEl.addEventListener('mouseleave', () => svgDeco.style.transform = 'translate(0, 0)');
    }
});
