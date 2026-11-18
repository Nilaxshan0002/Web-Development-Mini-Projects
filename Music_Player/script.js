(function() {
  "use strict";

  // ----- Extended songs data (15 songs) -----
  const songs = [
    {
      title: "Night Drive",
      artist: "Code Beats",
      duration: 214,
      color: "#4b7cf7",
      genre: "Electronic"
    },
    {
      title: "Midnight Echo",
      artist: "Synth Wave",
      duration: 187,
      color: "#8B5CF6",
      genre: "Synthwave"
    },
    {
      title: "Urban Flow",
      artist: "City Lights",
      duration: 203,
      color: "#06B6D4",
      genre: "Lo-Fi"
    },
    {
      title: "Golden Hour",
      artist: "Sunset Collective",
      duration: 176,
      color: "#F59E0B",
      genre: "Chill"
    },
    {
      title: "Deep Blue",
      artist: "Ocean Drive",
      duration: 195,
      color: "#10B981",
      genre: "Ambient"
    },
    {
      title: "Neon Dreams",
      artist: "Pixel Wave",
      duration: 221,
      color: "#EC4899",
      genre: "Synthwave"
    },
    {
      title: "Mountain High",
      artist: "Alpine Echo",
      duration: 208,
      color: "#34D399",
      genre: "Acoustic"
    },
    {
      title: "City Rain",
      artist: "Metro Sounds",
      duration: 192,
      color: "#60A5FA",
      genre: "Lo-Fi"
    },
    {
      title: "Starlight",
      artist: "Cosmic Drift",
      duration: 245,
      color: "#A78BFA",
      genre: "Ambient"
    },
    {
      title: "Ocean Waves",
      artist: "Tidal Flow",
      duration: 178,
      color: "#2DD4BF",
      genre: "Chill"
    },
    {
      title: "Electric Soul",
      artist: "Voltage",
      duration: 210,
      color: "#F472B6",
      genre: "Electronic"
    },
    {
      title: "Desert Wind",
      artist: "Nomad Sounds",
      duration: 196,
      color: "#FB923C",
      genre: "Acoustic"
    },
    {
      title: "Crystal Clear",
      artist: "Pure Tone",
      duration: 183,
      color: "#22D3EE",
      genre: "Ambient"
    },
    {
      title: "Midnight Groove",
      artist: "Night Shift",
      duration: 230,
      color: "#818CF8",
      genre: "Jazz"
    },
    {
      title: "Sunrise",
      artist: "Dawn Chorus",
      duration: 165,
      color: "#FCD34D",
      genre: "Chill"
    }
  ];

  // ----- DOM refs -----
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const volumeBar = document.getElementById('volumeBar');
  const volumeFill = document.getElementById('volumeFill');
  const volumeLevel = document.getElementById('volumeLevel');
  const volumeIcon = document.getElementById('volumeIcon');
  const songTitle = document.getElementById('songTitle');
  const songArtist = document.getElementById('songArtist');
  const albumArt = document.getElementById('albumArt');
  const artGradient = document.getElementById('artGradient');
  const artPlaceholder = document.getElementById('artPlaceholder');
  const playlist = document.getElementById('playlist');
  const playlistToggleBtn = document.getElementById('playlistToggleBtn');
  const toast = document.getElementById('toast');

  // ----- audio -----
  const audio = new Audio();
  audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  // ----- state -----
  let currentSongIndex = 0;
  let isPlaying = false;
  let isDragging = false;
  let volume = 0.8;
  let playlistOpen = false;
  let progressInterval = null;
  let shuffleMode = false;
  let repeatMode = false;
  let isFirstPlay = true;

  // ----- helpers -----
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getSongColor(index) {
    return songs[index]?.color || '#4b7cf7';
  }

  // ----- load song -----
  function loadSong(index, autoPlay = false) {
    const song = songs[index];
    if (!song) return;

    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    totalTimeEl.textContent = formatTime(song.duration);
    
    // Update album art color
    const color = song.color;
    artGradient.style.background = `radial-gradient(circle at center, ${color}44, transparent 70%)`;
    artPlaceholder.textContent = '🎵';
    artPlaceholder.style.color = color;
    artPlaceholder.style.opacity = '0.6';

    // Update playlist
    updatePlaylist();

    // Reset progress
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    
    // Load audio
    audio.currentTime = 0;
    
    // If currently playing or autoPlay requested, start playback
    if (isPlaying || autoPlay) {
      if (!isPlaying) {
        isPlaying = true;
        updatePlayButton();
      }
      audio.play().catch(() => {
        simulatePlayback();
      });
    }

    // Show toast
    showToast(`🎵 ${song.title} - ${song.artist}`);
  }

  // ----- play/pause -----
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    } else {
      audio.play().catch(() => {
        simulatePlayback();
      });
    }
    isPlaying = !isPlaying;
    updatePlayButton();
  }

  function updatePlayButton() {
    playBtn.textContent = isPlaying ? '⏸' : '▶';
  }

  // ----- simulate playback (for demo) -----
  function simulatePlayback() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (!isPlaying) return;

    const song = songs[currentSongIndex];
    let currentTime = parseFloat(currentTimeEl.textContent.split(':')[0]) * 60 + 
                     parseFloat(currentTimeEl.textContent.split(':')[1] || 0);
    
    progressInterval = setInterval(() => {
      if (!isPlaying || isDragging) return;
      
      currentTime += 0.1;
      if (currentTime >= song.duration) {
        currentTime = song.duration;
        handleSongEnd();
        return;
      }
      
      const progress = (currentTime / song.duration) * 100;
      progressFill.style.width = `${Math.min(progress, 100)}%`;
      currentTimeEl.textContent = formatTime(currentTime);
    }, 100);
  }

  // ----- handle song end -----
  function handleSongEnd() {
    if (repeatMode) {
      // Repeat current song
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      loadSong(currentSongIndex, true);
      showToast(`🔁 Repeating: ${songs[currentSongIndex].title}`);
    } else {
      // Auto-play next song
      nextSong();
    }
  }

  // ----- next/prev -----
  function nextSong() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    
    if (shuffleMode) {
      // Get random song different from current
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * songs.length);
      } while (newIndex === currentSongIndex && songs.length > 1);
      currentSongIndex = newIndex;
    } else {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
    }
    
    loadSong(currentSongIndex, isPlaying);
    if (isPlaying) {
      simulatePlayback();
    }
    showToast(`⏭ ${songs[currentSongIndex].title}`);
  }

  function prevSong() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    
    if (parseFloat(currentTimeEl.textContent.split(':')[0]) * 60 + 
        parseFloat(currentTimeEl.textContent.split(':')[1] || 0) > 3) {
      // If more than 3 seconds in, restart current song
      loadSong(currentSongIndex, isPlaying);
      if (isPlaying) {
        simulatePlayback();
      }
      showToast(`⟳ ${songs[currentSongIndex].title}`);
      return;
    }
    
    if (shuffleMode) {
      // Get random song different from current
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * songs.length);
      } while (newIndex === currentSongIndex && songs.length > 1);
      currentSongIndex = newIndex;
    } else {
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    }
    
    loadSong(currentSongIndex, isPlaying);
    if (isPlaying) {
      simulatePlayback();
    }
    showToast(`⏮ ${songs[currentSongIndex].title}`);
  }

  // ----- progress bar -----
  function updateProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const clampedX = Math.max(0, Math.min(1, x));
    
    const song = songs[currentSongIndex];
    const newTime = clampedX * song.duration;
    progressFill.style.width = `${clampedX * 100}%`;
    currentTimeEl.textContent = formatTime(newTime);
    
    if (isPlaying && !isDragging) {
      audio.currentTime = newTime;
    }
  }

  // ----- volume control -----
  function updateVolume(e) {
    const rect = volumeBar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const clampedX = Math.max(0, Math.min(1, x));
    
    volume = clampedX;
    volumeFill.style.width = `${clampedX * 100}%`;
    volumeLevel.textContent = `${Math.round(clampedX * 100)}%`;
    audio.volume = volume;
    
    updateVolumeIcon();
  }

  function updateVolumeIcon() {
    if (volume === 0) {
      volumeIcon.textContent = '🔇';
    } else if (volume < 0.3) {
      volumeIcon.textContent = '🔈';
    } else if (volume < 0.7) {
      volumeIcon.textContent = '🔉';
    } else {
      volumeIcon.textContent = '🔊';
    }
  }

  // ----- playlist -----
  function updatePlaylist() {
    playlist.innerHTML = '';
    songs.forEach((song, index) => {
      const item = document.createElement('div');
      item.className = `playlist-item${index === currentSongIndex ? ' active' : ''}`;
      item.innerHTML = `
        <span class="pl-title">${song.title}</span>
        <span class="pl-artist">${song.artist}</span>
        <span class="pl-duration">${formatTime(song.duration)}</span>
        <span class="pl-playing">▶</span>
      `;
      item.addEventListener('click', () => {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        currentSongIndex = index;
        loadSong(currentSongIndex, isPlaying);
        if (isPlaying) {
          simulatePlayback();
        }
        if (playlistOpen) {
          togglePlaylist();
        }
      });
      playlist.appendChild(item);
    });
    
    // Update playlist count
    playlistToggleBtn.textContent = `📋 Playlist (${songs.length} songs)`;
  }

  function togglePlaylist() {
    playlistOpen = !playlistOpen;
    playlist.classList.toggle('open', playlistOpen);
    playlistToggleBtn.textContent = playlistOpen ? '📋 Hide Playlist' : `📋 Playlist (${songs.length} songs)`;
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
  playBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);

  // Progress bar events
  progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateProgress(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updateProgress(e);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      if (isPlaying) {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        simulatePlayback();
      }
    }
  });

  // Volume bar events
  volumeBar.addEventListener('mousedown', (e) => {
    updateVolume(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (e.buttons & 1) {
      const rect = volumeBar.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        updateVolume(e);
      }
    }
  });

  volumeIcon.addEventListener('click', () => {
    if (volume > 0) {
      volume = 0;
    } else {
      volume = 0.8;
    }
    volumeFill.style.width = `${volume * 100}%`;
    volumeLevel.textContent = `${Math.round(volume * 100)}%`;
    audio.volume = volume;
    updateVolumeIcon();
  });

  // Playlist toggle
  playlistToggleBtn.addEventListener('click', togglePlaylist);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      togglePlay();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSong();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSong();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      volume = Math.min(1, volume + 0.1);
      volumeFill.style.width = `${volume * 100}%`;
      volumeLevel.textContent = `${Math.round(volume * 100)}%`;
      audio.volume = volume;
      updateVolumeIcon();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      volume = Math.max(0, volume - 0.1);
      volumeFill.style.width = `${volume * 100}%`;
      volumeLevel.textContent = `${Math.round(volume * 100)}%`;
      audio.volume = volume;
      updateVolumeIcon();
    }
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      shuffleMode = !shuffleMode;
      showToast(shuffleMode ? '🔀 Shuffle ON' : '🔀 Shuffle OFF');
    }
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      repeatMode = !repeatMode;
      showToast(repeatMode ? '🔁 Repeat ON' : '🔁 Repeat OFF');
    }
  });

  // ----- init -----
  loadSong(0, false);
  volumeFill.style.width = '80%';
  volumeLevel.textContent = '80%';
  audio.volume = 0.8;
  updatePlaylist();

  console.log('✅ Music Player');
  console.log('   ⌨️  Space = play/pause  |  ← = prev  |  → = next');
  console.log('   ⌨️  ↑ = volume up  |  ↓ = volume down');
  console.log('   ⌨️  s = shuffle  |  r = repeat');
  console.log(`   🎵 ${songs.length} songs loaded`);

  // Audio events
  audio.addEventListener('ended', () => {
    handleSongEnd();
  });

  audio.addEventListener('timeupdate', () => {
    if (!isDragging && isPlaying) {
      const progress = (audio.currentTime / songs[currentSongIndex].duration) * 100;
      progressFill.style.width = `${Math.min(progress, 100)}%`;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  });

})();