(function() {
    "use strict";

    // ---------- recipe data ----------
    const recipes = [{
        id: 1,
        name: "Maple Glazed Salmon",
        category: "dinner",
        time: "30 min",
        difficulty: "easy",
        kcal: 420,
        badge: "popular",
        icon: "fa-fish",
        desc: "Perfectly baked salmon with a sweet maple glaze and garlic herb rice. A restaurant-quality meal in under 30 minutes.",
        ingredients: ["Salmon fillets", "Maple syrup", "Soy sauce", "Garlic", "Rice", "Fresh herbs"],
        instructions: "Preheat oven to 200°C. Mix maple syrup, soy, and garlic. Coat salmon and bake for 15 min. Serve over herbed rice.",
        tags: ["healthy", "delicious"]
    }, {
        id: 2,
        name: "Avocado Toast Deluxe",
        category: "breakfast",
        time: "10 min",
        difficulty: "easy",
        kcal: 280,
        badge: "vegan",
        icon: "fa-bread-slice",
        desc: "Creamy avocado on sourdough with cherry tomatoes, chili flakes, and a drizzle of olive oil.",
        ingredients: ["Sourdough bread", "Avocado", "Cherry tomatoes", "Chili flakes", "Olive oil"],
        instructions: "Toast bread. Mash avocado with salt and pepper. Spread on toast, top with tomatoes and chili flakes.",
        tags: ["healthy", "quick", "delicious"]
    }, {
        id: 3,
        name: "Quinoa Buddha Bowl",
        category: "lunch",
        time: "20 min",
        difficulty: "medium",
        kcal: 520,
        badge: "vegan",
        icon: "fa-seedling",
        desc: "Nutrient-packed bowl with quinoa, roasted veggies, chickpeas, and a tahini dressing.",
        ingredients: ["Quinoa", "Sweet potato", "Chickpeas", "Kale", "Tahini", "Lemon"],
        instructions: "Cook quinoa. Roast sweet potato and chickpeas. Massage kale, assemble bowl, drizzle with tahini dressing.",
        tags: ["healthy", "delicious"]
    }, {
        id: 4,
        name: "Creamy Mushroom Pasta",
        category: "dinner",
        time: "25 min",
        difficulty: "medium",
        kcal: 560,
        badge: null,
        icon: "fa-utensils",
        desc: "Rich and creamy pasta with sautéed mushrooms, garlic, parmesan, and a touch of white wine.",
        ingredients: ["Pasta", "Mushrooms", "Garlic", "Parmesan", "White wine", "Cream"],
        instructions: "Cook pasta. Sauté mushrooms and garlic, deglaze with wine, add cream and parmesan. Toss with pasta.",
        tags: ["delicious"]
    }, {
        id: 5,
        name: "Berry Oatmeal Bowl",
        category: "breakfast",
        time: "8 min",
        difficulty: "easy",
        kcal: 310,
        badge: "vegan",
        icon: "fa-bowl-food",
        desc: "Warm oatmeal topped with fresh berries, almond butter, and a sprinkle of cinnamon.",
        ingredients: ["Oats", "Almond milk", "Mixed berries", "Almond butter", "Cinnamon"],
        instructions: "Cook oats with almond milk. Top with berries, almond butter, and cinnamon.",
        tags: ["healthy", "quick", "delicious"]
    }, {
        id: 6,
        name: "Lemon Herb Chicken",
        category: "dinner",
        time: "35 min",
        difficulty: "medium",
        kcal: 480,
        badge: "popular",
        icon: "fa-drumstick",
        desc: "Juicy chicken breasts marinated in lemon, garlic, and fresh herbs, pan-seared to perfection.",
        ingredients: ["Chicken breast", "Lemon", "Garlic", "Rosemary", "Thyme", "Olive oil"],
        instructions: "Marinate chicken with lemon, garlic, and herbs. Pan-sear until golden and cooked through.",
        tags: ["delicious"]
    }, {
        id: 7,
        name: "Chocolate Lava Cake",
        category: "dessert",
        time: "20 min",
        difficulty: "hard",
        kcal: 620,
        badge: null,
        icon: "fa-cake-candles",
        desc: "Decadent chocolate cake with a gooey molten center. The ultimate indulgence for chocolate lovers.",
        ingredients: ["Dark chocolate", "Butter", "Sugar", "Eggs", "Flour", "Vanilla"],
        instructions: "Melt chocolate and butter. Whisk eggs and sugar, fold in flour. Bake at 180°C for 12 min until edges set.",
        tags: ["delicious"]
    }, {
        id: 8,
        name: "Mediterranean Salad",
        category: "lunch",
        time: "12 min",
        difficulty: "easy",
        kcal: 340,
        badge: "vegan",
        icon: "fa-leaf",
        desc: "Fresh and vibrant salad with cucumbers, tomatoes, olives, feta, and a zesty oregano dressing.",
        ingredients: ["Cucumber", "Tomatoes", "Olives", "Feta cheese", "Oregano", "Olive oil"],
        instructions: "Chop vegetables, combine with olives and feta. Dress with olive oil and oregano.",
        tags: ["healthy", "quick", "delicious"]
    }, {
        id: 9,
        name: "Thai Green Curry",
        category: "dinner",
        time: "30 min",
        difficulty: "medium",
        kcal: 590,
        badge: "popular",
        icon: "fa-bowl-food",
        desc: "Aromatic coconut curry with green chili, vegetables, and your choice of protein. Serve with jasmine rice.",
        ingredients: ["Coconut milk", "Green curry paste", "Vegetables", "Protein (tofu/chicken)", "Jasmine rice"],
        instructions: "Sauté curry paste, add coconut milk and vegetables. Simmer until tender, serve over rice.",
        tags: ["delicious"]
    }];

    // ---------- state ----------
    let currentFilter = 'all';
    let currentSort = 'featured';
    let searchTerm = '';
    let showingFavorites = false;
    let footerFilter = null;
    let favorites = new Set();

    // ---------- DOM refs ----------
    const grid = document.getElementById('recipeGrid');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    const favoritesBtn = document.getElementById('favoritesBtn');
    const favCount = document.getElementById('favCount');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModal');
    const footerLinks = document.querySelectorAll('[data-footer-filter]');

    // ---------- localStorage ----------
    function loadFavorites() {
        try {
            const data = localStorage.getItem('recipeverse_favorites');
            if (data) {
                const arr = JSON.parse(data);
                favorites = new Set(arr);
            }
        } catch (_) { /* ignore */ }
        updateFavCount();
    }

    function saveFavorites() {
        try {
            localStorage.setItem('recipeverse_favorites', JSON.stringify([...favorites]));
        } catch (_) { /* ignore */ }
        updateFavCount();
    }

    function updateFavCount() {
        // Update the badge count
        if (favCount) {
            favCount.textContent = favorites.size;
            favCount.style.display = favorites.size > 0 ? 'inline-block' : 'none';
        }

        // Update heart icons on all recipe cards
        document.querySelectorAll('.recipe-card').forEach(card => {
            const id = parseInt(card.dataset.id);
            const btn = card.querySelector('.btn-save');
            if (btn) {
                if (favorites.has(id)) {
                    btn.classList.add('saved');
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                } else {
                    btn.classList.remove('saved');
                    btn.innerHTML = '<i class="far fa-heart"></i>';
                }
            }
        });

        // Update the Favorites button style
        if (favoritesBtn) {
            if (showingFavorites) {
                favoritesBtn.classList.add('active-fav');
            } else {
                favoritesBtn.classList.remove('active-fav');
            }
        }
    }

    // ---------- core logic ----------
    function getFilteredAndSorted() {
        let result = recipes.filter(r => {
            let matchCategory = true;
            if (currentFilter === 'all') {
                matchCategory = true;
            } else if (currentFilter === 'vegan') {
                matchCategory = r.badge === 'vegan';
            } else {
                matchCategory = r.category === currentFilter;
            }

            const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.desc.toLowerCase().includes(searchTerm.toLowerCase());

            let matchFav = true;
            if (showingFavorites) {
                matchFav = favorites.has(r.id);
            }

            let matchFooter = true;
            if (footerFilter === 'healthy') {
                matchFooter = r.kcal < 400 || r.badge === 'vegan' || (r.tags && r.tags.includes('healthy'));
            } else if (footerFilter === 'quick') {
                const minutes = parseInt(r.time);
                matchFooter = minutes <= 15 || (r.tags && r.tags.includes('quick'));
            } else if (footerFilter === 'delicious') {
                matchFooter = r.badge === 'popular' || (r.tags && r.tags.includes('delicious'));
            }

            return matchCategory && matchSearch && matchFav && matchFooter;
        });

        // Sorting
        if (currentSort === 'time') {
            result.sort((a, b) => parseInt(a.time) - parseInt(b.time));
        } else if (currentSort === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'popular') {
            result.sort((a, b) => (b.badge === 'popular' ? 1 : 0) - (a.badge === 'popular' ? 1 : 0));
        }
        // 'featured' – keep original order
        return result;
    }

    function renderRecipes() {
        if (!grid) return;

        const list = getFilteredAndSorted();
        let html = '';

        if (list.length === 0) {
            html = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No recipes found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                    <button class="btn-primary" style="margin-top:16px;" onclick="window.resetFilters()">
                        <i class="fas fa-undo"></i> Reset Filters
                    </button>
                </div>
            `;
            grid.innerHTML = html;
            document.dispatchEvent(new CustomEvent('recipesRendered', { detail: { list: [] } }));
            return;
        }

        list.forEach(r => {
            const badgeHtml = r.badge ?
                `<span class="recipe-badge ${r.badge === 'vegan' ? 'vegan' : 'popular'}">${r.badge}</span>` :
                '';
            const isFav = favorites.has(r.id);
            const heartIcon = isFav ? 'fas' : 'far';
            const heartClass = isFav ? 'saved' : '';

            html += `
                <div class="recipe-card" data-id="${r.id}">
                    ${badgeHtml}
                    <div class="recipe-img"><i class="fas ${r.icon}"></i></div>
                    <div class="recipe-title">${r.name}</div>
                    <div class="recipe-meta">
                        <span><i class="far fa-clock"></i> ${r.time}</span>
                        <span><i class="fas fa-fire"></i> ${r.kcal} kcal</span>
                    </div>
                    <div class="recipe-desc">${r.desc.substring(0, 70)}${r.desc.length > 70 ? '…' : ''}</div>
                    <div class="recipe-actions">
                        <button class="btn-view" data-id="${r.id}"><i class="fas fa-eye"></i> View</button>
                        <button class="btn-save ${heartClass}" data-id="${r.id}"><i class="${heartIcon} fa-heart"></i></button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

        // Attach event listeners
        grid.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                openModal(parseInt(this.dataset.id));
            });
        });

        grid.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFavorite(parseInt(this.dataset.id));
            });
        });

        // Dispatch event for stats updates
        document.dispatchEvent(new CustomEvent('recipesRendered', { detail: { list } }));
    }

    // ---------- reset all filters ----------
    function resetFilters() {
        currentFilter = 'all';
        footerFilter = null;
        showingFavorites = false;
        searchTerm = '';
        currentSort = 'featured';

        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'featured';

        // Reset filter tabs
        filterTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');

        // Reset footer links
        updateFooterActiveState();

        // Reset favorites button
        if (favoritesBtn) {
            favoritesBtn.classList.remove('active-fav');
        }

        renderRecipes();
        document.dispatchEvent(new CustomEvent('favoritesUpdated'));
    }

    window.resetFilters = resetFilters;

    // ---------- favorites ----------
    function toggleFavorite(id) {
        if (favorites.has(id)) {
            favorites.delete(id);
        } else {
            favorites.add(id);
        }
        saveFavorites();
        renderRecipes();
        updateFooterActiveState();
        document.dispatchEvent(new CustomEvent('favoritesUpdated'));
    }

    // ---------- modal ----------
    function openModal(id) {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return;

        if (modalTitle) modalTitle.textContent = recipe.name;
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-img"><i class="fas ${recipe.icon}"></i></div>
                <div class="modal-meta">
                    <span><i class="far fa-clock"></i> ${recipe.time}</span>
                    <span><i class="fas fa-fire"></i> ${recipe.kcal} kcal</span>
                    <span><i class="fas fa-utensil-spoon"></i> ${recipe.difficulty}</span>
                </div>
                <p>${recipe.desc}</p>
                <div><strong>Ingredients:</strong></div>
                <ul>
                    ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
                <div><strong>Instructions:</strong></div>
                <p style="margin-top:4px;">${recipe.instructions}</p>
                <div style="margin-top:24px; display:flex; gap:12px; flex-wrap:wrap;">
                    <button class="btn-primary" style="margin-top:0;" onclick="window.toggleFavoriteFromModal(${recipe.id})">
                        <i class="${favorites.has(recipe.id) ? 'fas' : 'far'} fa-heart"></i>
                        ${favorites.has(recipe.id) ? 'Saved' : 'Save Recipe'}
                    </button>
                    <button class="btn-secondary" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
                </div>
            `;
        }

        if (modalOverlay) {
            modalOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    window.openModal = openModal;
    window.toggleFavoriteFromModal = function(id) {
        toggleFavorite(id);
        openModal(id);
    };

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ---------- filter tabs ----------
    if (filterTabs) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                footerFilter = null;
                updateFooterActiveState();
                renderRecipes();
            });
        });
    }

    // ---------- sort ----------
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            renderRecipes();
        });
    }

    // ---------- search ----------
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value.trim();
            renderRecipes();
        });
    }

    // ---------- favorites button ----------
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', function() {
            showingFavorites = !showingFavorites;
            if (showingFavorites) {
                this.classList.add('active-fav');
            } else {
                this.classList.remove('active-fav');
            }
            renderRecipes();
        });
    }

    // ---------- footer links ----------
    function updateFooterActiveState() {
        footerLinks.forEach(link => {
            const val = link.dataset.footerFilter;
            if (footerFilter === val) {
                link.style.color = '#e85d3a';
                link.style.fontWeight = '600';
            } else {
                link.style.color = '';
                link.style.fontWeight = '';
            }
        });
    }

    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const val = this.dataset.footerFilter;

            if (footerFilter === val) {
                footerFilter = null;
            } else {
                footerFilter = val;
                // Clear category filter and set to "All"
                filterTabs.forEach(t => t.classList.remove('active'));
                document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');
                currentFilter = 'all';
            }

            updateFooterActiveState();
            renderRecipes();
        });
    });

    // ---------- expose globally ----------
    window.recipes = recipes;
    window.favorites = favorites;
    window.renderRecipes = renderRecipes;
    window.getFilteredAndSorted = getFilteredAndSorted;
    window.toggleFavorite = toggleFavorite;
    window.resetFilters = resetFilters;
    window.currentFilter = () => currentFilter;
    window.currentSort = () => currentSort;
    window.searchTerm = () => searchTerm;
    window.showingFavorites = () => showingFavorites;
    window.footerFilter = () => footerFilter;

    // ---------- init ----------
    loadFavorites();
    renderRecipes();

})();