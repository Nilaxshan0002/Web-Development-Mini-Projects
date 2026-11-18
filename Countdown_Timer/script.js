(function() {
  "use strict";

  // ----- DOM refs -----
  const eventTitleInput = document.getElementById('eventTitle');
  const dateInput = document.getElementById('targetDate');
  const timeInput = document.getElementById('targetTime');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const nowBtn = document.getElementById('nowBtn');

  const daysEl = document.getElementById('daysDisplay');
  const hoursEl = document.getElementById('hoursDisplay');
  const minutesEl = document.getElementById('minutesDisplay');
  const secondsEl = document.getElementById('secondsDisplay');
  const statusMsg = document.getElementById('statusMsg');

  // ----- state -----
  let countdownInterval = null;
  let targetTimestamp = null;
  let isRunning = false;

  // ----- helpers -----
  function formatTwoDigits(num) {
    return String(Math.floor(Math.max(0, num))).padStart(2, '0');
  }

  function formatTimeUnit(value) {
    return String(Math.floor(Math.max(0, value))).padStart(2, '0');
  }

  // ----- update DOM with distance (ms) -----
  function updateDisplay(distanceMs) {
    if (distanceMs <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      statusMsg.textContent = '🎯 Countdown reached!';
      return;
    }

    const seconds = Math.floor(distanceMs / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    daysEl.textContent = formatTimeUnit(days);
    hoursEl.textContent = formatTimeUnit(hours);
    minutesEl.textContent = formatTimeUnit(minutes);
    secondsEl.textContent = formatTimeUnit(secs);

    const title = eventTitleInput.value.trim() || 'Countdown';
    if (days > 0) {
      statusMsg.textContent = `⏳ ${title} · ${days}d ${hours}h ${minutes}m ${secs}s remaining`;
    } else if (hours > 0) {
      statusMsg.textContent = `⏳ ${title} · ${hours}h ${minutes}m ${secs}s left`;
    } else if (minutes > 0) {
      statusMsg.textContent = `⏳ ${title} · ${minutes}m ${secs}s left`;
    } else {
      statusMsg.textContent = `⏳ ${title} · ${secs}s left`;
    }
  }

  // ----- tick -----
  function tick() {
    if (!targetTimestamp) {
      stopCountdown();
      statusMsg.textContent = '⚠️ no target date set';
      return;
    }
    const now = Date.now();
    const distance = targetTimestamp - now;
    if (distance <= 0) {
      updateDisplay(0);
      stopCountdown();
      statusMsg.textContent = `🎉 ${eventTitleInput.value.trim() || 'Countdown'} reached!`;
      return;
    }
    updateDisplay(distance);
  }

  // ----- stop interval -----
  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    isRunning = false;
    startBtn.textContent = '▶ Start';
    startBtn.disabled = false;
  }

  // ----- start countdown -----
  function startCountdown() {
    const dateVal = dateInput.value;
    const timeVal = timeInput.value;

    if (!dateVal) {
      statusMsg.textContent = '❌ please select a date';
      return;
    }

    let targetStr = dateVal;
    if (timeVal) {
      targetStr += `T${timeVal}`;
    } else {
      targetStr += 'T00:00:00';
    }

    const targetDate = new Date(targetStr);
    if (isNaN(targetDate.getTime())) {
      statusMsg.textContent = '⚠️ invalid date/time';
      return;
    }

    const now = Date.now();
    const targetMs = targetDate.getTime();
    targetTimestamp = targetMs;

    // stop any previous
    stopCountdown();

    if (targetMs <= now) {
      updateDisplay(0);
      statusMsg.textContent = `⏳ ${eventTitleInput.value.trim() || 'Countdown'} · time is up!`;
      isRunning = false;
      startBtn.textContent = '▶ Start';
      startBtn.disabled = false;
      return;
    }

    // start
    updateDisplay(targetMs - now);
    countdownInterval = setInterval(tick, 1000);
    isRunning = true;
    startBtn.textContent = '⏳ Running';
    startBtn.disabled = true;
    statusMsg.textContent = `▶️ counting down to ${targetDate.toLocaleString()}`;
  }

  // ----- reset display -----
  function resetDisplay() {
    stopCountdown();
    targetTimestamp = null;
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    statusMsg.textContent = '⏱️ set target & press Start';
    isRunning = false;
    startBtn.textContent = '▶ Start';
    startBtn.disabled = false;
  }

  // ----- set default to tomorrow 00:00 -----
  function setDefaultDateTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
    timeInput.value = '00:00';
  }

  // ----- set target to now + 1 hour (quick) -----
  function setNowPlusHour() {
    const now = new Date();
    const target = new Date(now.getTime() + 60 * 60 * 1000);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const mins = String(target.getMinutes()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
    timeInput.value = `${hours}:${mins}`;
    // auto-start
    startCountdown();
  }

  // ----- event listeners -----
  startBtn.addEventListener('click', startCountdown);
  resetBtn.addEventListener('click', resetDisplay);
  nowBtn.addEventListener('click', setNowPlusHour);

  // Enter key on inputs triggers start
  document.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        startCountdown();
      }
    });
  });

  // if date/time changes while running → stop (graceful)
  dateInput.addEventListener('change', () => {
    if (isRunning) {
      stopCountdown();
      resetDisplay();
      statusMsg.textContent = '⏸️ target changed · press Start again';
    }
  });
  timeInput.addEventListener('change', () => {
    if (isRunning) {
      stopCountdown();
      resetDisplay();
      statusMsg.textContent = '⏸️ target changed · press Start again';
    }
  });

  // ----- init -----
  setDefaultDateTime();
  if (!eventTitleInput.value.trim()) {
    eventTitleInput.value = 'Launch 🚀';
  }
  statusMsg.textContent = '⏱️ set target & press Start';
  resetDisplay();

  // cleanup
  window.addEventListener('beforeunload', () => {
    stopCountdown();
  });

  console.log('✅ Countdown Timer · professional edition');
})();