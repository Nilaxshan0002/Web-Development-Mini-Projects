/**
 * CineBase · Movie Database – JavaScript
 */

(function() {
  "use strict";

  // ============================================
  // MOVIE DATABASE with dedicated poster images
  // ============================================
  const movieDatabase = [
    { id: 1, title: "Inception", year: 2010, genre: "Sci-Fi", rating: 8.8, director: "Christopher Nolan", cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"], plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.", poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" },
    { id: 2, title: "The Dark Knight", year: 2008, genre: "Action", rating: 9.0, director: "Christopher Nolan", cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"], plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", poster: "https://image.tmdb.org/t/p/w500/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg" },
    { id: 3, title: "Interstellar", year: 2014, genre: "Sci-Fi", rating: 8.6, director: "Christopher Nolan", cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"], plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
    { id: 4, title: "The Godfather", year: 1972, genre: "Drama", rating: 9.2, director: "Francis Ford Coppola", cast: ["Marlon Brando", "Al Pacino", "James Caan"], plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.", poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
    { id: 5, title: "Pulp Fiction", year: 1994, genre: "Thriller", rating: 8.9, director: "Quentin Tarantino", cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman"], plot: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.", poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
    { id: 6, title: "The Shawshank Redemption", year: 1994, genre: "Drama", rating: 9.3, director: "Frank Darabont", cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"], plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", poster: "https://image.tmdb.org/t/p/w500/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg" },
    { id: 7, title: "Forrest Gump", year: 1994, genre: "Comedy", rating: 8.8, director: "Robert Zemeckis", cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"], plot: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.", poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
    { id: 8, title: "The Matrix", year: 1999, genre: "Sci-Fi", rating: 8.7, director: "Lana Wachowski, Lilly Wachowski", cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"], plot: "A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { id: 9, title: "Goodfellas", year: 1990, genre: "Thriller", rating: 8.7, director: "Martin Scorsese", cast: ["Robert De Niro", "Ray Liotta", "Joe Pesci"], plot: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen and his mob partners Jimmy Conway and Tommy DeVito.", poster: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg" },
    { id: 10, title: "The Lion King", year: 1994, genre: "Animation", rating: 8.5, director: "Roger Allers, Rob Minkoff", cast: ["Matthew Broderick", "Jeremy Irons", "James Earl Jones"], plot: "A young lion prince is cast out of his pride by his cruel uncle, who claims he killed his father. While in exile, he learns valuable lessons about responsibility and courage.", poster: "https://image.tmdb.org/t/p/w500/sKCr78MXS5Lf2B7I2sLrO1r5J0V.jpg" },
    { id: 11, title: "Gladiator", year: 2000, genre: "Action", rating: 8.5, director: "Ridley Scott", cast: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"], plot: "A former Roman general seeks revenge against the corrupt emperor who murdered his family and sent him into slavery.", poster: "https://image.tmdb.org/t/p/w500/6WBIzCgmDCYrqh64yDRE2Dx9fx5.jpg" },
    { id: 12, title: "The Social Network", year: 2010, genre: "Drama", rating: 7.7, director: "David Fincher", cast: ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake"], plot: "The story of the founding of Facebook and the legal battles that followed.", poster: "https://image.tmdb.org/t/p/w500/ok5Wj9Zus7QePqTwJpI5PRQ5LcE.jpg" }
  ];

  // ============================================
  // STATE
  // ============================================
  let currentMovies = [...movieDatabase];
  let filteredMovies = [...movieDatabase];
  let currentFilter = 'all';

  // ============================================
  // DOM REFS
  // ============================================
  const movieGrid = document.getElementById('movieGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const genreFilter = document.getElementById('genreFilter');
  const yearFilter = document.getElementById('yearFilter');
  const allBtn = document.getElementById('allBtn');
  const topRatedBtn = document.getElementById('topRatedBtn');
  const recentBtn = document.getElementById('recentBtn');
  const countNumber = document.getElementById('countNumber');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const aboutLink = document.getElementById('aboutLink');
  const apiLink = document.getElementById('apiLink');
  const privacyLink = document.getElementById('privacyLink');
  const favoriteBtn = document.getElementById('favoriteBtn');
  const notifBtn = document.getElementById('notifBtn');
  const avatarBtn = document.getElementById('avatarBtn');

  // ============================================
  // RENDER MOVIES (with <img>)
  // ============================================
  function renderMovies(movies) {
    movieGrid.innerHTML = '';
    if (movies.length === 0) {
      emptyState.style.display = 'block';
      movieGrid.style.display = 'none';
      countNumber.textContent = '0';
      return;
    }
    emptyState.style.display = 'none';
    movieGrid.style.display = 'grid';
    countNumber.textContent = movies.length;

    movies.forEach(m => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.dataset.id = m.id;
      card.innerHTML = `
        <div class="movie-poster">
          <img src="${m.poster}" alt="${m.title} poster" loading="lazy" />
          <span class="rating-badge"><i class="fas fa-star" style="color:#f5a623;"></i> ${m.rating}</span>
          <span class="year-badge">${m.year}</span>
        </div>
        <div class="movie-info">
          <h4>${m.title}</h4>
          <div class="meta">
            <span class="genre"><i class="fas fa-circle"></i> ${m.genre}</span>
            <span>${m.year}</span>
          </div>
          <div class="description">${m.plot.substring(0, 80)}${m.plot.length > 80 ? '...' : ''}</div>
        </div>
      `;
      movieGrid.appendChild(card);
    });
  }

  // ============================================
  // FILTER LOGIC
  // ============================================
  function applyFilters() {
    let result = [...currentMovies];

    const query = searchInput.value.toLowerCase().trim();
    if (query) {
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.genre.toLowerCase().includes(query) ||
        m.director.toLowerCase().includes(query) ||
        m.cast.some(c => c.toLowerCase().includes(query))
      );
    }

    const genre = genreFilter.value;
    if (genre !== 'all') {
      result = result.filter(m => m.genre === genre);
    }

    const year = yearFilter.value;
    if (year !== 'all') {
      result = result.filter(m => m.year === parseInt(year));
    }

    if (currentFilter === 'toprated') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (currentFilter === 'recent') {
      result = [...result].sort((a, b) => b.year - a.year);
    }

    filteredMovies = result;
    renderMovies(result);
  }

  // ============================================
  // SHOW MOVIE DETAILS (MODAL)
  // ============================================
  function showMovieDetail(id) {
    const movie = movieDatabase.find(m => m.id === id);
    if (!movie) return;

    modalTitle.textContent = movie.title;
    modalBody.innerHTML = `
      <div class="detail-row">
        <span class="label">Year</span>
        <span class="value">${movie.year}</span>
      </div>
      <div class="detail-row">
        <span class="label">Genre</span>
        <span class="value">${movie.genre}</span>
      </div>
      <div class="detail-row">
        <span class="label">Rating</span>
        <span class="value"><i class="fas fa-star" style="color:#f5a623;"></i> ${movie.rating}/10</span>
      </div>
      <div class="detail-row">
        <span class="label">Director</span>
        <span class="value">${movie.director}</span>
      </div>
      <div class="detail-row">
        <span class="label">Cast</span>
        <div class="cast-list">
          ${movie.cast.map(c => `<span>${c}</span>`).join('')}
        </div>
      </div>
      <div class="plot">
        <strong style="color:#e6edf3;">Plot</strong>
        <p style="margin-top:0.2rem;">${movie.plot}</p>
      </div>
    `;
    modalOverlay.classList.add('active');
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  // Search
  searchBtn.addEventListener('click', applyFilters);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });

  // Filters
  genreFilter.addEventListener('change', applyFilters);
  yearFilter.addEventListener('change', applyFilters);

  // Filter buttons
  allBtn.addEventListener('click', function() {
    currentFilter = 'all';
    [allBtn, topRatedBtn, recentBtn].forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    applyFilters();
  });

  topRatedBtn.addEventListener('click', function() {
    currentFilter = 'toprated';
    [allBtn, topRatedBtn, recentBtn].forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    applyFilters();
  });

  recentBtn.addEventListener('click', function() {
    currentFilter = 'recent';
    [allBtn, topRatedBtn, recentBtn].forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    applyFilters();
  });

  // Click on movie card
  movieGrid.addEventListener('click', function(e) {
    const card = e.target.closest('.movie-card');
    if (card) {
      const id = parseInt(card.dataset.id);
      showMovieDetail(id);
    }
  });

  // Modal controls
  closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === this) modalOverlay.classList.remove('active');
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
    }
  });

  // Footer links
  aboutLink.addEventListener('click', e => { 
    e.preventDefault(); 
    alert('About CineBase: A sample movie database project.'); 
  });
  apiLink.addEventListener('click', e => { 
    e.preventDefault(); 
    alert('API endpoint: /api/movies'); 
  });
  privacyLink.addEventListener('click', e => { 
    e.preventDefault(); 
    alert('Privacy Policy: We do not store personal data.'); 
  });

  // Header buttons
  favoriteBtn.addEventListener('click', () => alert('❤️ Favorites: You can add movies to your favorites list.'));
  notifBtn.addEventListener('click', () => alert('🔔 Notifications: No new notifications.'));
  avatarBtn.addEventListener('click', () => alert('👤 Profile: John Doe (jd@example.com)'));

  // ============================================
  // INIT
  // ============================================
  renderMovies(movieDatabase);
  countNumber.textContent = movieDatabase.length;

})();