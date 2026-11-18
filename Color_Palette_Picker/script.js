(function() {
  "use strict";

  // ----- DOM refs -----
  const paletteContainer = document.getElementById('paletteContainer');
  const generateBtn = document.getElementById('generateBtn');
  const lockAllBtn = document.getElementById('lockAllBtn');
  const unlockAllBtn = document.getElementById('unlockAllBtn');
  const toast = document.getElementById('toast');

  // ----- state -----
  let colors = [];
  let locked = [];
  const PALETTE_SIZE = 5;

  // ----- helpers -----
  function generateRandomColor() {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    return hex;
  }

  function getContrastColor(hex) {
    // Remove # if present
    const color = hex.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
  }

  function getTextColorForInfo(hex) {
    // For the info badge background
    const color = hex.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
  }

  // ----- generate palette -----
  function generatePalette() {
    for (let i = 0; i < PALETTE_SIZE; i++) {
      if (!locked[i]) {
        colors[i] = generateRandomColor();
      }
    }
    renderPalette();
  }

  // ----- render palette -----
  function renderPalette() {
    paletteContainer.innerHTML = '';
    
    for (let i = 0; i < PALETTE_SIZE; i++) {
      const color = colors[i] || '#2a2a4a';
      const isLocked = locked[i] || false;
      
      const colorItem = document.createElement('div');
      colorItem.className = 'color-item';
      colorItem.dataset.index = i;
      
      // Color preview
      const preview = document.createElement('div');
      preview.className = 'color-preview';
      preview.style.background = color;
      
      // Lock icon
      const lockIcon = document.createElement('span');
      lockIcon.className = `lock-icon${isLocked ? ' locked' : ''}`;
      lockIcon.textContent = isLocked ? '🔒' : '🔓';
      lockIcon.title = isLocked ? 'Unlock this color' : 'Lock this color';
      lockIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLock(i);
      });
      
      // Copy feedback
      const feedback = document.createElement('div');
      feedback.className = 'copy-feedback';
      feedback.textContent = '✅ Copied!';
      
      // Color info (hex code)
      const info = document.createElement('span');
      info.className = 'color-info';
      info.textContent = color.toUpperCase();
      info.style.background = `rgba(0,0,0,0.6)`;
      info.style.color = getContrastColor(color);
      
      // Click to copy
      colorItem.addEventListener('click', () => {
        copyColor(color, feedback);
      });
      
      colorItem.appendChild(preview);
      colorItem.appendChild(lockIcon);
      colorItem.appendChild(feedback);
      colorItem.appendChild(info);
      
      paletteContainer.appendChild(colorItem);
    }
  }

  // ----- toggle lock -----
  function toggleLock(index) {
    locked[index] = !locked[index];
    renderPalette();
    showToast(locked[index] ? '🔒 Color locked' : '🔓 Color unlocked');
  }

  // ----- lock all -----
  function lockAll() {
    for (let i = 0; i < PALETTE_SIZE; i++) {
      locked[i] = true;
    }
    renderPalette();
    showToast('🔒 All colors locked');
  }

  // ----- unlock all -----
  function unlockAll() {
    for (let i = 0; i < PALETTE_SIZE; i++) {
      locked[i] = false;
    }
    renderPalette();
    showToast('🔓 All colors unlocked');
  }

  // ----- copy color -----
  function copyColor(color, feedbackElement) {
    const text = color.toUpperCase();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(feedbackElement);
        showToast(`✅ ${text} copied!`);
      }).catch(() => {
        fallbackCopy(text, feedbackElement);
      });
    } else {
      fallbackCopy(text, feedbackElement);
    }
  }

  function fallbackCopy(text, feedbackElement) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback(feedbackElement);
      showToast(`✅ ${text} copied!`);
    } catch (err) {
      showToast('❌ Failed to copy');
    }
    document.body.removeChild(textarea);
  }

  function showCopyFeedback(element) {
    element.classList.add('show');
    setTimeout(() => {
      element.classList.remove('show');
    }, 1500);
  }

  // ----- toast -----
  let toastTimeout = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ----- keyboard shortcuts -----
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      generatePalette();
    }
    if (e.key === 'l' || e.key === 'L') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        lockAll();
      }
    }
    if (e.key === 'u' || e.key === 'U') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        unlockAll();
      }
    }
  });

  // ----- event listeners -----
  generateBtn.addEventListener('click', generatePalette);
  lockAllBtn.addEventListener('click', lockAll);
  unlockAllBtn.addEventListener('click', unlockAll);

  // ----- init -----
  // Initialize with random colors
  for (let i = 0; i < PALETTE_SIZE; i++) {
    colors[i] = generateRandomColor();
    locked[i] = false;
  }
  renderPalette();

  console.log('✅ Color Palette Picker');
  console.log('   ⌨️  Space = generate  |  l = lock all  |  u = unlock all');
  console.log('   🎨 Click any color to copy hex code');
})();