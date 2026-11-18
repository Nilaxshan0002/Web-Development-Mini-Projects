// ===== script.js =====

(function() {
    'use strict';

    // ----- DOM refs -----
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const millisecondsEl = document.getElementById('milliseconds');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const lapBtn = document.getElementById('lapBtn');
    const lapList = document.getElementById('lapList');
    const lapCount = document.getElementById('lapCount');
    const clearLapsBtn = document.getElementById('clearLapsBtn');
    const appContainer = document.getElementById('appContainer');

    // ----- State -----
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let isRunning = false;
    let laps = [];

    // ----- helpers: format time -----
    function formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSec / 60);
        const seconds = totalSec % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);
        return {
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
            milliseconds: String(milliseconds).padStart(2, '0')
        };
    }

    // ----- update display from elapsedTime -----
    function updateDisplay(ms) {
        const { minutes, seconds, milliseconds } = formatTime(ms);
        minutesEl.textContent = minutes;
        secondsEl.textContent = seconds;
        millisecondsEl.textContent = milliseconds;
    }

    // ----- render lap list -----
    function renderLaps() {
        lapList.innerHTML = '';

        if (laps.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-lap-message';
            emptyMsg.textContent = 'No laps recorded';
            lapList.appendChild(emptyMsg);
            lapCount.textContent = '0';
            return;
        }

        const reversed = [...laps].reverse();
        for (let i = 0; i < reversed.length; i++) {
            const lapMs = reversed[i];
            const { minutes, seconds, milliseconds } = formatTime(lapMs);
            const li = document.createElement('li');
            li.className = 'lap-item';
            const lapNumber = laps.length - i;
            li.innerHTML = `
                <span><span class="lap-num">#${lapNumber}</span> <span style="color:#9eb3e8;">Lap</span></span>
                <span class="lap-time">${minutes}:${seconds}.${milliseconds}</span>
            `;
            lapList.appendChild(li);
        }

        lapCount.textContent = laps.length;
    }

    // ----- core timer tick -----
    function tick() {
        if (!isRunning) return;
        const now = performance.now();
        const delta = now - startTime;
        const total = elapsedTime + delta;
        updateDisplay(total);
    }

    // ----- start stopwatch -----
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        appContainer.classList.add('running');
        startTime = performance.now();
        timerInterval = setInterval(tick, 20);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        lapBtn.disabled = false;
    }

    // ----- pause stopwatch -----
    function pauseTimer() {
        if (!isRunning) return;
        const now = performance.now();
        const delta = now - startTime;
        elapsedTime += delta;
        isRunning = false;
        appContainer.classList.remove('running');
        clearInterval(timerInterval);
        timerInterval = null;
        updateDisplay(elapsedTime);

        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    // ----- reset stopwatch -----
    function resetTimer() {
        if (isRunning) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
            appContainer.classList.remove('running');
        }
        elapsedTime = 0;
        startTime = 0;
        updateDisplay(0);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lapBtn.disabled = true;
        renderLaps();
    }

    // ----- record lap -----
    function recordLap() {
        let currentMs = 0;
        if (isRunning) {
            const now = performance.now();
            const delta = now - startTime;
            currentMs = elapsedTime + delta;
        } else {
            currentMs = elapsedTime;
        }

        if (currentMs <= 0) return;

        laps.push(currentMs);
        renderLaps();
    }

    // ----- clear all laps -----
    function clearLaps() {
        laps = [];
        renderLaps();
        if (!isRunning && elapsedTime === 0) {
            lapBtn.disabled = true;
        } else {
            lapBtn.disabled = false;
        }
    }

    // ----- sync lap button state -----
    function updateLapButtonState() {
        if (isRunning) {
            lapBtn.disabled = false;
            return;
        }
        lapBtn.disabled = (elapsedTime <= 0);
    }

    // ----- reset full -----
    function fullReset() {
        resetTimer();
        clearLaps();
        lapBtn.disabled = true;
        updateDisplay(0);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    // ----- init event listeners -----
    function init() {
        updateDisplay(0);
        renderLaps();
        lapBtn.disabled = true;
        pauseBtn.disabled = true;

        startBtn.addEventListener('click', startTimer);
        pauseBtn.addEventListener('click', pauseTimer);
        resetBtn.addEventListener('click', fullReset);
        lapBtn.addEventListener('click', recordLap);
        clearLapsBtn.addEventListener('click', clearLaps);
    }

    // call init
    init();
})();