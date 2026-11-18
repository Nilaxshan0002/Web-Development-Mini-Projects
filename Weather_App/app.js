// ===== MAIN APPLICATION =====
(function() {
  // DOM refs
  const cityNameEl = document.getElementById('cityName');
  const countryNameEl = document.getElementById('countryName');
  const timeDisplayEl = document.getElementById('timeDisplay');
  const dateDisplayEl = document.getElementById('dateDisplay');
  const tempValueEl = document.getElementById('tempValue');
  const feelsLikeEl = document.getElementById('feelsLike');
  const weatherDescEl = document.getElementById('weatherDesc');
  const conditionIconEl = document.getElementById('conditionIcon');
  const forecastGrid = document.getElementById('forecastGrid');
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const errorContainer = document.getElementById('errorContainer');
  const downloadBtn = document.getElementById('downloadBtn');

  // ===== DOWNLOAD FUNCTIONALITY =====
  function handleDownload() {
    // Show toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(252, 211, 77, 0.95);
      color: #0b1a2e;
      padding: 12px 28px;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideUp 0.4s ease;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
    `;
    toast.innerHTML = `
      <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
      Download started! WeatherWise app is being prepared.
    `;

    // Add animation keyframes if not exists
    if (!document.getElementById('toastStyles')) {
      const style = document.createElement('style');
      style.id = 'toastStyles';
      style.textContent = `
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.4s ease forwards';
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 400);
    }, 3000);

    console.log('Download App clicked!');
    
    // You can replace this with actual app store links:
    // window.location.href = 'https://play.google.com/store/apps/details?id=your.app.id';
    // or for iOS: window.location.href = 'https://apps.apple.com/app/your-app-id';
    
    // Show second notification
    setTimeout(() => {
      const secondToast = document.createElement('div');
      secondToast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.10);
        backdrop-filter: blur(12px);
        color: #f0f8ff;
        padding: 10px 24px;
        border-radius: 40px;
        font-size: 0.8rem;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        z-index: 9998;
        border: 1px solid rgba(255,255,255,0.06);
        animation: slideUp 0.4s ease;
      `;
      secondToast.innerHTML = `
        <i class="fas fa-cloud-sun" style="margin-right: 8px; color: #fcd34d;"></i>
        WeatherWise is now available in your app store!
      `;
      document.body.appendChild(secondToast);
      setTimeout(() => {
        secondToast.style.animation = 'fadeOut 0.4s ease forwards';
        setTimeout(() => {
          if (secondToast.parentNode) secondToast.remove();
        }, 400);
      }, 3000);
    }, 1000);
  }

  // Attach download handler
  downloadBtn.addEventListener('click', handleDownload);

  // ===== WEATHER HELPERS =====
  function formatDate(ts) {
    const d = new Date(ts * 1000);
    const m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function formatTime(ts) {
    const d = new Date(ts * 1000);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function getDayName(ts) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date(ts * 1000).getDay()];
  }

  function mapIcon(code) {
    const map = {
      '01d':'fa-sun','01n':'fa-moon',
      '02d':'fa-cloud-sun','02n':'fa-cloud-moon',
      '03d':'fa-cloud','03n':'fa-cloud',
      '04d':'fa-cloud','04n':'fa-cloud',
      '09d':'fa-cloud-rain','09n':'fa-cloud-rain',
      '10d':'fa-cloud-sun-rain','10n':'fa-cloud-moon-rain',
      '11d':'fa-bolt','11n':'fa-bolt',
      '13d':'fa-snowflake','13n':'fa-snowflake',
      '50d':'fa-smog','50n':'fa-smog'
    };
    return map[code] || 'fa-cloud';
  }

  function showError(msg) {
    errorContainer.innerHTML = `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i> ${msg}</div>`;
    setTimeout(() => { errorContainer.innerHTML = ''; }, 5000);
  }
  
  function clearError() { errorContainer.innerHTML = ''; }

  // ===== FETCH WEATHER =====
  async function fetchWeather(city) {
    if (!city || city.trim() === '') {
      showError('Please enter a city name.');
      return;
    }
    const trimmed = city.trim();
    document.getElementById('weatherDisplay').classList.add('loading');
    clearError();

    try {
      const currentRes = await fetch(`${BASE_URL}?q=${encodeURIComponent(trimmed)}&appid=${API_KEY}&units=metric`);
      if (!currentRes.ok) {
        if (currentRes.status === 404) throw new Error(`City "${trimmed}" not found.`);
        throw new Error(`API error: ${currentRes.status}`);
      }
      const currentData = await currentRes.json();

      const forecastRes = await fetch(`${FORECAST_URL}?q=${encodeURIComponent(trimmed)}&appid=${API_KEY}&units=metric`);
      if (!forecastRes.ok) throw new Error('Forecast unavailable.');
      const forecastData = await forecastRes.json();

      // ---- update UI ----
      const { name, sys, main, weather, dt } = currentData;
      cityNameEl.textContent = name;
      countryNameEl.textContent = sys.country;
      timeDisplayEl.textContent = formatTime(dt);
      dateDisplayEl.textContent = formatDate(dt);
      tempValueEl.textContent = Math.round(main.temp);
      feelsLikeEl.textContent = Math.round(main.feels_like);
      weatherDescEl.textContent = weather[0].description;
      conditionIconEl.className = `fas ${mapIcon(weather[0].icon)}`;

      // ---- forecast ----
      const dailyMap = new Map();
      forecastData.list.forEach(item => {
        const key = new Date(item.dt * 1000).toDateString();
        if (!dailyMap.has(key)) dailyMap.set(key, item);
      });

      let entries = Array.from(dailyMap.values());
      const today = new Date().toDateString();
      if (entries.length > 0 && new Date(entries[0].dt * 1000).toDateString() === today) {
        entries.shift();
      }
      entries = entries.slice(0, 5);
      while (entries.length < 5) entries.push(null);

      forecastGrid.innerHTML = '';
      entries.forEach(item => {
        const div = document.createElement('div');
        div.className = 'forecast-item';
        if (item) {
          div.innerHTML = `
            <div class="day">${getDayName(item.dt)}</div>
            <div class="forecast-icon"><i class="fas ${mapIcon(item.weather[0].icon)}"></i></div>
            <div class="forecast-temp">${Math.round(item.main.temp)}<small>°</small></div>
          `;
        } else {
          div.innerHTML = `<div class="day">---</div><div class="forecast-icon"><i class="fas fa-cloud"></i></div><div class="forecast-temp">--<small>°</small></div>`;
        }
        forecastGrid.appendChild(div);
      });

      document.getElementById('weatherDisplay').classList.remove('loading');

    } catch (err) {
      document.getElementById('weatherDisplay').classList.remove('loading');
      showError(err.message || 'Something went wrong.');
      cityNameEl.textContent = '--';
      countryNameEl.textContent = '--';
      timeDisplayEl.textContent = '--:--';
      dateDisplayEl.textContent = '---';
      tempValueEl.textContent = '--';
      feelsLikeEl.textContent = '--';
      weatherDescEl.textContent = 'Error';
      conditionIconEl.className = 'fas fa-exclamation-triangle';
      forecastGrid.innerHTML = '';
    }
  }

  // ===== EVENT HANDLERS =====
  function handleSearch() {
    const city = cityInput.value.trim();
    if (city === '') { showError('Enter a city name.'); return; }
    fetchWeather(city);
  }

  searchBtn.addEventListener('click', handleSearch);
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
  });

  // ===== INITIAL LOAD =====
  fetchWeather('New York');

})();