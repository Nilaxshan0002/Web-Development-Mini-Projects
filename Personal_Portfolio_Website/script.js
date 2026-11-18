// =====================================================
// 1. DARK / LIGHT MODE TOGGLE with LocalStorage
// =====================================================

const toggleBtn = document.getElementById('theme-toggle');

// Check saved preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    toggleBtn.textContent = '☀️';
} else {
    toggleBtn.textContent = '🌙';
}

toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
    
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// =====================================================
// 2. ACTIVE NAV LINK HIGHLIGHTING
// =====================================================

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
        link.classList.add('active');
    }
});

// =====================================================
// 3. CONTACT FORM with Validation & Animation
// =====================================================

const form = document.getElementById('contact-form');
const formMsg = document.getElementById('form-message');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form fields
        const name = form.querySelector('input[type="text"]');
        const email = form.querySelector('input[type="email"]');
        const message = form.querySelector('textarea');

        // Validate fields
        let isValid = true;
        let errorMsg = '';

        if (name.value.trim() === '') {
            isValid = false;
            errorMsg = '❌ Please enter your name.';
            name.style.borderColor = '#ff4444';
            setTimeout(() => name.style.borderColor = '#ddd', 2000);
        } else if (email.value.trim() === '') {
            isValid = false;
            errorMsg = '❌ Please enter your email.';
            email.style.borderColor = '#ff4444';
            setTimeout(() => email.style.borderColor = '#ddd', 2000);
        } else if (!isValidEmail(email.value.trim())) {
            isValid = false;
            errorMsg = '❌ Please enter a valid email address.';
            email.style.borderColor = '#ff4444';
            setTimeout(() => email.style.borderColor = '#ddd', 2000);
        } else if (message.value.trim() === '') {
            isValid = false;
            errorMsg = '❌ Please enter your message.';
            message.style.borderColor = '#ff4444';
            setTimeout(() => message.style.borderColor = '#ddd', 2000);
        }

        if (!isValid) {
            formMsg.textContent = errorMsg;
            formMsg.style.color = '#ff4444';
            return;
        }

        // Success message with animation
        formMsg.textContent = '✅ Thank you! Your message has been sent successfully! 🎉';
        formMsg.style.color = '#6c63ff';
        formMsg.style.fontWeight = '600';
        formMsg.style.fontSize = '18px';
        
        // Reset form
        form.reset();

        // Clear message after 5 seconds
        setTimeout(() => {
            formMsg.textContent = '';
            formMsg.style.fontWeight = '500';
            formMsg.style.fontSize = '16px';
        }, 5000);
    });
}

// Email validation helper function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// =====================================================
// 4. MOBILE MENU TOGGLE (Hamburger Menu)
// =====================================================

// Add hamburger button to nav (if not exists)
const nav = document.querySelector('nav');
const navLinksContainer = document.querySelector('.nav-links');

