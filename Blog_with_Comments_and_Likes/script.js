// script.js – blog interactivity (likes & comments)

(function() {
  "use strict";

  // ----- state -----
  let likes = 0;
  let comments = [];

  // ----- DOM refs -----
  const likeBtn = document.getElementById('likeButton');
  const likeCountDisplay = document.getElementById('likeCountDisplay');
  const commentList = document.getElementById('commentList');
  const commentCounter = document.getElementById('commentCounter');
  const authorInput = document.getElementById('commentAuthorInput');
  const textInput = document.getElementById('commentTextInput');
  const submitBtn = document.getElementById('submitCommentBtn');

  // ----- helper: render comments -----
  function renderComments() {
    // remove empty placeholder if exists
    const emptyPlaceholder = document.getElementById('emptyComments');
    if (emptyPlaceholder) emptyPlaceholder.remove();

    commentList.innerHTML = '';

    if (comments.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-comments';
      emptyDiv.id = 'emptyComments';
      emptyDiv.innerHTML = `<i class="far fa-comment" style="margin-right: 8px;"></i> No comments yet. Start the conversation!`;
      commentList.appendChild(emptyDiv);
      commentCounter.textContent = '0';
      return;
    }

    // newest first
    const sorted = [...comments].reverse();
    for (const comment of sorted) {
      const commentItem = document.createElement('div');
      commentItem.className = 'comment-item';
      commentItem.dataset.id = comment.id;

      const avatar = document.createElement('div');
      avatar.className = 'comment-avatar';
      const initial = comment.author.trim().charAt(0).toUpperCase() || '?';
      avatar.textContent = initial;

      const contentDiv = document.createElement('div');
      contentDiv.className = 'comment-content';

      const authorDiv = document.createElement('div');
      authorDiv.className = 'comment-author';
      authorDiv.innerHTML = `
        ${comment.author}
        <span class="time">${comment.time}</span>
        <button class="delete-comment" data-id="${comment.id}" aria-label="delete comment">
          <i class="fas fa-times"></i>
        </button>
      `;

      const textP = document.createElement('div');
      textP.className = 'comment-text';
      textP.textContent = comment.text;

      contentDiv.appendChild(authorDiv);
      contentDiv.appendChild(textP);
      commentItem.appendChild(avatar);
      commentItem.appendChild(contentDiv);
      commentList.appendChild(commentItem);
    }

    commentCounter.textContent = comments.length;

    document.querySelectorAll('.delete-comment').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = Number(this.dataset.id);
        deleteCommentById(id);
      });
    });
  }

  // ----- delete comment by id -----
  function deleteCommentById(id) {
    comments = comments.filter(c => c.id !== id);
    renderComments();
    saveToLocalStorage();
  }

  // ----- add new comment -----
  function addComment(author, text) {
    if (!author.trim() || !text.trim()) {
      alert('✨ Please enter your name and comment.');
      return false;
    }

    const newComment = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      author: author.trim().substring(0, 40),
      text: text.trim().substring(0, 500),
      time: new Date().toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })
    };

    comments.push(newComment);
    renderComments();
    saveToLocalStorage();
    textInput.value = '';
    return true;
  }

  // ----- like logic -----
  function toggleLike() {
    const isLiked = likeBtn.classList.contains('liked');
    if (isLiked) {
      likes = Math.max(0, likes - 1);
      likeBtn.classList.remove('liked');
      likeBtn.innerHTML = `<i class="fa-regular fa-heart"></i> Like`;
    } else {
      likes += 1;
      likeBtn.classList.add('liked');
      likeBtn.innerHTML = `<i class="fa-solid fa-heart" style="color: #ff4d7a;"></i> Liked`;
    }
    likeCountDisplay.textContent = likes;
    saveToLocalStorage();
  }

  // ----- localStorage persistence -----
  function saveToLocalStorage() {
    try {
      const data = { likes, comments };
      localStorage.setItem('blog_comments_likes_data', JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('blog_comments_likes_data');
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.likes !== undefined && typeof data.likes === 'number') likes = data.likes;
      if (Array.isArray(data.comments)) comments = data.comments;
      return true;
    } catch (e) { return false; }
  }

  // ----- init -----
  function init() {
    const hasData = loadFromLocalStorage();

    if (!hasData || comments.length === 0) {
      comments = [
        { id: 1001, author: 'Mia Chen', text: 'This is such a thoughtful piece. Really resonates with me!', time: 'Aug 2, 2026, 10:15 AM' },
        { id: 1002, author: 'James Park', text: 'I love the focus on empathy in design. Looking forward to more.', time: 'Aug 2, 2026, 12:40 PM' }
      ];
      likes = 12;
    }

    likeCountDisplay.textContent = likes;
    if (likes > 0) {
      likeBtn.classList.add('liked');
      likeBtn.innerHTML = `<i class="fa-solid fa-heart" style="color: #ff4d7a;"></i> Liked`;
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.innerHTML = `<i class="fa-regular fa-heart"></i> Like`;
    }

    renderComments();

    likeBtn.addEventListener('click', toggleLike);

    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const author = authorInput.value.trim() || 'Guest';
      const text = textInput.value.trim();
      if (addComment(author, text)) {
        if (!authorInput.value.trim()) authorInput.value = 'Guest';
      }
    });

    textInput.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitBtn.click();
      }
    });

    if (!authorInput.value.trim()) authorInput.value = 'Guest';
  }

  init();
})();