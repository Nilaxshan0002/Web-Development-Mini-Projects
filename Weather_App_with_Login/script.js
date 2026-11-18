// ============================================================
//  WEATHER APP — full login, weather, favorites with localStorage
// ============================================================

// ---------- state ----------
let currentUser = null;              // username string
let currentCity = null;             // last searched city
let weatherData = null;             // last weather data

// ---------- DOM refs ----------
const loginSection = document.getElementById('loginSection');
const weatherSection = document.getElementById('weatherSection');

const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const togglePassword = document.getElementById('togglePassword');

const displayUser = document.getElementById('displayUser');
const logoutBtn = document.getElementById('logoutBtn');

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const saveFavBtn = document.getElementById('saveFavBtn');
const favoritesContainer = document.getElementById('favoritesContainer');

// ---------- password toggle ----------
let passwordVisible = false;
togglePassword.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    loginPass.type = passwordVisible ? 'text' : 'password';
    togglePassword.textContent = passwordVisible ? '🙈' : '👁️';
});

// ---------- helpers ----------
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('weather_users')) || {};
    } catch { return {}; }
}

function saveUsers(users) {
    localStorage.setItem('weather_users', JSON.stringify(users));
}

function getFavorites(username) {
    try {
        const all = JSON.parse(localStorage.getItem('weather_favorites')) || {};
        return all[username] || [];
    } catch { return []; }
}

function saveFavorites(username, favs) {
    const all = JSON.parse(localStorage.getItem('weather_favorites')) || {};
    all[username] = favs;
    localStorage.setItem('weather_favorites', JSON.stringify(all));
}

// ---------- render favorites ----------
function renderFavorites() {
    if (!currentUser) return;
    const favs = getFavorites(currentUser);
    if (!favs.length) {
        favoritesContainer.innerHTML = '<span class="empty-favs">No favorites yet</span>';
        return;
    }
    favoritesContainer.innerHTML = favs.map(city => `
        <div class="fav-chip" data-city="${city}">
            ⭐ ${city}
            <button class="remove-fav" data-city="${city}">✕</button>
        </div>
    `).join('');

    // click on chip → search that city
    favoritesContainer.querySelectorAll('.fav-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-fav')) return;
            const city = chip.dataset.city;
            cityInput.value = city;
            fetchWeather(city);
        });
    });

    // remove favorite
    favoritesContainer.querySelectorAll('.remove-fav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const city = btn.dataset.city;
            let favs = getFavorites(currentUser);
            favs = favs.filter(c => c.toLowerCase() !== city.toLowerCase());
            saveFavorites(currentUser, favs);
            renderFavorites();
        });
    });
}

// ---------- fetch weather from OpenWeatherMap ----------
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // demo key

async function fetchWeather(city) {
    if (!city) {
        weatherDisplay.innerHTML = `<div style="color:rgba(255,255,255,0.3); font-size:0.95rem;">Please enter a city name</div>`;
        return;
    }

    weatherDisplay.innerHTML = `<div style="color:rgba(255,255,255,0.3);">⏳ Loading...</div>`;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) throw new Error('City not found');
            throw new Error('Failed to fetch weather');
        }
        const data = await response.json();

        weatherData = data;
        currentCity = data.name;

        weatherDisplay.innerHTML = `
            <div class="city-name">${data.name}, ${data.sys.country}</div>
            <div class="temp">${Math.round(data.main.temp)}°C</div>
            <div class="desc">${data.weather[0].description}</div>
            <div class="details">
                <span>💧 ${data.main.humidity}%</span>
                <span>💨 ${Math.round(data.wind.speed)} m/s</span>
                <span>🌡️ ${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°</span>
            </div>
        `;
    } catch (err) {
        weatherDisplay.innerHTML = `
            <div class="error-weather">❌ ${err.message}</div>
        `;
        weatherData = null;
        currentCity = null;
    }
}

// ---------- save favorite ----------
function saveFavorite() {
    if (!currentUser) return;
    if (!currentCity) {
        alert('Please search for a city first.');
        return;
    }
    const favs = getFavorites(currentUser);
    if (favs.some(c => c.toLowerCase() === currentCity.toLowerCase())) {
        alert(`${currentCity} is already in your favorites!`);
        return;
    }
    favs.push(currentCity);
    saveFavorites(currentUser, favs);
    renderFavorites();
}

// ---------- login / signup ----------
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    loginBtn.textContent = isLoginMode ? 'Sign In' : 'Create Account';
    toggleText.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
    toggleLink.textContent = isLoginMode ? 'Sign Up' : 'Sign In';
    loginError.textContent = '';
    loginSuccess.textContent = '';
}

function handleAuth() {
    const user = loginUser.value.trim();
    const pass = loginPass.value.trim();

    // Clear previous messages
    loginError.textContent = '';
    loginSuccess.textContent = '';

    if (!user || !pass) {
        loginError.textContent = 'Please fill in all fields.';
        return;
    }

    const users = getUsers();

    if (isLoginMode) {
        // LOGIN
        if (users[user] && users[user] === pass) {
            loginSuccess.textContent = '✅ Login successful!';
            setTimeout(() => {
                currentUser = user;
                showWeatherApp();
            }, 500);
        } else {
            loginError.textContent = '❌ Invalid username or password.';
        }
    } else {
        // SIGNUP
        if (users[user]) {
            loginError.textContent = '❌ Username already exists.';
            return;
        }
        users[user] = pass;
        saveUsers(users);
        loginSuccess.textContent = '✅ Account created successfully! Please sign in.';
        // Clear fields and switch to login mode
        loginUser.value = '';
        loginPass.value = '';
        setTimeout(() => {
            if (!isLoginMode) toggleAuthMode();
        }, 1000);
    }
}

function showWeatherApp() {
    loginSection.classList.add('hidden');
    weatherSection.classList.remove('hidden');
    displayUser.textContent = currentUser;
    renderFavorites();
    weatherDisplay.innerHTML = `<div style="color:rgba(255,255,255,0.3); font-size:0.95rem;">🌎 Search for a city to see weather</div>`;
    currentCity = null;
    weatherData = null;
}

function logout() {
    currentUser = null;
    weatherSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginUser.value = '';
    loginPass.value = '';
    loginError.textContent = '';
    loginSuccess.textContent = '';
    weatherDisplay.innerHTML = `<div style="color:rgba(255,255,255,0.3); font-size:0.95rem;">🌎 Search for a city to see weather</div>`;
}

// ---------- event listeners ----------
loginBtn.addEventListener('click', handleAuth);

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});

loginUser.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuth(); });
loginPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuth(); });

logoutBtn.addEventListener('click', logout);

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

saveFavBtn.addEventListener('click', saveFavorite);

// ---------- init ----------
console.log('🌤️ Weather App ready — login to start.');