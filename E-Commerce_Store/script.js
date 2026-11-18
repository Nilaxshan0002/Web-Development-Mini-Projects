/**
 * script.js — E-Store Premium Shop
 * Complete shopping cart, wishlist, search, filtering, sorting & authentication
 */
(function () {
    "use strict";

    // ---------- product data ----------
    const products = [
        { id: 1, name: "Classic Oxford Shirt", category: "men", price: 79.00, oldPrice: null, badge: null,
            icon: "fa-vest" },
        { id: 2, name: "Slim Fit Chino Trousers", category: "men", price: 89.00, oldPrice: null, badge: "new",
            icon: "fa-person" },
        { id: 3, name: "Wool Blend Overcoat", category: "men", price: 239.00, oldPrice: 289.00, badge: "sale",
            icon: "fa-coat" },
        { id: 4, name: "Silk Blouse", category: "women", price: 99.00, oldPrice: null, badge: null,
            icon: "fa-vest" },
        { id: 5, name: "High-Waist Trousers", category: "women", price: 84.00, oldPrice: null, badge: "new",
            icon: "fa-person" },
        { id: 6, name: "Leather Crossbody Bag", category: "accessories", price: 149.00, oldPrice: 189.00,
            badge: "sale", icon: "fa-bag-shopping" },
        { id: 7, name: "Minimalist Watch", category: "accessories", price: 199.00, oldPrice: null, badge: null,
            icon: "fa-clock" },
        { id: 8, name: "Cashmere Scarf", category: "accessories", price: 59.00, oldPrice: null, badge: null,
            icon: "fa-scroll" },
        { id: 9, name: "Tailored Blazer", category: "women", price: 179.00, oldPrice: 210.00, badge: "sale",
            icon: "fa-coat" },
        { id: 10, name: "Leather Sneakers", category: "men", price: 124.00, oldPrice: null, badge: "new",
            icon: "fa-shoe-prints" },
        { id: 11, name: "Aviator Sunglasses", category: "accessories", price: 89.00, oldPrice: null, badge: null,
            icon: "fa-glasses" },
        { id: 12, name: "Silk Scarf", category: "women", price: 45.00, oldPrice: null, badge: null,
            icon: "fa-scroll" }
    ];

    // ---------- state ----------
    let cart = [];
    let wishlist = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let isSignedIn = false;
    let signedInEmail = '';

    // ---------- DOM refs ----------
    const grid = document.getElementById('productGrid');
    const cartIcon = document.getElementById('cartIcon');
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotalPrice');
    const cartBadge = document.getElementById('cartBadge');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sortSelect');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    let toastTimer = null;

    // Nav links
    const navLinks = document.querySelectorAll('.nav-links a');

    // Search
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchIcon = document.getElementById('searchIcon');
    const searchHint = document.getElementById('searchHint');
    const searchCount = document.getElementById('searchCount');

    // Profile
    const profileIcon = document.getElementById('profileIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownAccount = document.getElementById('dropdownAccount');
    const dropdownOrders = document.getElementById('dropdownOrders');
    const dropdownWishlist = document.getElementById('dropdownWishlist');
    const dropdownSignOut = document.getElementById('dropdownSignOut');

    // Auth
    const authOverlay = document.getElementById('authOverlay');
    const authClose = document.getElementById('authClose');
    const signInBtn = document.getElementById('signInBtn');
    const signInForm = document.getElementById('signInForm');
    const authSignupLink = document.getElementById('authSignupLink');

    // Logo
    const logoHome = document.getElementById('logoHome');

    // ---------- helpers ----------
    function formatPrice(amount) {
        return '$' + amount.toFixed(2);
    }

    function showToast(msg, icon = 'fa-check-circle') {
        toastMsg.textContent = msg;
        toast.querySelector('i').className = 'fas ' + icon;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    // ---------- cart ----------
    function updateCartUI() {
        const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);
        cartBadge.textContent = totalItems;
        const totalPrice = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
        cartTotalSpan.textContent = formatPrice(totalPrice);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML =
                `<div class="cart-empty"><i class="fas fa-bag-shopping"></i><p>Your cart is empty</p></div>`;
            document.getElementById('cartFooter').style.display = 'block';
            return;
        }

        let html = '';
        cart.forEach((item, index) => {
            html += `
                        <div class="cart-item">
                            <div class="cart-item-icon"><i class="fas ${item.icon}"></i></div>
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <p>${formatPrice(item.price)}</p>
                            </div>
                            <div class="cart-item-qty">
                                <button data-cart-index="${index}" data-action="decr">−</button>
                                <span>${item.qty}</span>
                                <button data-cart-index="${index}" data-action="incr">+</button>
                            </div>
                            <button class="cart-item-remove" data-cart-index="${index}" data-action="remove"><i class="fas fa-trash-can"></i></button>
                        </div>
                    `;
        });
        cartItemsContainer.innerHTML = html;
        document.getElementById('cartFooter').style.display = 'block';

        cartItemsContainer.querySelectorAll('[data-cart-index]').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const idx = parseInt(this.dataset.cartIndex);
                const action = this.dataset.action;
                if (action === 'incr') {
                    cart[idx].qty += 1;
                } else if (action === 'decr') {
                    cart[idx].qty -= 1;
                    if (cart[idx].qty <= 0) cart.splice(idx, 1);
                } else if (action === 'remove') {
                    cart.splice(idx, 1);
                }
                updateCartUI();
                renderProducts();
            });
        });
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existing = cart.find(c => c.id === productId);
        if (existing) {
            existing.qty += 1;
            showToast(`"${product.name}" · now ${existing.qty} in cart`, 'fa-plus-circle');
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                icon: product.icon,
                qty: 1
            });
            showToast(`"${product.name}" added to cart`, 'fa-check-circle');
        }
        updateCartUI();
        renderProducts();
    }

    // ---------- wishlist ----------
    function toggleWishlist(productId) {
        const idx = wishlist.indexOf(productId);
        if (idx > -1) {
            wishlist.splice(idx, 1);
            showToast('Removed from favorites', 'fa-heart-broken');
        } else {
            wishlist.push(productId);
            showToast('Added to favorites ♥', 'fa-heart');
        }
        renderProducts();
    }

    function isWishlisted(productId) {
        return wishlist.indexOf(productId) > -1;
    }

    // ---------- render products ----------
    function renderProducts() {
        let filtered = products.filter(p => {
            let match = true;
            if (currentFilter === 'all') {
                match = true;
            } else if (currentFilter === 'sale') {
                match = p.badge === 'sale';
            } else if (currentFilter === 'wishlist') {
                match = isWishlisted(p.id);
            } else if (currentFilter === 'new') {
                match = p.badge === 'new';
            } else {
                match = p.category === currentFilter;
            }

            if (searchQuery.trim() !== '') {
                const q = searchQuery.trim().toLowerCase();
                match = match && p.name.toLowerCase().includes(q);
            }
            return match;
        });

        const sortVal = sortSelect.value;
        if (sortVal === 'price-low') filtered.sort((a, b) => a.price - b.price);
        else if (sortVal === 'price-high') filtered.sort((a, b) => b.price - a.price);
        else if (sortVal === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

        if (filtered.length === 0) {
            grid.innerHTML = `
                        <div style="grid-column:1/-1; text-align:center; padding:60px 0; color:#6b7f98;">
                            <i class="fas fa-search" style="font-size:48px; opacity:0.2; display:block; margin-bottom:16px;"></i>
                            <p style="font-size:18px;">No products match your criteria</p>
                        </div>
                    `;
            return;
        }

        let html = '';
        filtered.forEach(p => {
            const inCart = cart.find(c => c.id === p.id);
            const qty = inCart ? inCart.qty : 0;
            const liked = isWishlisted(p.id);
            const badgeHtml = p.badge ?
                `<span class="product-badge ${p.badge === 'sale' ? 'sale' : ''}">${p.badge}</span>` :
                '';
            const oldPriceHtml = p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` :
                '';
            const btnLabel = qty > 0 ? `Add more (${qty})` : 'Add to cart';

            html += `
                        <div class="product-card" data-id="${p.id}">
                            ${badgeHtml}
                            <div class="product-img"><i class="fas ${p.icon}"></i></div>
                            <div class="product-title">${p.name}</div>
                            <div class="product-category">${p.category}</div>
                            <div class="product-price">${formatPrice(p.price)} ${oldPriceHtml}</div>
                            <div class="product-actions">
                                <button class="btn-add" data-id="${p.id}">
                                    <i class="fas fa-cart-plus"></i> ${btnLabel}
                                </button>
                                <button class="btn-wishlist ${liked ? 'liked' : ''}" data-id="${p.id}">
                                    <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    `;
        });

        grid.innerHTML = html;

        grid.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                addToCart(id);
            });
        });

        grid.querySelectorAll('.btn-wishlist').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                toggleWishlist(id);
            });
        });
    }

    // ---------- update active nav link ----------
    function updateActiveNavLink(filter) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.filter === filter) {
                link.classList.add('active');
            }
        });
    }

    // ---------- update active filter tab ----------
    function updateActiveFilterTab(filter) {
        filterTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            }
        });
    }

    // ---------- set filter ----------
    function setFilter(filter) {
        currentFilter = filter;
        updateActiveNavLink(filter);
        let tabExists = false;
        filterTabs.forEach(tab => {
            if (tab.dataset.filter === filter) {
                tabExists = true;
            }
        });
        if (tabExists) {
            updateActiveFilterTab(filter);
        } else {
            filterTabs.forEach(t => t.classList.remove('active'));
            if (filter === 'new') {
                document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');
            }
        }
        closeSearch();
        renderProducts();
        dropdownMenu.classList.remove('open');
    }

    // ---------- filter tabs click ----------
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const filter = this.dataset.filter;
            setFilter(filter);
        });
    });

    // ---------- nav links click ----------
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const filter = this.dataset.filter;
            setFilter(filter);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ---------- sort ----------
    sortSelect.addEventListener('change', renderProducts);

    // ---------- search ----------
    function openSearch() {
        searchOverlay.classList.add('open');
        setTimeout(() => searchInput.focus(), 100);
        searchHint.classList.remove('show');
        searchInput.value = searchQuery || '';
        if (searchQuery.trim() !== '') {
            const count = products.filter(p => p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                .length;
            searchCount.textContent = count;
            searchHint.classList.add('show');
        }
    }

    function closeSearch() {
        searchOverlay.classList.remove('open');
        searchHint.classList.remove('show');
    }

    searchIcon.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', function (e) {
        if (e.target === this) closeSearch();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && searchOverlay.classList.contains('open')) closeSearch();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault();
            openSearch(); }
    });

    searchInput.addEventListener('input', function () {
        searchQuery = this.value;
        const q = searchQuery.trim().toLowerCase();
        const count = products.filter(p => p.name.toLowerCase().includes(q)).length;
        searchCount.textContent = count;
        if (q !== '') {
            searchHint.classList.add('show');
        } else {
            searchHint.classList.remove('show');
        }
        renderProducts();
        if (q !== '') {
            currentFilter = 'all';
            updateActiveNavLink('all');
            updateActiveFilterTab('all');
        }
    });

    // ---------- profile dropdown ----------
    profileIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
        if (!dropdownMenu.contains(e.target) && e.target !== profileIcon && !profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('open');
        }
    });

    // ---------- DROPDOWN: My Account ----------
    dropdownAccount.addEventListener('click', function (e) {
        e.preventDefault();
        dropdownMenu.classList.remove('open');
        if (isSignedIn) {
            showToast(`👤 Account: ${signedInEmail}`, 'fa-user-circle');
        } else {
            showToast('Please sign in to view your account', 'fa-info-circle');
            openAuth();
        }
    });

    // ---------- DROPDOWN: Orders ----------
    dropdownOrders.addEventListener('click', function (e) {
        e.preventDefault();
        dropdownMenu.classList.remove('open');
        if (isSignedIn) {
            showToast('📦 Order history: No orders yet (demo)', 'fa-list-ul');
        } else {
            showToast('Please sign in to view your orders', 'fa-info-circle');
            openAuth();
        }
    });

    // ---------- DROPDOWN: Wishlist ----------
    dropdownWishlist.addEventListener('click', function (e) {
        e.preventDefault();
        dropdownMenu.classList.remove('open');
        filterTabs.forEach(t => t.classList.remove('active'));
        const favoritesTab = document.querySelector('.filter-tab[data-filter="wishlist"]');
        if (favoritesTab) {
            favoritesTab.classList.add('active');
            currentFilter = 'wishlist';
            updateActiveNavLink('wishlist');
            closeSearch();
            renderProducts();
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (wishlist.length === 0) {
                showToast('💔 Your wishlist is empty — start adding favorites!', 'fa-heart-broken');
            } else {
                showToast(`❤️ Showing ${wishlist.length} favorite items`, 'fa-heart');
            }
        }
    });

    // ---------- DROPDOWN: Sign Out ----------
    dropdownSignOut.addEventListener('click', function (e) {
        e.preventDefault();
        dropdownMenu.classList.remove('open');
        if (isSignedIn) {
            isSignedIn = false;
            signedInEmail = '';
            signInBtn.textContent = 'Sign In';
            showToast('Signed out successfully', 'fa-sign-out-alt');
        } else {
            showToast('You are not signed in', 'fa-info-circle');
        }
    });

    // ---------- auth (sign in) ----------
    function openAuth() {
        authOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeAuth() {
        authOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    signInBtn.addEventListener('click', openAuth);
    authClose.addEventListener('click', closeAuth);
    authOverlay.addEventListener('click', function (e) {
        if (e.target === this) closeAuth();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && authOverlay.classList.contains('open')) closeAuth();
    });

    signInForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPassword').value.trim();
        if (email && pass) {
            isSignedIn = true;
            signedInEmail = email;
            signInBtn.textContent = 'Account';
            showToast(`Welcome back, ${email.split('@')[0]}!`, 'fa-user-check');
            closeAuth();
            signInForm.reset();
        } else {
            showToast('Please fill in all fields', 'fa-exclamation-circle');
        }
    });

    authSignupLink.addEventListener('click', function (e) {
        e.preventDefault();
        showToast('✨ Create a new account (demo)', 'fa-user-plus');
    });

    // ---------- logo home ----------
    logoHome.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        currentFilter = 'all';
        searchQuery = '';
        updateActiveNavLink('all');
        updateActiveFilterTab('all');
        if (searchOverlay.classList.contains('open')) closeSearch();
        renderProducts();
        showToast('🏠 Back to home', 'fa-house');
        dropdownMenu.classList.remove('open');
    });

    // ---------- cart panel ----------
    function openCart() {
        cartPanel.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartPanel.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

    // ---------- footer links ----------
    document.getElementById('secureLink').addEventListener('click', function (e) {
        e.preventDefault();
        showToast('🔒 Secure checkout — encrypted & safe', 'fa-lock');
    });
    document.getElementById('returnsLink').addEventListener('click', function (e) {
        e.preventDefault();
        showToast('📦 Free returns within 30 days', 'fa-undo-alt');
    });

    // ---------- explore button ----------
    document.getElementById('exploreBtn').addEventListener('click', function () {
        grid.scrollIntoView({ behavior: 'smooth' });
    });

    // ---------- checkout button ----------
    document.getElementById('checkoutBtn').addEventListener('click', function () {
        if (cart.length === 0) {
            showToast('Your cart is empty', 'fa-info-circle');
            return;
        }
        showToast('🛒 Proceeding to checkout (demo)', 'fa-credit-card');
        closeCart();
    });

    // ---------- init ----------
    currentFilter = 'all';
    renderProducts();
    updateCartUI();
    document.querySelector('.footer span:first-child').innerHTML = '© 2026 E-Store — premium e‑commerce';

    console.log('🔍 Press Ctrl+K to search');

})();