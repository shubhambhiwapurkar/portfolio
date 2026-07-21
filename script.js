/*
 * Portfolio — interaction layer
 * Author: Shubham Bhiwapurkar
 */

(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Footer year ---------- */
    const yearEl = $('#currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Mobile nav ---------- */
    const navToggle = $('#navToggle');
    const navLinks = $('#navLinks');

    if (navToggle && navLinks) {
        const setNav = (open) => {
            navLinks.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', String(open));
        };

        navToggle.addEventListener('click', () => {
            setNav(navToggle.getAttribute('aria-expanded') !== 'true');
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) setNav(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setNav(false);
        });
    }

    /* ---------- Header: hide on scroll down, scroll progress ---------- */
    const header = $('#siteHeader');
    const progress = $('#scrollProgress');
    const backToTop = $('#backToTop');
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        if (progress) {
            progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';
        }

        if (header) {
            header.classList.toggle('scrolled', y > 20);
            // Only auto-hide once past the hero, and never while the mobile menu is open.
            const menuOpen = navLinks && navLinks.classList.contains('open');
            header.classList.toggle('hidden', y > 400 && y > lastY && !menuOpen);
        }

        // Back to top
        if (backToTop) backToTop.classList.toggle('visible', y > 500);

        lastY = y;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });

    /* ---------- Back to top ---------- */
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Active section highlighting ---------- */
    const sections = $$('main section[id]');
    const navAnchors = $$('#navLinks a');

    if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
        const setActive = (id) => {
            navAnchors.forEach((a) => {
                a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
        };

        const spy = new IntersectionObserver((entries) => {
            // Pick the visible section closest to the top of the viewport.
            const visible = entries
                .filter((e) => e.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
            if (visible) setActive(visible.target.id);
        }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

        sections.forEach((s) => spy.observe(s));
    }

    /* ---------- Reveal on scroll ---------- */
    const revealTargets = $$('.panel, .section-head, .stats, .tl-item');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach((el) => el.classList.add('reveal', 'shown'));
    } else {
        revealTargets.forEach((el) => el.classList.add('reveal'));

        const revealer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('shown');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach((el) => revealer.observe(el));
    }

    /* ---------- Typed hero command ---------- */
    const typed = $('#typedCmd');
    if (typed) {
        const text = typed.dataset.text || '';
        if (reduceMotion) {
            typed.textContent = text;
        } else {
            let i = 0;
            const tick = () => {
                if (i > text.length) return;
                typed.textContent = text.slice(0, i);
                i += 1;
                setTimeout(tick, 55);
            };
            setTimeout(tick, 400);
        }
    }

    /* ---------- Animated stat counters ---------- */
    const nums = $$('.num');
    if (nums.length) {
        const runCount = (el) => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';

            if (reduceMotion) {
                el.textContent = `${target}${suffix}`;
                return;
            }

            const duration = 1100;
            const start = performance.now();

            const step = (now) => {
                const p = Math.min((now - start) / duration, 1);
                // easeOutCubic
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = `${Math.round(target * eased)}${suffix}`;
                if (p < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        };

        if ('IntersectionObserver' in window) {
            const counter = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    runCount(entry.target);
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.5 });

            nums.forEach((n) => counter.observe(n));
        } else {
            nums.forEach(runCount);
        }
    }

    /* ---------- Contact form ----------
     * Default: opens the visitor's mail client with the message pre-filled.
     * This works on a static host with no backend.
     *
     * To collect submissions server-side instead, create a form at formspree.io
     * and add the endpoint to the markup:
     *   <form id="contactForm" data-endpoint="https://formspree.io/f/xxxxxxxx">
     */
    const form = $('#contactForm');
    const status = $('#formStatus');
    const RECIPIENT = 'shubhambhiwapurkar@gmail.com';

    if (form) {
        const say = (msg, kind = '') => {
            if (!status) return;
            status.textContent = msg;
            status.className = `form-status ${kind}`.trim();
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Use form.elements: `form.name` resolves to the form's own name
            // attribute, not the field named "name".
            const nameField = form.elements.namedItem('name');
            const emailField = form.elements.namedItem('email');
            const messageField = form.elements.namedItem('message');

            const name = nameField.value.trim();
            const email = emailField.value.trim();
            const message = messageField.value.trim();

            // Validate
            let firstInvalid = null;
            [nameField, emailField, messageField].forEach((f) => {
                const bad = !f.value.trim() || (f.type === 'email' && !f.checkValidity());
                f.setAttribute('aria-invalid', String(bad));
                if (bad && !firstInvalid) firstInvalid = f;
            });

            if (firstInvalid) {
                say('Please fill in every field with a valid email.', 'err');
                firstInvalid.focus();
                return;
            }

            const endpoint = form.dataset.endpoint;

            if (endpoint) {
                say('Sending…');
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                        body: JSON.stringify({ name, email, message })
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    form.reset();
                    say('Message sent — thanks, I\'ll be in touch.', 'ok');
                } catch (err) {
                    console.error('Form submission failed:', err);
                    say(`Couldn't send. Email me directly at ${RECIPIENT}.`, 'err');
                }
                return;
            }

            // No endpoint configured → hand off to the visitor's mail client.
            const subject = `Portfolio enquiry from ${name}`;
            const body = `${message}\n\n—\n${name}\n${email}`;
            window.location.href =
                `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            say('Opening your email app…', 'ok');
        });
    }
})();