// Only add if not already added
if (!document.querySelector('.hamburger')) {
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '☰';
    hamburger.style.cssText = `
        display: none;
        font-size: 30px;
        cursor: pointer;
        color: #6c63ff;
        background: none;
        border: none;
        padding: 5px 10px;
    `;

    // Insert hamburger before nav-links
    const themeToggle = document.getElementById('theme-toggle');
    nav.insertBefore(hamburger, navLinksContainer);

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', () => {
        navLinksContainer.classList.toggle('show');
        hamburger.textContent = navLinksContainer.classList.contains('show') ? '✕' : '☰';
    });

    // Close menu when clicking a link (for better UX)
    navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('show');
            hamburger.textContent = '☰';
        });
    });

    // Add responsive styles for hamburger
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .hamburger {
                display: block !important;
                order: 2;
            }
            nav {
                flex-wrap: wrap;
                justify-content: space-between;
            }
            .nav-links {
                display: none !important;
                width: 100%;
                flex-direction: column;
                align-items: center;
                padding: 20px 0;
                gap: 15px;
                order: 3;
            }
            .nav-links.show {
                display: flex !important;
            }
            #theme-toggle {
                order: 1;
            }
            .logo {
                order: 0;
            }
        }
        @media (min-width: 769px) {
            .hamburger {
                display: none !important;
            }
            .nav-links {
                display: flex !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// =====================================================
// 5. BLOG FILTERS FUNCTIONALITY
// =====================================================

const filterBtns = document.querySelectorAll('.filter-btn');
const blogCards = document.querySelectorAll('.blog-card');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            blogCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// =====================================================
// 6. BLOG LIKE BUTTON FUNCTIONALITY
// =====================================================

const likeBtns = document.querySelectorAll('.blog-likes');

likeBtns.forEach(like => {
    // Check if already liked (localStorage)
    const postId = like.closest('.blog-card')?.querySelector('h3')?.textContent || '';
    const likedKey = `liked_${postId.replace(/\s/g, '_')}`;
    
    if (localStorage.getItem(likedKey) === 'true') {
        like.style.color = '#ff4444';
        let count = parseInt(like.textContent.match(/\d+/)?.[0] || 0);
        like.textContent = `❤️ ${count}`;
    }

    like.addEventListener('click', () => {
        let count = parseInt(like.textContent.match(/\d+/)?.[0] || 0);
        
        if (like.style.color === 'rgb(255, 68, 68)' || like.style.color === '#ff4444') {
            count--;
            like.style.color = '#888';
            localStorage.setItem(likedKey, 'false');
        } else {
            count++;
            like.style.color = '#ff4444';
            localStorage.setItem(likedKey, 'true');
        }
        like.textContent = `❤️ ${count}`;
    });
});

// =====================================================
// 7. SCROLL TO TOP BUTTON
// =====================================================

const scrollTopBtn = document.getElementById('scroll-top');

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =====================================================
// 8. NEWSLETTER FORM SUBSCRIPTION
// =====================================================

const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        const email = input.value.trim();
        
        if (email === '') {
            alert('❌ Please enter your email address.');
            input.style.borderColor = '#ff4444';
            setTimeout(() => input.style.borderColor = '#ddd', 2000);
        } else if (!isValidEmail(email)) {
            alert('❌ Please enter a valid email address.');
            input.style.borderColor = '#ff4444';
            setTimeout(() => input.style.borderColor = '#ddd', 2000);
        } else {
            alert('✅ Thank you for subscribing to my newsletter! 🎉');
            input.value = '';
            input.style.borderColor = '#6c63ff';
            setTimeout(() => input.style.borderColor = '#ddd', 2000);
            
            // Save to localStorage
            localStorage.setItem('newsletter_email', email);
        }
    });
}

// =====================================================
// 9. SMOOTH SCROLL FOR ANCHOR LINKS (if any)
// =====================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// =====================================================
// 10. PAGE LOAD ANIMATION (Fade In)
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// =====================================================
// 11. BLOG READ TIME COUNTER (Optional)
// =====================================================

const blogContent = document.querySelector('.blog-post-body');
if (blogContent) {
    const text = blogContent.textContent;
    const words = text.trim().split(/\s+/).length;
    const readTime = Math.ceil(words / 200);
    
    const metaElement = document.querySelector('.blog-post-meta');
    if (metaElement) {
        metaElement.textContent += ` • ⏱️ ${readTime} min read`;
    }
}

// =====================================================
// 12. CONSOLE WELCOME MESSAGE (Fun!)
// =====================================================

console.log('%c👋 Welcome to Joe Greyson\'s Portfolio!', 'font-size: 24px; color: #6c63ff; font-weight: bold;');
console.log('%c💻 Built with HTML, CSS & JavaScript', 'font-size: 16px; color: #333;');
console.log('%c⭐ Don\'t forget to toggle Dark/Light mode!', 'font-size: 14px; color: #666;');
console.log('%c📝 Check out my blog for web development tutorials!', 'font-size: 14px; color: #6c63ff;');

// =====================================================
// 13. KEYBOARD SHORTCUTS (Accessibility)
// =====================================================

document.addEventListener('keydown', (e) => {
    // Press 'D' to toggle dark mode
    if (e.key === 'd' || e.key === 'D') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            toggleBtn.click();
        }
    }
    
    // Press 'H' to go home
    if (e.key === 'h' || e.key === 'H') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            window.location.href = 'index.html';
        }
    }
    
    // Press 'B' to go to blog
    if (e.key === 'b' || e.key === 'B') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            window.location.href = 'blog.html';
        }
    }
});

// =====================================================
// 14. VISITOR COUNTER (LocalStorage)
// =====================================================

let visitorCount = localStorage.getItem('visitorCount') || 0;
visitorCount = parseInt(visitorCount) + 1;
localStorage.setItem('visitorCount', visitorCount);

// Only show on first visit
if (visitorCount === 1) {
    console.log('%c🌟 Welcome! This is your first visit to this site.', 'font-size: 14px; color: #6c63ff;');
} else {
    console.log(`%c👋 Welcome back! You've visited ${visitorCount} times.`, 'font-size: 14px; color: #6c63ff;');
}

// =====================================================
// 15. LAZY LOADING FOR IMAGES (Performance)
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    if ('loading' in HTMLImageElement.prototype) {
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
});