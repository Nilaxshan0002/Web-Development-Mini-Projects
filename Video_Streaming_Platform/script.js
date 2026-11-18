(function() {
  "use strict";

  // ===== DATA =====
  const trendingVideos = [
    { title: "The Art of Code", channel: "DevCraft", views: "1.2M", time: "12:34", thumb: "https://picsum.photos/seed/code1/400/300", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Deep Space Walk", channel: "CosmoVibes", views: "845K", time: "8:21", thumb: "https://picsum.photos/seed/space1/400/300", src: "https://www.w3schools.com/html/movie.mp4" },
    { title: "Urban Symphony", channel: "City Beats", views: "2.1M", time: "5:47", thumb: "https://picsum.photos/seed/urban1/400/300", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Mindful Moments", channel: "ZenFlow", views: "623K", time: "15:02", thumb: "https://picsum.photos/seed/mind1/400/300", src: "https://www.w3schools.com/html/movie.mp4" },
    { title: "Retro Wave", channel: "Synth Nation", views: "1.8M", time: "4:12", thumb: "https://picsum.photos/seed/retro1/400/300", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Wilderness Tales", channel: "NatureLens", views: "976K", time: "9:55", thumb: "https://picsum.photos/seed/wild1/400/300", src: "https://www.w3schools.com/html/movie.mp4" },
  ];

  const playlistData = [
    { name: "Chill beats", icon: "fa-music", thumb: "https://picsum.photos/seed/chill/400/300", video: { title: "Lo-fi Study Session", channel: "Chillhop Records", src: "https://www.w3schools.com/html/mov_bbb.mp4" } },
    { name: "Tech talks", icon: "fa-microchip", thumb: "https://picsum.photos/seed/tech/400/300", video: { title: "AI Revolution 2026", channel: "TechCrunch", src: "https://www.w3schools.com/html/movie.mp4" } },
    { name: "Nature docs", icon: "fa-tree", thumb: "https://picsum.photos/seed/nature/400/300", video: { title: "Planet Earth: Forests", channel: "BBC Earth", src: "https://www.w3schools.com/html/mov_bbb.mp4" } },
    { name: "Indie films", icon: "fa-film", thumb: "https://picsum.photos/seed/indie/400/300", video: { title: "The Last Stop", channel: "IndieFlix", src: "https://www.w3schools.com/html/movie.mp4" } },
    { name: "Live sessions", icon: "fa-microphone", thumb: "https://picsum.photos/seed/live/400/300", video: { title: "Studio Live: Jazz Night", channel: "LiveMusic", src: "https://www.w3schools.com/html/mov_bbb.mp4" } },
  ];

  const shortsData = [
    { title: "Daily Vlog #1", channel: "@vloggerlife", duration: "0:45", thumb: "https://picsum.photos/seed/vlog1/400/400", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Quick Recipe", channel: "@chefquick", duration: "0:32", thumb: "https://picsum.photos/seed/recipe1/400/400", src: "https://www.w3schools.com/html/movie.mp4" },
    { title: "Cat Compilation", channel: "@petsworld", duration: "0:58", thumb: "https://picsum.photos/seed/cats1/400/400", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Epic Fail", channel: "@failarmy", duration: "0:21", thumb: "https://picsum.photos/seed/fail1/400/400", src: "https://www.w3schools.com/html/movie.mp4" },
    { title: "Dance Moves", channel: "@dancestudio", duration: "0:39", thumb: "https://picsum.photos/seed/dance1/400/400", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Life Hacks", channel: "@hackmaster", duration: "0:27", thumb: "https://picsum.photos/seed/hack1/400/400", src: "https://www.w3schools.com/html/movie.mp4" },
  ];

  // ===== DOM REFS =====
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalChannel = document.getElementById('modalChannel');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // ===== NAVIGATION =====
  const navLinks = document.querySelectorAll('.nav-links a');
  const pages = {
    home: document.getElementById('page-home'),
    explore: document.getElementById('page-explore'),
    shorts: document.getElementById('page-shorts'),
    subscriptions: document.getElementById('page-subscriptions'),
    library: document.getElementById('page-library'),
  };

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.dataset.page;
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      Object.keys(pages).forEach(key => {
        pages[key].classList.toggle('active', key === page);
      });
    });
  });

  // ===== RENDER FUNCTIONS =====
  function renderTrending() {
    const grid = document.getElementById('videoGrid');
    grid.innerHTML = '';
    trendingVideos.forEach((v, index) => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.dataset.index = index;
      card.innerHTML = `
        <div class="video-thumb"><img src="${v.thumb}" alt="${v.title}" loading="lazy" /><span class="duration">${v.time}</span><div class="play-icon-overlay"><i class="fas fa-play-circle"></i></div></div>
        <div class="video-info"><h4>${v.title}</h4><div class="channel"><i class="fas fa-check-circle"></i> ${v.channel}</div><div class="video-meta"><span>${v.views} views</span><span><i class="far fa-heart"></i> · 2d ago</span></div></div>
      `;
      grid.appendChild(card);
    });
  }

  function renderPlaylists() {
    const row = document.getElementById('playlistRow');
    row.innerHTML = '';
    playlistData.forEach((p, idx) => {
      const item = document.createElement('div');
      item.className = 'playlist-item';
      item.dataset.playlistIndex = idx;
      item.innerHTML = `
        <div class="thumb">
          <img src="${p.thumb}" alt="${p.name}" loading="lazy" />
          <div class="play-icon"><i class="fas fa-play-circle"></i></div>
          <div class="bg-icon"><i class="fas ${p.icon}"></i></div>
        </div>
        <p>${p.name}</p>
      `;
      row.appendChild(item);
    });
  }

  function renderShorts() {
    const grid = document.getElementById('shortsGrid');
    grid.innerHTML = '';
    shortsData.forEach((s, index) => {
      const card = document.createElement('div');
      card.className = 'short-card';
      card.dataset.index = index;
      card.innerHTML = `
        <div class="short-thumb"><img src="${s.thumb}" alt="${s.title}" loading="lazy" /><div class="play-icon"><i class="fas fa-play-circle"></i></div><span class="duration">${s.duration}</span></div>
        <div class="short-info"><h4>${s.title}</h4><div class="channel">${s.channel}</div></div>
      `;
      grid.appendChild(card);
    });
  }

  // ===== MODAL CONTROLS =====
  function playVideo(title, channel, src) {
    modalTitle.textContent = title;
    modalChannel.textContent = channel;
    modalVideo.src = src;
    modalVideo.load();
    modal.classList.add('active');
    modalVideo.play().catch(e => console.log('Autoplay blocked:', e));
  }

  function closeModal() {
    modal.classList.remove('active');
    modalVideo.pause();
    modalVideo.src = '';
  }

  // ===== EVENT LISTENERS =====
  // Trending cards
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.video-card');
    if (card) {
      const index = parseInt(card.dataset.index);
      const video = trendingVideos[index];
      if (video) playVideo(video.title, video.channel, video.src);
    }
  });

  // Playlist items
  document.addEventListener('click', function(e) {
    const item = e.target.closest('.playlist-item');
    if (item) {
      const idx = parseInt(item.dataset.playlistIndex);
      const p = playlistData[idx];
      if (p) playVideo(p.video.title, p.video.channel, p.video.src);
    }
  });

  // Shorts
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.short-card');
    if (card) {
      const index = parseInt(card.dataset.index);
      const s = shortsData[index];
      if (s) playVideo(s.title, s.channel, s.src);
    }
  });

  // Hero
  document.getElementById('heroPlayOverlay').addEventListener('click', function() {
    playVideo('Beyond the Horizon', 'StreamVibe Originals', 'https://www.w3schools.com/html/mov_bbb.mp4');
  });
  document.getElementById('heroWatchBtn').addEventListener('click', function() {
    playVideo('Beyond the Horizon', 'StreamVibe Originals', 'https://www.w3schools.com/html/mov_bbb.mp4');
  });
  document.getElementById('heroSaveBtn').addEventListener('click', function() {
    alert('✅ Saved to your library!');
  });

  // Modal
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

  // Nav actions
  document.getElementById('searchBtn').addEventListener('click', function() {
    const query = prompt('🔍 Enter your search query:');
    if (query) alert(`Searching for: "${query}"`);
  });
  document.getElementById('notifBtn').addEventListener('click', function() {
    alert('🔔 You have 3 new notifications');
  });
  document.getElementById('avatarBtn').addEventListener('click', function() {
    alert('👤 Profile: John Doe\n📧 john.doe@email.com');
  });
  document.getElementById('logoBtn').addEventListener('click', function() {
    document.querySelector('.nav-links a[data-page="home"]').click();
  });

  // Section buttons
  document.getElementById('viewAllBtn').addEventListener('click', function(e) {
    e.preventDefault();
    alert('📺 Showing all trending videos');
  });
  document.getElementById('morePlaylistsBtn').addEventListener('click', function(e) {
    e.preventDefault();
    alert('📂 View all playlists');
  });

  // Footer links
  document.getElementById('privacyLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('🔒 Privacy Policy\n\nWe value your privacy. No personal data is stored or shared with third parties.');
  });
  document.getElementById('termsLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('📜 Terms of Service\n\n1. Use StreamVibe responsibly.\n2. Respect content creators.\n3. No unauthorized distribution.');
  });
  document.getElementById('helpLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('❓ Help Center\n\n📧 Email: support@streamvibe.com\n💬 Live Chat: Available 24/7\n📞 Phone: +1 (800) 555-0123');
  });

  // ===== INIT =====
  renderTrending();
  renderPlaylists();
  renderShorts();

})();