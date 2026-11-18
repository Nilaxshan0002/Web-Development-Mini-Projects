(function() {
  "use strict";

  // ----- DOM refs -----
  const passwordText = document.getElementById('passwordText');
  const copyBtn = document.getElementById('copyBtn');
  const generateBtn = document.getElementById('generateBtn');
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthValue = document.getElementById('lengthValue');
  const uppercaseCheck = document.getElementById('uppercase');
  const lowercaseCheck = document.getElementById('lowercase');
  const numbersCheck = document.getElementById('numbers');
  const symbolsCheck = document.getElementById('symbols');
  const strengthBar = document.getElementById('strengthBar');
  const toast = document.getElementById('toast');

  // ----- state -----
  let currentPassword = '';

  // ----- character sets -----
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // ----- helpers -----
  function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  function getCharacterSet() {
    let chars = '';
    if (uppercaseCheck.checked) chars += UPPERCASE;
    if (lowercaseCheck.checked) chars += LOWERCASE;
    if (numbersCheck.checked) chars += NUMBERS;
    if (symbolsCheck.checked) chars += SYMBOLS;
    return chars;
  }

  function getStrength(password) {
    let score = 0;
    const length = password.length;
    
    // Length score
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    
    // Character variety
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return Math.min(score, 5);
  }

  function getStrengthColor(score) {
    const colors = [
      '#f87171', // 0 - Very Weak
      '#fb923c', // 1 - Weak
      '#fbbf24', // 2 - Fair
      '#4ade80', // 3 - Good
      '#34d399', // 4 - Strong
      '#22d3ee'  // 5 - Very Strong
    ];
    return colors[score] || colors[0];
  }

  function getStrengthLabel(score) {
    const labels = [
      'Very Weak',
      'Weak',
      'Fair',
      'Good',
      'Strong',
      'Very Strong'
    ];
    return labels[score] || 'Unknown';
  }

  // ----- generate password -----
  function generatePassword() {
    const length = parseInt(lengthSlider.value);
    const chars = getCharacterSet();
    
    if (!chars) {
      passwordText.textContent = 'Select at least one option!';
      passwordText.className = 'password-text';
      strengthBar.style.width = '0%';
      return '';
    }

    // Ensure at least one character from each selected set
    let password = '';
    const sets = [];
    if (uppercaseCheck.checked) sets.push(UPPERCASE);
    if (lowercaseCheck.checked) sets.push(LOWERCASE);
    if (numbersCheck.checked) sets.push(NUMBERS);
    if (symbolsCheck.checked) sets.push(SYMBOLS);

    // Add one character from each selected set
    for (const set of sets) {
      password += set[Math.floor(Math.random() * set.length)];
    }

    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    password = shuffleString(password);
    
    return password;
  }

  // ----- update password display -----
  function updatePassword() {
    const password = generatePassword();
    if (password) {
      currentPassword = password;
      passwordText.textContent = password;
      passwordText.className = 'password-text';
      
      // Update strength
      const strength = getStrength(password);
      const percentage = (strength / 5) * 100;
      strengthBar.style.width = `${percentage}%`;
      strengthBar.style.background = getStrengthColor(strength);
      
      // Update copy button
      copyBtn.textContent = '📋 Copy';
      copyBtn.classList.remove('copied');
    }
  }

  // ----- copy password -----
  function copyPassword() {
    if (!currentPassword) {
      showToast('⚠️ Generate a password first!');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentPassword).then(() => {
        showToast('✅ Password copied!');
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    const textarea = document.createElement('textarea');
    textarea.value = currentPassword;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('✅ Password copied!');
      copyBtn.textContent = '✅ Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      showToast('❌ Failed to copy');
    }
    document.body.removeChild(textarea);
  }

  // ----- toast -----
  let toastTimeout = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // ----- event listeners -----
  generateBtn.addEventListener('click', updatePassword);
  
  copyBtn.addEventListener('click', copyPassword);

  lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
    updatePassword();
  });

  // Update password when checkboxes change
  [uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck].forEach(checkbox => {
    checkbox.addEventListener('change', updatePassword);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Space') {
      if (e.target === document.body) {
        e.preventDefault();
        updatePassword();
      }
    }
    if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
      if (e.target === document.body) {
        e.preventDefault();
        copyPassword();
      }
    }
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
      updatePassword();
    }
  });

  // ----- init -----
  updatePassword();

  console.log('✅ Password Generator');
  console.log('   ⌨️  Space = generate  |  c = copy  |  Enter = generate');
  console.log('   🔐 Generating secure passwords with custom options');

})();