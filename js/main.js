/**
 * MATTIS FOUNDATION - Main JavaScript
 * Shared behavior: nav, smooth scroll, contact form, stats counter,
 * university autocomplete. Loaded on all pages.
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    var nav = document.querySelector('.nav');
    var navToggle = document.querySelector('.nav-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');
    var mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

    // Shared support email (keep in one place so error copy stays in sync)
    var SUPPORT_EMAIL = 'info@mattisfoundation.org';

    // ============================================
    // Notification System (toast)
    // ============================================
    function showNotification(message, type) {
        type = type || 'info';

        // Remove any existing notifications
        var existing = document.querySelectorAll('.notification');
        existing.forEach(function(n) { n.remove(); });

        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
        notification.textContent = message;

        var bgColor = '#152238';
        if (type === 'error') bgColor = '#c1292e';
        if (type === 'success') bgColor = '#2d6a4f';

        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '1rem 1.5rem';
        notification.style.background = bgColor;
        notification.style.color = 'white';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
        notification.style.zIndex = '10000';
        notification.style.maxWidth = '400px';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.fontSize = '0.95rem';

        document.body.appendChild(notification);

        setTimeout(function() {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(function() {
                if (notification.parentNode) notification.remove();
            }, 300);
        }, 5000);
    }

    // Exposed for per-page scripts (e.g. scholarship form)
    window.showNotification = showNotification;

    // ============================================
    // Navigation Scroll Effect
    // ============================================
    function handleNavScroll() {
        if (!nav) return;
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function() {
            var willOpen = !mobileMenu.classList.contains('active');
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            document.body.style.overflow = willOpen ? 'hidden' : '';
        });

        mobileMenuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#main') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var navHeight = nav ? nav.offsetHeight : 80;
                var targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // Form validation helpers
    // ============================================
    // Clears the red invalid-border once a user starts fixing a field.
    function wireLiveClearOnInput(form) {
        form.querySelectorAll('[required]').forEach(function(field) {
            field.addEventListener('input', function() {
                if (field.value.trim()) field.style.borderColor = '';
            });
            field.addEventListener('change', function() {
                if (field.value.trim()) field.style.borderColor = '';
            });
        });
    }
    window.wireLiveClearOnInput = wireLiveClearOnInput;

    // ============================================
    // Contact Form Handling
    // ============================================
    var contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        wireLiveClearOnInput(contactForm);

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var form = this;
            var submitBtn = form.querySelector('button[type="submit"], .btn-submit');
            var originalText = submitBtn ? submitBtn.textContent : 'Send Message';

            var isValid = true;
            form.querySelectorAll('[required]').forEach(function(field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#c1292e';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }

            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }

            var formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(function(response) {
                if (response.ok) {
                    showNotification('Thank you for your message! We\'ll be in touch soon.', 'success');
                    form.reset();
                } else {
                    return response.json().then(function(data) {
                        throw new Error(data.error || 'Form submission failed');
                    });
                }
            })
            .catch(function(error) {
                console.error('Form error:', error);
                showNotification('Sorry, there was a problem. Please email us directly at ' + SUPPORT_EMAIL, 'error');
            })
            .finally(function() {
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        });
    }

    // ============================================
    // Stats Counter Animation
    // ============================================
    var statNumbers = document.querySelectorAll('.impact-stat-number');

    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        var statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function(stat) {
            statsObserver.observe(stat);
        });
    }

    function animateCounter(element) {
        var text = element.textContent;
        var hasPlus = text.indexOf('+') > -1;
        var hasDollar = text.indexOf('$') > -1;
        var hasK = text.indexOf('K') > -1;
        var number = parseInt(text.replace(/[^0-9]/g, ''), 10);

        if (isNaN(number)) return;

        var duration = 2000;
        var startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);

            // Ease out cubic for smooth deceleration
            var easeProgress = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(easeProgress * number);

            var display = String(current);
            if (hasDollar) display = '$' + display;
            if (hasK) display += 'K';
            if (hasPlus) display += '+';

            element.textContent = display;

            if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    // ============================================
    // University Autocomplete (Scholarship Page)
    // ============================================
    var universityInput = document.getElementById('university');
    var universitySuggestions = document.getElementById('universitySuggestions');

    if (universityInput && universitySuggestions) {
        var universities = [
            "Harvard University", "Stanford University", "MIT", "Yale University", "Princeton University",
            "Columbia University", "University of Pennsylvania", "Duke University", "Northwestern University",
            "Johns Hopkins University", "Cornell University", "Brown University", "Vanderbilt University",
            "Rice University", "University of Notre Dame", "Georgetown University", "Emory University",
            "Carnegie Mellon University", "University of Virginia", "University of Michigan",
            "University of North Carolina at Chapel Hill", "Wake Forest University", "Tufts University",
            "Boston College", "New York University", "University of Rochester", "Georgia Tech",
            "University of California, Berkeley", "UCLA", "USC", "University of Florida",
            "University of Texas at Austin", "Texas A&M University", "Penn State", "Ohio State University",
            "University of Wisconsin-Madison", "University of Illinois", "Purdue University",
            "North Carolina State University", "Clemson University", "Virginia Tech", "Auburn University",
            "University of Georgia", "University of Alabama", "University of Tennessee",
            "Appalachian State University", "East Carolina University", "UNC Charlotte", "UNC Greensboro",
            "Davidson College", "Elon University", "High Point University", "Campbell University",
            "United States Military Academy", "United States Naval Academy", "United States Air Force Academy"
        ];

        universityInput.addEventListener('input', function() {
            var query = this.value.toLowerCase();

            if (query.length < 2) {
                universitySuggestions.style.display = 'none';
                return;
            }

            var matches = universities.filter(function(uni) {
                return uni.toLowerCase().indexOf(query) > -1;
            }).slice(0, 8);

            if (matches.length > 0) {
                universitySuggestions.innerHTML = matches.map(function(uni) {
                    return '<div class="university-suggestion" role="option">' + uni + '</div>';
                }).join('');
                universitySuggestions.style.display = 'block';
            } else {
                universitySuggestions.style.display = 'none';
            }
        });

        universitySuggestions.addEventListener('click', function(e) {
            if (e.target.classList.contains('university-suggestion')) {
                universityInput.value = e.target.textContent;
                universitySuggestions.style.display = 'none';
            }
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.university-input-wrapper')) {
                universitySuggestions.style.display = 'none';
            }
        });
    }

})();
