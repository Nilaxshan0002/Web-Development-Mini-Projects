(function() {
  "use strict";

  // ----- DOM refs -----
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const ampmEl = document.getElementById('ampm');
  const dateDisplay = document.getElementById('dateDisplay');
  const dayDisplay = document.getElementById('dayDisplay');
  const timezoneEl = document.getElementById('timezone');
  const formatButtons = document.querySelectorAll('.format-toggle button');
  const refreshBtn = document.getElementById('refreshBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // ----- state -----
  let currentFormat = '12'; // '12' or '24'
  let clockInterval = null;

  // ----- helpers -----
  function padZero(num) {
    return String(num).padStart(2, '0');
  }

  function getDayName(dayIndex) {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[dayIndex];
  }

  function getMonthName(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  }

  function getOrdinalSuffix(day) {
    if (day >= 11 && day <= 13) return 'th';
    const lastDigit = day % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  }

  // ----- update clock -----
  function updateClock() {
    const now = new Date();

    // Time
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = '';

    if (currentFormat === '12') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }

    hoursEl.textContent = padZero(hours);
    minutesEl.textContent = padZero(minutes);
    secondsEl.textContent = padZero(seconds);
    ampmEl.textContent = currentFormat === '12' ? ampm : '';

    // Date
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const dayName = getDayName(now.getDay());

    const ordinal = getOrdinalSuffix(day);
    dateDisplay.textContent = `${getMonthName(month)} ${day}${ordinal}, ${year}`;
    dayDisplay.textContent = dayName;

    // Timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    timezoneEl.textContent = tz.replace(/_/g, ' ');
  }

  // ----- start clock -----
  function startClock() {
    if (clockInterval) {
      clearInterval(clockInterval);
    }
    updateClock(); // immediate update
    clockInterval = setInterval(updateClock, 1000);
  }

  // ----- format toggle -----
  function setFormat(format) {
    currentFormat = format;
    formatButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.format === format);
    });
    updateClock();
  }

  // ----- refresh (resync) -----
  function refreshClock() {
    updateClock();
    // subtle visual feedback
    refreshBtn.style.opacity = '0.5';
    setTimeout(() => {
      refreshBtn.style.opacity = '1';
    }, 200);
  }

  // ----- fullscreen toggle -----
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.() ||
      document.documentElement.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.();
    }
  }

  // ----- event listeners -----
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setFormat(btn.dataset.format);
    });
  });

  refreshBtn.addEventListener('click', refreshClock);
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Keyboard shortcut: 'f' for fullscreen, 'r' for refresh
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    }
    if (e.key === 'r' || e.key === 'R') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        refreshClock();
      }
    }
    if (e.key === '1') {
      setFormat('12');
    }
    if (e.key === '2') {
      setFormat('24');
    }
  });

  // ----- init -----
  startClock();

  // set initial format from active button
  const activeBtn = document.querySelector('.format-toggle button.active');
  if (activeBtn) {
    currentFormat = activeBtn.dataset.format;
  }

  console.log('✅ Digital Clock');
  console.log('   ⌨️  1 = 12h  |  2 = 24h  |  r = refresh  |  f = fullscreen');
})();