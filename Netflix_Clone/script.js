(function() {
  // ========== TOAST SYSTEM ==========
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer;

  function showToast(message, icon = 'fa-check-circle') {
    clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // ========== SIGN IN MODAL ==========
  const signinBtn = document.getElementById('signinBtn');
  const modalOverlay = document.getElementById('signinModal');
  const modalClose = document.getElementById('modalClose');
  const modalSignInBtn = document.getElementById('modalSignInBtn');
  const modalEmail = document.getElementById('modalEmail');
  const modalPassword = document.getElementById('modalPassword');

  if (signinBtn) {
    signinBtn.addEventListener('click', function() {
      modalOverlay.classList.add('active');
      modalEmail.value = '';
      modalPassword.value = '';
      modalEmail.focus();
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
    }
  });

  if (modalSignInBtn) {
    modalSignInBtn.addEventListener('click', function() {
      const email = modalEmail.value.trim();
      const password = modalPassword.value.trim();

      if (email === '' || password === '') {
        showToast('Please fill in all fields', 'fa-exclamation-circle');
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        showToast('Please enter a valid email', 'fa-exclamation-circle');
        return;
      }
      if (password.length < 4) {
        showToast('Password must be at least 4 characters', 'fa-exclamation-circle');
        return;
      }

      showToast(`Welcome back, ${email.split('@')[0]}! 🎬`, 'fa-user-check');
      modalOverlay.classList.remove('active');
      if (signinBtn) {
        signinBtn.textContent = '👤 Account';
        signinBtn.style.background = '#2d8a4e';
        setTimeout(() => {
          signinBtn.textContent = 'Sign In';
          signinBtn.style.background = '';
        }, 5000);
      }
    });
  }

  if (modalEmail) {
    modalEmail.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && modalPassword) modalPassword.focus();
    });
  }
  if (modalPassword) {
    modalPassword.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && modalSignInBtn) modalSignInBtn.click();
    });
  }

  // ========== GET STARTED BUTTON (only on home page) ==========
  const getStartedBtn = document.getElementById('getStartedBtn');
  const emailInput = document.getElementById('emailInput');

  if (getStartedBtn && emailInput) {
    getStartedBtn.addEventListener('click', function() {
      const email = emailInput.value.trim();
      if (email === '') {
        showToast('Please enter your email address', 'fa-exclamation-circle');
        emailInput.focus();
        emailInput.style.borderColor = '#e50914';
        setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        showToast('Please enter a valid email address', 'fa-exclamation-circle');
        emailInput.focus();
        emailInput.style.borderColor = '#e50914';
        setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
        return;
      }
      showToast(`Welcome! We'll send updates to ${email}`, 'fa-envelope');
      emailInput.value = '';
    });

    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        getStartedBtn.click();
      }
    });
  }

  // ========== MOVIE CARD CLICK (demo) ==========
  document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', function() {
      const title = this.querySelector('.movie-info h4')?.textContent || 'Movie';
      showToast(`🎥 Playing: ${title}`, 'fa-play');
    });
  });

  console.log('🎬 Netflix Clone · Ready to stream!');
})();