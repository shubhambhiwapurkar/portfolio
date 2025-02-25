/*
 * Portfolio Website JavaScript
 * Author: Shubham Bhiwapurkar
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Mobile navigation toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const hamburger = document.querySelector('.hamburger');
    const primaryNav = document.getElementById('primary-navigation');
    
    mobileNavToggle.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        primaryNav.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    });
    
    // Close mobile nav when clicking on a link
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            primaryNav.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });
    
    // Active section tracking with Intersection Observer
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Update desktop nav
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
                
                // Update bottom nav
                bottomNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Back to top button
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Sticky navigation on scroll
    const nav = document.querySelector('nav');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const currentScrollTop = window.scrollY;
        
        if (currentScrollTop > 100) {
            nav.style.height = '70px';
            nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.height = '80px';
            nav.style.boxShadow = 'none';
        }
        
        // Hide nav when scrolling down on mobile
        if (window.innerWidth <= 768) {
            if (currentScrollTop > lastScrollTop) {
                // Scrolling down
                nav.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                nav.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = currentScrollTop;
    });
    
    // Form submission (using formspree.io)
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData);
            
            // You can replace this URL with your own formspree.io form URL
            // Or set up your own serverless function to handle form submissions
            try {
                const response = await fetch('https://formspree.io/f/your-form-id', {
                    method: 'POST',
                    body: JSON.stringify(formObject),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    alert('Thank you for your message! I will get back to you soon.');
                    contactForm.reset();
                } else {
                    throw new Error('Something went wrong');
                }
            } catch (error) {
                alert('There was a problem sending your message. Please try again later.');
                console.error('Form submission error:', error);
            }
        });
    }
    
    // Animate items when they come into view
    const animateOnScroll = () => {
        const elementsToAnimate = document.querySelectorAll('.glass-card, .section-header, .timeline-item');
        
        const animateObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    animateObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        elementsToAnimate.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            animateObserver.observe(element);
        });
    };
    
    // Run animation on page load
    animateOnScroll();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Type writer effect for job title
    const jobTitle = document.querySelector('.job-title');
    if (jobTitle) {
        const text = jobTitle.textContent;
        jobTitle.textContent = '';
        
        const typeWriter = (text, i = 0) => {
            if (i < text.length) {
                jobTitle.textContent += text.charAt(i);
                i++;
                setTimeout(() => typeWriter(text, i), 100);
            }
        };
        
        // Start after a brief delay
        setTimeout(() => {
            typeWriter(text);
        }, 1000);
    }
});