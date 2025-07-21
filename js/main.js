// Main JavaScript - Optimized and deferred
(function() {
    'use strict';

    // Performance optimization: Cache DOM elements
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const body = document.body;
    
    // Enhanced error checking for missing elements
    if (!navbar) console.warn('Navbar element not found - some features may not work');
    if (!hamburger) console.warn('Hamburger element not found - mobile menu may not work');
    if (!mobileNav) console.warn('Mobile nav element not found - mobile menu may not work');
    
    // Check for modern browser features
    if (!('IntersectionObserver' in window)) {
        console.log('Intersection Observer not supported, using fallback');
        // Fallback for older browsers
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.removeAttribute('loading');
            img.style.opacity = '0';
            img.onload = function() {
                this.style.transition = 'opacity 0.3s';
                this.style.opacity = '1';
            };
        });
    }
    
    // Throttle function for performance
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Navbar scroll effect - throttled for performance
    const handleScroll = throttle(function() {
        if (navbar && window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else if (navbar) {
            navbar.classList.remove('scrolled');
        }
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile Navigation Toggle
    function toggleMobileNav() {
        if (!hamburger || !mobileNav) return;
        
        const isActive = hamburger.classList.contains('active');
        
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (!isActive) {
            body.style.overflow = 'hidden';
            mobileNav.setAttribute('aria-hidden', 'false');
            hamburger.setAttribute('aria-expanded', 'true');
        } else {
            body.style.overflow = '';
            mobileNav.setAttribute('aria-hidden', 'true');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }
    
    hamburger?.addEventListener('click', toggleMobileNav);

    // Close mobile nav when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (!hamburger || !mobileNav) return;
            
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            body.style.overflow = '';
            mobileNav.setAttribute('aria-hidden', 'true');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close mobile nav when clicking the overlay background
    mobileNav?.addEventListener('click', function(e) {
        if (e.target === mobileNav && hamburger) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            body.style.overflow = '';
            mobileNav.setAttribute('aria-hidden', 'true');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Close mobile nav on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active') && hamburger) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            body.style.overflow = '';
            mobileNav.setAttribute('aria-hidden', 'true');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Smooth scrolling for navigation links - optimized
    function smoothScroll(target, duration = 800) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - 80; // Account for fixed navbar
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t + b;
            t--;
            return -c/2 * (t*(t-2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Enhanced smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target && target !== '#') {
                smoothScroll(target);
            }
        });
    });

    // Optimized form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('.submit-btn');
            if (!submitBtn) return;
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Create mailto link with form data
            const subject = encodeURIComponent('Contact Form Submission from ' + name);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            const mailtoLink = `mailto:amm@mattisfoundation.org?subject=${subject}&body=${body}`;
            
            // Open mail client
            window.location.href = mailtoLink;
            
            // Reset form and show confirmation
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                this.reset();
                showNotification('Your email client should open now. If not, please email us directly at amm@mattisfoundation.org');
            }, 1000);
        });
    }

    // Notification system
    function showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        
        if (type === 'error') notification.style.background = '#e74c3c';
        if (type === 'success') notification.style.background = '#27ae60';
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        });
        
        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Optimized statistics animation with Intersection Observer
    let statsAnimated = false;
    
    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;
        
        const stats = document.querySelectorAll('.stat-number');
        
        stats.forEach(stat => {
            const targetText = stat.textContent;
            const target = parseInt(targetText.replace(/[^\d]/g, ''));
            const isK = targetText.includes('K');
            const isDollar = targetText.includes('$');
            const hasPlus = targetText.includes('+');
            
            let current = 0;
            const increment = target / 60; // 60 frames for ~1 second animation
            const duration = 16; // ~60fps
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                let displayValue = Math.floor(current);
                let displayText = '';
                
                if (isDollar) displayText += '$';
                displayText += displayValue;
                if (isK) displayText += 'K';
                if (hasPlus) displayText += '+';
                
                stat.textContent = displayText;
            }, duration);
        });
    }

    // Improved Intersection Observer for animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '20px',
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('impact')) {
                        animateStats();
                    }
                    
                    // Add fade-in animation to other elements
                    if (!entry.target.classList.contains('animated')) {
                        entry.target.classList.add('fade-in', 'animated');
                    }
                    
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const elementsToObserve = document.querySelectorAll('.impact, .section');
        elementsToObserve.forEach(el => observer.observe(el));

        // Lazy loading images with Intersection Observer
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('fade-in');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe lazy images
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                try {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
                    }
                    
                    // Web Vitals monitoring (simplified)
                    if ('PerformanceObserver' in window) {
                        try {
                            const observer = new PerformanceObserver((entryList) => {
                                for (const entry of entryList.getEntries()) {
                                    if (entry.entryType === 'largest-contentful-paint') {
                                        console.log('LCP:', entry.startTime, 'ms');
                                    }
                                    if (entry.entryType === 'first-input') {
                                        console.log('FID:', entry.processingStart - entry.startTime, 'ms');
                                    }
                                }
                            });
                            
                            observer.observe({type: 'largest-contentful-paint', buffered: true});
                            observer.observe({type: 'first-input', buffered: true});
                        } catch (e) {
                            console.log('Performance Observer not fully supported');
                        }
                    }
                } catch (e) {
                    console.log('Performance monitoring error:', e);
                }
            }, 0);
        });
    }

    // Preload critical resources when hovering over navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const target = this.getAttribute('href');
            const section = document.querySelector(target);
            if (section) {
                // Preload images in the section
                const images = section.querySelectorAll('img[loading="lazy"]');
                images.forEach(img => {
                    if (!img.complete && img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                });
            }
        }, { once: true });
    });

    // Initialize accessibility improvements
    function initAccessibility() {
        // Set proper ARIA attributes
        if (mobileNav) mobileNav.setAttribute('aria-hidden', 'true');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        
        // Add skip link for keyboard navigation
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #3498db;
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 10001;
            border-radius: 4px;
        `;
        
        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main landmark if not present
        const hero = document.querySelector('.hero');
        if (hero && !document.getElementById('main')) {
            hero.id = 'main';
        }
    }

    // Initialize everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessibility);
    } else {
        initAccessibility();
    }

    // Enhanced error handling for development
    window.addEventListener('error', function(e) {
        console.error('JavaScript Error:', e.error);
    });

    // Unhandled promise rejection handling
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled Promise Rejection:', e.reason);
    });

})();