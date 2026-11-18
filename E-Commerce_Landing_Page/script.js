// ===== script.js =====
(function() {
    // Helper: show feedback (alert)
    function showFeedback(msg) {
        alert(msg);
    }

    // ========================================
    // 1. NAVBAR LINKS (Headphones, Speakers, Accessories, Support)
    // ========================================
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Allow normal navigation to separate HTML files
            // The href already points to the correct .html file
            // We just add a small visual feedback before navigation
            const page = this.textContent.trim();
            console.log(`🔗 Navigating to: ${page}`);
        });
    });

    // ========================================
    // 2. LOGO click → go to home (index.html)
    // ========================================
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // ========================================
    // 3. NAVBAR ICONS: search, user, shopping bag
    // ========================================
    document.getElementById('searchIcon')?.addEventListener('click', () => {
        showFeedback('🔍 Search functionality (demo)');
    });

    document.getElementById('userIcon')?.addEventListener('click', () => {
        showFeedback('👤 User profile (demo)');
    });

    document.getElementById('cartIconNav')?.addEventListener('click', () => {
        const badge = document.getElementById('cartBadge');
        showFeedback(`🛒 Cart: ${badge ? badge.innerText : '0 items'} (total $647)`);
    });

    // ========================================
    // 4. HERO BUTTONS: Shop now & Explore (index.html only)
    // ========================================
    document.getElementById('shopNowBtn')?.addEventListener('click', () => {
        showFeedback('🎧 Start shopping! (demo)');
    });

    document.getElementById('exploreBtn')?.addEventListener('click', () => {
        showFeedback('🔍 Explore the latest headphones');
    });

    // ========================================
    // 5. "view all" & "more" blog buttons (index.html only)
    // ========================================
    document.getElementById('viewAllBtn')?.addEventListener('click', () => {
        showFeedback('📋 View all recommended headphones');
    });

    document.getElementById('moreBlogBtn')?.addEventListener('click', () => {
        showFeedback('📰 Load more blog posts');
    });

    // ========================================
    // 6. PRODUCT CARDS (click → add to cart demo)
    // ========================================
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            const name = this.dataset.name || this.querySelector('h4')?.innerText || 'product';
            showFeedback(`📦 ${name} – added to cart (demo)`);
        });
    });

    // ========================================
    // 7. CART PREVIEW (click on the whole cart bar)
    // ========================================
    const cartPreview = document.getElementById('cartPreview');
    if (cartPreview) {
        cartPreview.addEventListener('click', function(e) {
            // if user clicked on the bag icon inside, we handle it separately to avoid double alert
            if (e.target.closest('.fa-shopping-bag')) return;
            const badge = document.getElementById('cartBadge');
            showFeedback(`🛒 Cart preview: ${badge ? badge.innerText : '0 items'} (total $647)`);
        });

        // bag icon inside cart preview (separate trigger)
        const bagIcon = cartPreview.querySelector('.fa-shopping-bag');
        if (bagIcon) {
            bagIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                const badge = document.getElementById('cartBadge');
                showFeedback(`🛒 Cart: ${badge ? badge.innerText : '0 items'} (total $647)`);
            });
        }
    }

    // ========================================
    // 8. SUPPORT PAGE: buttons on support cards
    // ========================================
    document.querySelectorAll('.support-card .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const parent = this.closest('.support-card');
            const title = parent?.querySelector('h3')?.innerText || 'Support';
            showFeedback(`📞 ${title} – clicked (demo)`);
        });
    });

    // ========================================
    // 9. SUPPORT PAGE: Support card clicks (entire card)
    // ========================================
    document.querySelectorAll('.support-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3')?.innerText || 'Support';
            showFeedback(`📂 Opening: ${title} (demo)`);
        });
    });

    // ========================================
    // 10. ACTIVE NAVIGATION STATE
    // ========================================
    // Highlight the current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === 'index.html' && href === 'index.html') {
            // For home page, we don't add active class to keep it clean
            // But we can add it if needed
        }
    });

    // ========================================
    // 11. KEYBOARD SHORTCUT: ESC to close alerts (optional)
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Just a placeholder - alerts can't be closed via ESC
            console.log('ESC pressed');
        }
    });

    console.log('✅ beats multi-page site ready!');
    console.log(`📄 Current page: ${currentPage}`);
    console.log('🔗 All navigation links, icons, buttons, and images work!');
})();