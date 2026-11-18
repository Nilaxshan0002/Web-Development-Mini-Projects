// script.js
(function() {
  "use strict";

  // ----- DOM refs -----
  const notesGrid = document.getElementById('notesGrid');
  const searchInput = document.getElementById('searchInput');
  const addBtn = document.getElementById('addNoteBtn');
  const noteCounter = document.getElementById('noteCounter');

  // modal
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const noteTitleInput = document.getElementById('noteTitleInput');
  const noteContentInput = document.getElementById('noteContentInput');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalSaveBtn = document.getElementById('modalSaveBtn');

  // ----- state -----
  let notes = [];
  let editingId = null;
  let searchTerm = '';

  // ----- load from localStorage -----
  function loadNotes() {
    try {
      const stored = localStorage.getItem('notes_professional');
      if (stored) {
        notes = JSON.parse(stored);
      } else {
        notes = [
          { id: Date.now() + 1, title: 'Welcome 👋', content: 'This is your new Notes App. Add, edit, or delete notes. Everything is saved locally.', createdAt: new Date().toISOString() },
          { id: Date.now() + 2, title: 'Ideas', content: 'Write down your thoughts and they will persist in your browser.', createdAt: new Date().toISOString() }
        ];
      }
    } catch (_) {
      notes = [];
    }
    notes = notes.filter(n => n && typeof n === 'object').map(n => ({
      ...n,
      id: n.id || Date.now() + Math.random()
    }));
    render();
  }

  // ----- save to localStorage -----
  function saveNotes() {
    localStorage.setItem('notes_professional', JSON.stringify(notes));
  }

  // ----- render grid -----
  function render() {
    const filtered = notes.filter(n => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (n.title || '').toLowerCase().includes(term) ||
             (n.content || '').toLowerCase().includes(term);
    });

    if (filtered.length === 0) {
      notesGrid.innerHTML = `
        <div class="empty-message">
          <i class="fas fa-journal-whills"></i>
          ${searchTerm.trim() ? 'No notes match your search.' : 'Your notes will appear here. Click "Add" to start.'}
        </div>
      `;
    } else {
      notesGrid.innerHTML = filtered.map(note => {
        const date = new Date(note.createdAt);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `
          <div class="note-card" data-id="${note.id}">
            <div class="note-title">${escapeHtml(note.title || 'Untitled')}</div>
            <div class="note-content">${escapeHtml(note.content || '')}</div>
            <div class="note-meta">
              <span class="note-date"><i class="far fa-calendar-alt" style="margin-right:4px;"></i>${dateStr}</span>
              <div class="note-actions">
                <button class="edit-btn" data-id="${note.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${note.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    noteCounter.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        openEditModal(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        deleteNote(id);
      });
    });

    document.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const id = Number(card.dataset.id);
        openEditModal(id);
      });
    });
  }

  // ----- simple escape (prevent XSS) -----
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ----- CRUD -----
  function addNote(title, content) {
    const note = {
      id: Date.now() + Math.random(),
      title: title.trim() || 'Untitled',
      content: content.trim() || '',
      createdAt: new Date().toISOString()
    };
    notes.unshift(note);
    saveNotes();
    render();
  }

  function editNote(id, title, content) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    note.title = title.trim() || 'Untitled';
    note.content = content.trim() || '';
    saveNotes();
    render();
  }

  function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    render();
    if (editingId === id) closeModal();
  }

  // ----- modal logic -----
  function openModal(mode, id = null) {
    if (mode === 'add') {
      modalTitle.textContent = '✏️ New Note';
      modalSub.textContent = 'Add a title and some content.';
      noteTitleInput.value = '';
      noteContentInput.value = '';
      editingId = null;
    } else if (mode === 'edit' && id !== null) {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      modalTitle.textContent = '📝 Edit Note';
      modalSub.textContent = 'Update your note.';
      noteTitleInput.value = note.title || '';
      noteContentInput.value = note.content || '';
      editingId = id;
    }
    modalOverlay.classList.add('active');
    setTimeout(() => noteTitleInput.focus(), 80);
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    editingId = null;
  }

  function saveModal() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if (!title && !content) {
      alert('Please add a title or some content.');
      return;
    }
    if (editingId === null) {
      addNote(title, content);
    } else {
      editNote(editingId, title, content);
    }
    closeModal();
  }

  function openEditModal(id) {
    openModal('edit', id);
  }

  // ----- search -----
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    render();
  });

  // ----- event listeners -----
  addBtn.addEventListener('click', () => openModal('add'));

  modalCancelBtn.addEventListener('click', closeModal);
  modalSaveBtn.addEventListener('click', saveModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.ctrlKey && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
      e.preventDefault();
      openModal('add');
    }
  });

  // ----- init -----
  loadNotes();

  window.__notesApp = { notes, addNote, editNote, deleteNote, render };

  console.log('✅ Notes App · professional edition (separate files)');
})();