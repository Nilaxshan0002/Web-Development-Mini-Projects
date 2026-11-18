// ============================================================
//  SIMPLE BLOG — full auth, posts, admin dashboard
//  EVERYONE can create posts, edit/delete only their own
// ============================================================

// ---------- state ----------
let currentUser = null;
let isAdmin = false;

// ---------- DOM refs ----------
const loginSection = document.getElementById('loginSection');
const blogSection = document.getElementById('blogSection');

const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const togglePassword = document.getElementById('togglePassword');

const displayUser = document.getElementById('displayUser');
const adminBadge = document.getElementById('adminBadge');
const logoutBtn = document.getElementById('logoutBtn');

const createPostSection = document.getElementById('createPostSection');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const createPostBtn = document.getElementById('createPostBtn');

const postsContainer = document.getElementById('postsContainer');
const postCount = document.getElementById('postCount');

// ---------- password toggle ----------
let passwordVisible = false;
togglePassword.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    loginPass.type = passwordVisible ? 'text' : 'password';
    togglePassword.textContent = passwordVisible ? '🙈' : '👁️';
});

// ---------- helpers ----------
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('blog_users')) || {};
    } catch { return {}; }
}

function saveUsers(users) {
    localStorage.setItem('blog_users', JSON.stringify(users));
}

function getPosts() {
    try {
        return JSON.parse(localStorage.getItem('blog_posts')) || [];
    } catch { return []; }
}

function savePosts(posts) {
    localStorage.setItem('blog_posts', JSON.stringify(posts));
}

function getNextId() {
    const posts = getPosts();
    if (posts.length === 0) return 1;
    return Math.max(...posts.map(p => p.id)) + 1;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ---------- render posts ----------
function renderPosts() {
    const posts = getPosts();
    const sorted = [...posts].sort((a, b) => b.createdAt - a.createdAt);

    if (!sorted.length) {
        postsContainer.innerHTML = '<div class="empty-posts">No posts yet — be the first to write!</div>';
        postCount.textContent = '0 posts';
        return;
    }

    postsContainer.innerHTML = sorted.map(post => {
        // Show edit/delete ONLY if current user is the author OR admin
        const canEdit = (currentUser === post.author || isAdmin);
        const canDelete = (currentUser === post.author || isAdmin);
        
        return `
        <div class="post-card" data-id="${post.id}">
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-meta">
                <span class="author">✍️ ${escapeHtml(post.author)}</span>
                <span>📅 ${formatDate(post.createdAt)}</span>
                ${post.edited ? '<span style="color:rgba(255,255,255,0.15);">(edited)</span>' : ''}
            </div>
            <div class="post-content">${escapeHtml(post.content)}</div>
            ${canEdit || canDelete ? `
                <div class="post-actions">
                    ${canEdit ? `<button class="edit-post" onclick="editPost(${post.id})">✎ Edit</button>` : ''}
                    ${canDelete ? `<button class="delete-post" onclick="deletePost(${post.id})">✕ Delete</button>` : ''}
                </div>
            ` : ''}
        </div>
    `}).join('');

    postCount.textContent = `${sorted.length} post${sorted.length > 1 ? 's' : ''}`;
}

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

// ---------- create post ----------
function createPost() {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();

    if (!title || !content) {
        alert('Please fill in both title and content.');
        return;
    }

    const posts = getPosts();
    const newPost = {
        id: getNextId(),
        title: title,
        content: content,
        author: currentUser,
        createdAt: Date.now(),
        edited: false
    };

    posts.push(newPost);
    savePosts(posts);
    postTitle.value = '';
    postContent.value = '';
    renderPosts();
}

// ---------- delete post ----------
function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === id);
    
    // Only allow if user is author or admin
    if (!post || (post.author !== currentUser && !isAdmin)) {
        alert('You do not have permission to delete this post.');
        return;
    }
    
    const filtered = posts.filter(p => p.id !== id);
    savePosts(filtered);
    renderPosts();
}

// ---------- edit post ----------
function editPost(id) {
    const posts = getPosts();
    const post = posts.find(p => p.id === id);
    
    // Only allow if user is author
    if (!post || post.author !== currentUser) {
        alert('You can only edit your own posts.');
        return;
    }

    const newTitle = prompt('Edit title:', post.title);
    if (newTitle === null) return;

    const newContent = prompt('Edit content:', post.content);
    if (newContent === null) return;

    if (!newTitle.trim() || !newContent.trim()) {
        alert('Title and content cannot be empty.');
        return;
    }

    post.title = newTitle.trim();
    post.content = newContent.trim();
    post.edited = true;
    savePosts(posts);
    renderPosts();
}

// ---------- login / signup ----------
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    loginBtn.textContent = isLoginMode ? 'Sign In' : 'Create Account';
    toggleText.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
    toggleLink.textContent = isLoginMode ? 'Sign Up' : 'Sign In';
    loginError.textContent = '';
    loginSuccess.textContent = '';
}

function handleAuth() {
    const user = loginUser.value.trim();
    const pass = loginPass.value.trim();

    loginError.textContent = '';
    loginSuccess.textContent = '';

    if (!user || !pass) {
        loginError.textContent = 'Please fill in all fields.';
        return;
    }

    const users = getUsers();

    if (isLoginMode) {
        // LOGIN
        if (users[user] && users[user] === pass) {
            loginSuccess.textContent = '✅ Login successful!';
            setTimeout(() => {
                currentUser = user;
                isAdmin = (user === 'admin');
                showBlog();
            }, 500);
        } else {
            loginError.textContent = '❌ Invalid username or password.';
        }
    } else {
        // SIGNUP
        if (users[user]) {
            loginError.textContent = '❌ Username already exists.';
            return;
        }
        users[user] = pass;
        saveUsers(users);
        loginSuccess.textContent = '✅ Account created successfully! Please sign in.';
        loginUser.value = '';
        loginPass.value = '';
        setTimeout(() => {
            if (!isLoginMode) toggleAuthMode();
        }, 1000);
    }
}

function showBlog() {
    loginSection.classList.add('hidden');
    blogSection.classList.remove('hidden');
    displayUser.textContent = currentUser;

    if (isAdmin) {
        adminBadge.style.display = 'inline';
    } else {
        adminBadge.style.display = 'none';
    }

    // Create post section is ALWAYS visible to all users
    createPostSection.style.display = 'block';

    renderPosts();
}

function logout() {
    currentUser = null;
    isAdmin = false;
    blogSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginUser.value = '';
    loginPass.value = '';
    loginError.textContent = '';
    loginSuccess.textContent = '';
    postsContainer.innerHTML = '<div class="empty-posts">No posts yet — be the first to write!</div>';
    postCount.textContent = '0 posts';
}

// ---------- event listeners ----------
loginBtn.addEventListener('click', handleAuth);

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});

loginUser.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuth(); });
loginPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuth(); });

logoutBtn.addEventListener('click', logout);

createPostBtn.addEventListener('click', createPost);

// ---------- init ----------
const existingPosts = getPosts();
if (existingPosts.length === 0) {
    const samplePosts = [{
        id: 1,
        title: 'Welcome to the Simple Blog!',
        content: 'This is a sample post to get you started. You can create new posts, edit them, and delete them. The admin user has full control!',
        author: 'admin',
        createdAt: Date.now() - 86400000,
        edited: false
    }];
    savePosts(samplePosts);
}

console.log('📝 Simple Blog ready — login to start.');