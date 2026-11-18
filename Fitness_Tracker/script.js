(function() {
  "use strict";

  // ----- Data -----
  const workouts = [
    { name: "Morning Run", type: "Cardio", duration: "32 min", calories: 420, icon: "fa-running" },
    { name: "Upper Body", type: "Strength", duration: "45 min", calories: 380, icon: "fa-dumbbell" },
    { name: "Yoga Flow", type: "Flexibility", duration: "28 min", calories: 210, icon: "fa-pray" },
    { name: "HIIT Session", type: "Cardio", duration: "25 min", calories: 350, icon: "fa-bolt" },
    { name: "Evening Walk", type: "Cardio", duration: "20 min", calories: 180, icon: "fa-walking" }
  ];

  const meals = [
    { name: "Breakfast", items: "Oatmeal, berries, nuts", calories: 420, color: "#f5a623" },
    { name: "Lunch", items: "Grilled chicken salad", calories: 580, color: "#22a65e" },
    { name: "Snack", items: "Protein shake, banana", calories: 240, color: "#4f8ef7" },
    { name: "Dinner", items: "Salmon, quinoa, veggies", calories: 620, color: "#7aaffa" },
    { name: "Evening snack", items: "Almonds, dark chocolate", calories: 180, color: "#e67e22" }
  ];

  // ----- Render helpers -----
  function renderWorkouts(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    data.forEach(w => {
      const div = document.createElement('div');
      div.className = 'workout-item';
      div.innerHTML = `
        <div class="workout-info">
          <div class="workout-icon"><i class="fas ${w.icon}"></i></div>
          <div class="workout-details">
            <strong>${w.name}</strong>
            <div class="meta">${w.type} · ${w.duration}</div>
          </div>
        </div>
        <div class="workout-cal">${w.calories} cal</div>
      `;
      container.appendChild(div);
    });
  }

  function renderMeals(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    data.forEach(m => {
      const div = document.createElement('div');
      div.className = 'meal-item';
      div.innerHTML = `
        <div class="meal-info">
          <span class="meal-dot" style="background:${m.color};"></span>
          <div>
            <strong>${m.name}</strong>
            <div style="font-size:0.75rem; color:#6b7f9e;">${m.items}</div>
          </div>
        </div>
        <div class="meal-cal">${m.calories} cal</div>
      `;
      container.appendChild(div);
    });
  }

  // ----- Initialize dashboard lists -----
  renderWorkouts('workoutList', workouts.slice(0, 4));
  renderMeals('mealList', meals.slice(0, 4));
  renderWorkouts('workoutsFullList', workouts);
  renderMeals('mealsFullList', meals);

  // ----- Charts (only for dashboard) -----
  const activityCtx = document.getElementById('activityChart').getContext('2d');
  new Chart(activityCtx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Calories',
        data: [320, 450, 380, 520, 490, 610, 540],
        borderColor: '#4f8ef7',
        backgroundColor: 'rgba(79, 142, 247, 0.08)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#4f8ef7',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  const calorieCtx = document.getElementById('calorieChart').getContext('2d');
  new Chart(calorieCtx, {
    type: 'doughnut',
    data: {
      labels: ['Breakfast', 'Lunch', 'Snack', 'Dinner'],
      datasets: [{
        data: [420, 580, 240, 620],
        backgroundColor: ['#f5a623', '#22a65e', '#4f8ef7', '#7aaffa'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            padding: 8,
            font: { size: 10, weight: '500' },
            usePointStyle: true
          }
        }
      },
      cutout: '70%',
    }
  });

  // ----- Navigation: show/hide sections -----
  const sections = {
    dashboard: document.getElementById('section-dashboard'),
    workouts: document.getElementById('section-workouts'),
    nutrition: document.getElementById('section-nutrition'),
    progress: document.getElementById('section-progress'),
    achievements: document.getElementById('section-achievements'),
    settings: document.getElementById('section-settings'),
    privacy: document.getElementById('section-privacy'),
    terms: document.getElementById('section-terms'),
    support: document.getElementById('section-support')
  };

  // Hide all, then show the target
  function showSection(sectionId) {
    Object.values(sections).forEach(el => el.classList.remove('active'));
    if (sections[sectionId]) {
      sections[sectionId].classList.add('active');
    }
    // Update sidebar active class
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionId);
    });
  }

  // Sidebar clicks
  document.querySelectorAll('.nav-menu a[data-section]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      if (section) showSection(section);
    });
  });

  // Footer links (Privacy, Terms, Support)
  document.querySelectorAll('.footer-links a[data-section]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      if (section) showSection(section);
    });
  });

  // ----- Top-right interactions (alerts) -----
  document.getElementById('bellBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    alert('🔔 You have 3 new notifications!');
  });

  document.getElementById('calendarBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    alert('📅 Today\'s events:\n- 10:00 AM Yoga\n- 2:00 PM HIIT\n- 6:00 PM Protein shake');
  });

  document.getElementById('avatarBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    alert('👤 Profile: James Davis\nMember since 2024\nFitness Level: Advanced');
  });

  // Ensure dashboard is shown by default (already active)
})();