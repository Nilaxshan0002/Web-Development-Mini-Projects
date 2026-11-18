// script.js — full CRUD with tags, edit, and local storage

const notesKey = 'beautifulNotes';

// ----- helpers -----
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(notesKey)) || [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(notesKey, JSON.stringify(notes));
}

// ----- render -----
function render() {
  const notes = loadNotes();
  const container = document.getElementById('notesContainer');
  const countSpan = document.getElementById('noteCount');

  if (!notes.length) {
    container.innerHTML = `<div class="empty-notes">✨ no notes yet — start writing above</div>`;
    countSpan.textContent = '0 notes';
    return;
  }

  // sort by newest first (by index, but we keep it simple)
  const reversed = [...notes].reverse();

  container.innerHTML = reversed.map((note, idx) => {
    const originalIndex = notes.length - 1 - idx;
    const tags = note.tags || [];
    // set a staggered animation delay
    const delay = idx * 0.04;
    return `
      <div class="note-card" data-index="${originalIndex}" style="--i: ${idx}; animation-delay: ${delay}s">
        <h3>${escapeHtml(note.title) || 'untitled'}</h3>
        <p>${escapeHtml(note.content) || '—'}</p>
        <div class="note-tags">
          ${tags.length ? tags.map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('') : '<span style="color:rgba(255,255,255,0.2); font-size:0.7rem;">no tags</span>'}
        </div>
        <div class="note-actions">
          <button class="edit-btn" onclick="editNote(${originalIndex})">✎ edit</button>
          <button class="delete-btn" onclick="deleteNote(${originalIndex})">✕ delete</button>
        </div>
      </div>
    `;
  }).join('');

  countSpan.textContent = `${notes.length} note${notes.length > 1 ? 's' : ''}`;
}

// simple escape to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ----- add note -----
function addNote() {
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');
  const tagsInput = document.getElementById('noteTags');

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const rawTags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);

  if (!title && !content) {
    alert('Please add a title or some content.');
    return;
  }

  const notes = loadNotes();
  notes.push({
    title: title || 'untitled',
    content: content || '(empty)',
    tags: rawTags,
    created: Date.now()
  });

  saveNotes(notes);
  titleInput.value = '';
  contentInput.value = '';
  tagsInput.value = '';
  render();
}

// ----- delete note -----
function deleteNote(index) {
  if (!confirm('Delete this note?')) return;
  const notes = loadNotes();
  notes.splice(index, 1);
  saveNotes(notes);
  render();
}

// ----- edit note (inline prompt) -----
function editNote(index) {
  const notes = loadNotes();
  const note = notes[index];
  if (!note) return;

  const newTitle = prompt('Edit title:', note.title);
  if (newTitle === null) return;

  const newContent = prompt('Edit content:', note.content);
  if (newContent === null) return;

  const newTagsRaw = prompt('Edit tags (comma separated):', note.tags.join(', '));
  if (newTagsRaw === null) return;

  const newTags = newTagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  notes[index] = {
    ...note,
    title: newTitle.trim() || 'untitled',
    content: newContent.trim() || '(empty)',
    tags: newTags
  };

  saveNotes(notes);
  render();
}

// ----- clear all -----
function clearAllNotes() {
  if (!confirm('Delete ALL notes? This cannot be undone.')) return;
  saveNotes([]);
  render();
}

// ----- init -----
document.addEventListener('DOMContentLoaded', () => {
  render();

  document.getElementById('noteTitle').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNote();
    }
  });

  document.getElementById('noteContent').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addNote();
    }
  });
});