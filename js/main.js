/** Shared navigation and progressive form enhancement. No build step required. */
(() => {
    'use strict';
    document.documentElement.classList.remove('no-js');

    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.mobile-menu');
    const desktop = window.matchMedia('(min-width: 1025px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const supportEmail = 'info@mattisfoundation.org';

    const updateNav = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    if (toggle && menu) {
        const background = document.querySelectorAll('main, footer, .nav-logo');
        const setMenu = (open, restoreFocus = false) => {
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            menu.classList.toggle('active', open);
            menu.inert = !open;
            background.forEach(element => { element.inert = open; });
            document.body.classList.toggle('menu-open', open);
            if (open) menu.querySelector('a')?.focus();
            else if (restoreFocus) toggle.focus();
        };
        toggle.addEventListener('click', () => setMenu(menu.inert));
        menu.addEventListener('click', event => {
            if (event.target.closest('a')) setMenu(false, true);
        });
        document.addEventListener('keydown', event => {
            if (menu.inert) return;
            if (event.key === 'Escape') setMenu(false, true);
            if (event.key === 'Tab') {
                const links = [...menu.querySelectorAll('a[href]')];
                const controls = [toggle, ...links];
                const index = controls.indexOf(document.activeElement);
                event.preventDefault();
                controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
            }
        });
        desktop.addEventListener('change', () => {
            if (desktop.matches) setMenu(false);
        });
    }

    // Native anchor navigation preserves the URL, browser history, and keyboard focus.
    // CSS supplies the fixed-header offset and respects reduced-motion preferences.

    document.querySelectorAll('.contact-form, #scholarshipForm').forEach(form => {
        const button = form.querySelector('[type="submit"]');
        const buttonLabel = button.innerHTML;
        const status = document.createElement('p');
        status.className = 'form-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        form.append(status);
        let submitting = false;

        form.addEventListener('input', event => {
            event.target.setCustomValidity?.('');
        });
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (submitting) return;
            for (const field of form.querySelectorAll('[required]')) {
                if (field.type !== 'checkbox' && !field.value.trim()) {
                    field.setCustomValidity('Please complete this field.');
                }
            }
            if (!form.reportValidity()) return;
            submitting = true;
            button.disabled = true;
            button.textContent = 'Sending...';
            form.setAttribute('aria-busy', 'true');
            status.className = 'form-status';
            status.textContent = '';
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 30000);
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' },
                    signal: controller.signal
                });
                if (!response.ok) throw new Error('Submission failed');
                if (form.id === 'scholarshipForm') {
                    form.hidden = true;
                    const success = document.getElementById('formSuccess');
                    success.classList.add('visible');
                    success.tabIndex = -1;
                    success.focus({ preventScroll: true });
                    success.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
                } else {
                    form.reset();
                    status.classList.add('form-status-success');
                    status.textContent = "Thank you for your message! We'll be in touch soon.";
                }
            } catch (error) {
                status.classList.add('form-status-error');
                status.textContent = error.name === 'AbortError'
                    ? 'We could not confirm receipt. Please contact us before submitting again: '
                    : 'Your submission could not be confirmed. Your entries are still here. Please try again or email ';
                const email = document.createElement('a');
                email.href = `mailto:${supportEmail}`;
                email.textContent = supportEmail;
                status.append(email);
            } finally {
                clearTimeout(timeout);
                submitting = false;
                button.disabled = false;
                button.innerHTML = buttonLabel;
                form.removeAttribute('aria-busy');
            }
        });
    });
})();
