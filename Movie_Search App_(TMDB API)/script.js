// ===== script.js =====

(function() {
    'use strict';

    // ============================================================
    // 🔑 PASTE YOUR TMDB API KEY HERE
    // Get it from: https://www.themoviedb.org/settings/api
    // ============================================================
    const API_KEY = '49efc895c42ef8a9d2f2da8d96a420e6'; // <-- Your API key
    
    // ============================================================
    // ⚠️ IMPORTANT: If you're using a different API key, replace it above
    // ============================================================

    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
    const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"%3E%3Crect width="500" height="750" fill="%23161e30"/%3E%3Ctext x="250" y="375" font-family="Inter" font-size="40" fill="%232a3a5a" text-anchor="middle" dominant-baseline="middle"%3E🎬%3C/text%3E%3C/svg%3E';

    // ----- DOM Refs -----
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const movieGrid = document.getElementById('movieGrid');
    const resultsCount = document.getElementById('resultsCount');
    const yearFilter = document.getElementById('yearFilter');
    const sortFilter = document.getElementById('sortFilter');
    const apiStatus = document.getElementById('apiStatus');
    const apiStatusDetail = document.getElementById('apiStatusDetail');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalPoster = document.getElementById('modalPoster');
    const modalTitle = document.getElementById('modalTitle');
    const modalMeta = document.getElementById('modalMeta');
    const modalOverview = document.getElementById('modalOverview');
    const modalDetails = document.getElementById('modalDetails');

    // ----- State -----
    let currentMovies = [];

    // ----- Check API Key -----
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY || API_KEY.length < 10) {
        apiStatus.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        document.querySelector('.api-status .icon').textContent = '❌';
        apiStatusDetail.innerHTML = 
            '<strong>API Key Missing!</strong> Please replace <code>YOUR_API_KEY_HERE</code> with your TMDB API key. ' +
            '<a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:#f59e0b;">Get your free key here →</a>';
        showEmptyState('🔑 API Key Required', 'Please add your TMDB API key to continue');
    } else {
        apiStatus.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        document.querySelector('.api-status .icon').textContent = '✅';
        apiStatusDetail.innerHTML = 
            'Your API key is set up. <span style="color:#34d399;">Ready to search!</span> ' +
            'If you see errors, try waiting 5-10 minutes for the API key to activate.';
    }

    // ----- Helper: Fetch with API Key -----
    async function fetchTMDB(endpoint, params = {}) {
        const url = new URL(`${BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key]) url.searchParams.append(key, params[key]);
        });
        url.searchParams.append('api_key', API_KEY);
        url.searchParams.append('_', Date.now());

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // ----- Search movies (ANY movie) -----
    async function searchMovies(query, year = '', sort = 'popularity.desc') {
        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            showEmptyState('🔑 API Key Required', 'Please add your TMDB API key to continue');
            resultsCount.innerHTML = '<strong>0</strong> movies found';
            return;
        }

        if (!query.trim()) {
            showEmptyState('Search for any movie', 'Type any movie name above');
            resultsCount.innerHTML = '<strong>0</strong> movies found';
            currentMovies = [];
            return;
        }

        showLoading();

        try {
            const params = {
                query: query.trim(),
                include_adult: false,
                language: 'en-US',
                page: 1
            };

            if (year) {
                params.year = parseInt(year);
            }

            const data = await fetchTMDB('/search/movie', params);

            if (data.results && data.results.length > 0) {
                let results = data.results;
                
                // Sort results based on selection
                if (sort === 'vote_average.desc') {
                    results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
                } else if (sort === 'release_date.desc') {
                    results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
                } else if (sort === 'release_date.asc') {
                    results.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
                }
                // popularity.desc is default

                currentMovies = results;
                renderMovies(results);
                resultsCount.innerHTML = `<strong>${data.total_results}</strong> movies found`;
            } else {
                currentMovies = [];
                showEmptyState('No movies found', `No results for "${query}". Try a different search term.`);
                resultsCount.innerHTML = '<strong>0</strong> movies found';
            }
        } catch (error) {
            console.error('Search error:', error);
            showEmptyState(
                '❌ Unable to connect to TMDB',
                'Please check:\n• Your internet connection\n• Your API key is correct\n• Wait 5-10 minutes for API key activation\n• Try refreshing the page'
            );
            resultsCount.innerHTML = '<strong>0</strong> movies found';
        }
    }

    // ----- Render movies -----
    function renderMovies(movies) {
        if (!movies || movies.length === 0) {
            showEmptyState('No movies found', 'Try a different search term');
            return;
        }

        let html = '';
        movies.forEach(movie => {
            const posterPath = movie.poster_path ?
                `${IMAGE_BASE}${movie.poster_path}` :
                PLACEHOLDER_IMAGE;

            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
            const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';

            html += `
                    <div class="movie-card" data-id="${movie.id}">
                        <div class="poster">
                            <img src="${posterPath}" alt="${escapeHtml(movie.title)}" loading="lazy" />
                            <div class="rating-badge">
                                <i class="fas fa-star"></i> ${rating}
                            </div>
                        </div>
                        <div class="info">
                            <div class="title">${escapeHtml(movie.title)}</div>
                            <div class="year">${year}</div>
                        </div>
                    </div>
                `;
        });

        movieGrid.innerHTML = html;

        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', function() {
                const id = parseInt(this.dataset.id, 10);
                const movie = currentMovies.find(m => m.id === id);
                if (movie) openModal(movie);
            });
        });
    }

    // ----- Show loading -----
    function showLoading() {
        movieGrid.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1;">
                    <i class="fas fa-spinner"></i>
                    <p>Searching for movies...</p>
                </div>
            `;
    }

    // ----- Show empty state -----
    function showEmptyState(title, subtitle) {
        movieGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(subtitle)}</p>
                </div>
            `;
    }

    // ----- Open modal -----
    function openModal(movie) {
        const posterPath = movie.poster_path ?
            `${IMAGE_BASE}${movie.poster_path}` :
            PLACEHOLDER_IMAGE;

        modalPoster.src = posterPath;
        modalPoster.alt = movie.title;
        modalTitle.textContent = movie.title;

        const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const votes = movie.vote_count || 0;

        modalMeta.innerHTML = `
                <span><i class="fas fa-calendar-alt"></i> ${year}</span>
                <span><i class="fas fa-star" style="color:#f59e0b;"></i> ${rating} (${votes} votes)</span>
            `;

        modalOverview.textContent = movie.overview || 'No overview available.';

        fetchMovieDetails(movie.id);
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // ----- Fetch movie details for modal -----
    async function fetchMovieDetails(movieId) {
        try {
            const data = await fetchTMDB(`/movie/${movieId}`, { language: 'en-US' });

            const genres = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';
            const runtime = data.runtime ? `${data.runtime} min` : 'N/A';
            const status = data.status || 'N/A';

            modalDetails.innerHTML = `
                    <div class="detail-item">
                        <span class="label">Genres</span>
                        <span class="value">${escapeHtml(genres)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Runtime</span>
                        <span class="value">${runtime}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Status</span>
                        <span class="value">${escapeHtml(status)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Original Language</span>
                        <span class="value">${(data.original_language || 'N/A').toUpperCase()}</span>
                    </div>
                `;

        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }

    // ----- Close modal -----
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ----- Helper: escape HTML -----
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ----- Perform search -----
    function performSearch() {
        const query = searchInput.value.trim();
        const year = yearFilter.value;
        const sort = sortFilter.value;
        searchMovies(query, year, sort);
    }

    // ----- Init -----
    function init() {
        // Search events
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // Filter changes
        yearFilter.addEventListener('change', performSearch);
        sortFilter.addEventListener('change', performSearch);

        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const movie = this.dataset.movie;
                searchInput.value = movie;
                performSearch();
            });
        });

        // Modal close
        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });

        // Initial state
        if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
            showEmptyState(
                '🔑 API Key Required',
                'Please add your TMDB API key to continue'
            );
        } else {
            showEmptyState('Search for any movie', 'Type any movie name above');
        }
        resultsCount.innerHTML = '<strong>0</strong> movies found';
    }

    init();
})();