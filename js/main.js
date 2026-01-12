/**
 * MATTIS FOUNDATION - Main JavaScript
 * Navigation, Animations, and Interactivity
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

    // ============================================
    // Navigation Scroll Effect
    // ============================================
    function handleNavScroll() {
        if (window.scrollY > 100) {
            nav?.classList.add('scrolled');
        } else {
            nav?.classList.remove('scrolled');
        }
    }

    // Throttle scroll events for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(handleNavScroll);
    }, { passive: true });

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    function toggleMobileMenu() {
        navToggle?.classList.toggle('active');
        mobileMenu?.classList.toggle('active');
        document.body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        navToggle?.classList.remove('active');
        mobileMenu?.classList.remove('active');
        document.body.style.overflow = '';
    }

    navToggle?.addEventListener('click', toggleMobileMenu);

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ============================================
    // Smooth Scrolling
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // Intersection Observer for Animations
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                
                // Animate stat numbers
                if (entry.target.classList.contains('impact-stat')) {
                    animateNumber(entry.target.querySelector('.impact-stat-number'));
                }
                
                animateOnScroll.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.card, .impact-stat, .section-header, .story-content, .story-image-wrapper').forEach(el => {
        animateOnScroll.observe(el);
    });

    // ============================================
    // Number Animation
    // ============================================
    function animateNumber(element) {
        if (!element) return;
        
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasDollar = text.includes('$');
        const hasK = text.includes('K');
        const number = parseInt(text.replace(/[^0-9]/g, ''));
        
        if (isNaN(number)) return;
        
        let current = 0;
        const increment = number / 60;
        const duration = 16;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            
            let display = Math.floor(current).toLocaleString();
            if (hasDollar) display = '$' + display;
            if (hasK) display += 'K';
            if (hasPlus) display += '+';
            
            element.textContent = display;
        }, duration);
    }

    // ============================================
    // Form Handling
    // ============================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn?.textContent;
            
            // Basic validation
            let isValid = true;
            this.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'var(--color-error)';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Show loading state
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }
            
            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                showNotification('Thank you for your message! We\'ll be in touch soon.', 'success');
                this.reset();
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }, 1500);
        });
    }

    // ============================================
    // Notification System
    // ============================================
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? 'var(--color-error)' : type === 'success' ? 'var(--color-success)' : 'var(--color-navy-700)'};
            color: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 400px;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            font-size: 0.95rem;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        });
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ============================================
    // File Upload Handling (for scholarship page)
    // ============================================
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = document.querySelector('.file-upload input[type="file"]');
    const fileName = document.querySelector('.file-upload-name');

    if (fileUpload && fileInput) {
        fileUpload.addEventListener('click', () => fileInput.click());
        
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });
        
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect();
            }
        });
        
        fileInput.addEventListener('change', handleFileSelect);
    }

    function handleFileSelect() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // Validate file type
            if (file.type !== 'application/pdf') {
                showNotification('Please upload a PDF file only.', 'error');
                fileInput.value = '';
                return;
            }
            
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('File size must be less than 10MB.', 'error');
                fileInput.value = '';
                return;
            }
            
            if (fileName) {
                fileName.textContent = '✓ ' + file.name;
                fileName.classList.add('visible');
            }
        }
    }

    // ============================================
    // University Autocomplete (for scholarship page)
    // ============================================
    const universityInput = document.getElementById('university');
    const universitySuggestions = document.getElementById('universitySuggestions');
    
    if (universityInput && universitySuggestions) {
        const universities = [
            "Harvard University", "Stanford University", "MIT", "Yale University",
            "Princeton University", "Columbia University", "University of Pennsylvania",
            "Duke University", "Northwestern University", "Johns Hopkins University",
            "University of North Carolina at Chapel Hill", "NC State University",
            "Wake Forest University", "Davidson College", "Elon University",
            "Appalachian State University", "East Carolina University", "UNC Charlotte",
            "Campbell University", "High Point University", "Meredith College",
            "United States Military Academy", "United States Naval Academy",
            "United States Air Force Academy", "Virginia Tech", "University of Virginia",
            "Clemson University", "University of South Carolina", "Georgia Tech"
            // Add more as needed
        ];
        
        universityInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            
            if (query.length < 2) {
                universitySuggestions.style.display = 'none';
                return;
            }
            
            const matches = universities.filter(uni => 
                uni.toLowerCase().includes(query)
            ).slice(0, 8);
            
            if (matches.length > 0) {
                universitySuggestions.innerHTML = matches.map(uni => 
                    `<div class="university-suggestion">${uni}</div>`
                ).join('');
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

    // ============================================
    // Initialize on Load
    // ============================================
    handleNavScroll();

    // Add CSS custom property for animation visibility
    const style = document.createElement('style');
    style.textContent = `
        .card, .impact-stat, .section-header, .story-content, .story-image-wrapper {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        .notification {
            font-family: var(--font-body);
        }
    `;
    document.head.appendChild(style);

})();
