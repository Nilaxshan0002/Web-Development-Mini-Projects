(function() {
    'use strict';

    // ----- DATA -----
    let posts = [
        {
            id: 1,
            user: 'John Doe',
            username: '@johndoe',
            avatar: 'JD',
            avatarColor: '#6366f1',
            content: 'Just finished a new design system for our product! 🚀 Excited to share it with the team. #Design #Productivity',
            image: 'https://picsum.photos/seed/design/800/400',
            likes: 42,
            comments: 12,
            time: '2 hours ago',
            liked: false
        },
        {
            id: 2,
            user: 'Sarah Miller',
            username: '@sarahm',
            avatar: 'SM',
            avatarColor: '#10b981',
            content: 'Beautiful sunset from my balcony tonight. Nature never fails to inspire. 🌅✨',
            image: 'https://picsum.photos/seed/sunset/800/400',
            likes: 28,
            comments: 7,
            time: '4 hours ago',
            liked: false
        },
        {
            id: 3,
            user: 'Alex Kim',
            username: '@alexk',
            avatar: 'AK',
            avatarColor: '#f59e0b',
            content: 'Just launched a new open-source project! Check it out on GitHub. Contributions welcome! 🎉 #OpenSource #Dev',
            image: 'https://picsum.photos/seed/code/800/400',
            likes: 56,
            comments: 23,
            time: '6 hours ago',
            liked: false
        }
    ];

    let nextPostId = 4;
    let following = new Set();

    // ----- DOM REFS -----
    const feedContainer = document.getElementById('feedContainer');
    const postsContainer = document.getElementById('postsContainer');
    const postInput = document.getElementById('postInput');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const photoBtn = document.getElementById('photoBtn');
    const videoBtn = document.getElementById('videoBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const toast = document.getElementById('toast');
    const notifBtn = document.getElementById('notifBtn');
    const msgBtn = document.getElementById('msgBtn');
    const profileBtn = document.getElementById('profileBtn');
    const createPostSection = document.getElementById('createPostSection');

    let toastTimer = null;
    let currentPage = 'home';
    let notificationCount = 3;
    let messageCount = 2;

    // ----- HELPERS -----
    function showToast(message, duration = 2200) {
        if (toastTimer) clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // ----- RENDER POSTS -----
    function renderPosts() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        let filtered = posts;
        if (searchTerm) {
            filtered = posts.filter(p => 
                p.content.toLowerCase().includes(searchTerm) ||
                p.user.toLowerCase().includes(searchTerm) ||
                p.username.toLowerCase().includes(searchTerm)
            );
        }

        if (filtered.length === 0) {
            postsContainer.innerHTML = `
                <div style="text-align:center; padding:2rem; color:#94a3b8; background:white; border-radius:1.6rem; border:1px solid #e2e8f0;">
                    <i class="fas fa-search" style="font-size:2rem; opacity:0.3; display:block; margin-bottom:0.5rem;"></i>
                    <p style="font-weight:500;">No posts found</p>
                    <p style="font-size:0.9rem;">Try different keywords</p>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(post => {
            const likeIcon = post.liked ? 'fas fa-heart' : 'far fa-heart';
            const likeClass = post.liked ? 'liked' : '';

            html += `
                <div class="post-card" data-id="${post.id}">
                    <div class="post-header">
                        <div class="avatar-post" style="background:${post.avatarColor};">${post.avatar}</div>
                        <div class="post-user">
                            <h4>${post.user}</h4>
                            <span>${post.username} · ${post.time}</span>
                        </div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" loading="lazy" />` : ''}
                    <div class="post-stats">
                        <span><i class="fas fa-heart" style="color:#ef4444;"></i> ${post.likes}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments}</span>
                        <span><i class="fas fa-share"></i> ${Math.floor(post.likes / 3)}</span>
                    </div>
                    <div class="post-actions-footer">
                        <button class="like-btn ${likeClass}" data-id="${post.id}">
                            <i class="${likeIcon}"></i> ${post.liked ? 'Unlike' : 'Like'}
                        </button>
                        <button class="comment-btn" data-id="${post.id}">
                            <i class="far fa-comment"></i> Comment
                        </button>
                        <button class="share-btn" data-id="${post.id}">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            `;
        });

        postsContainer.innerHTML = html;

        // attach like listeners
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                const post = posts.find(p => p.id === id);
                if (post) {
                    post.liked = !post.liked;
                    post.likes += post.liked ? 1 : -1;
                    renderPosts();
                    showToast(post.liked ? '❤️ Liked!' : '💔 Unliked');
                }
            });
        });

        // comment listeners
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                const post = posts.find(p => p.id === id);
                if (post) {
                    post.comments += 1;
                    renderPosts();
                    showToast(`💬 Commented on "${post.content.substring(0, 30)}..."`);
                }
            });
        });

        // share listeners
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                const post = posts.find(p => p.id === id);
                if (post) {
                    showToast(`🔗 Shared "${post.content.substring(0, 30)}..."`);
                }
            });
        });
    }

    // ----- CREATE POST -----
    function createPost() {
        const content = postInput.value.trim();
        if (!content) {
            showToast('⚠️ Please write something to post', 1800);
            return;
        }

        const newPost = {
            id: nextPostId++,
            user: 'John Doe',
            username: '@johndoe',
            avatar: 'JD',
            avatarColor: '#6366f1',
            content: content,
            image: Math.random() > 0.6 ? 'https://picsum.photos/seed/' + Math.random() + '/800/400' : null,
            likes: 0,
            comments: 0,
            time: 'Just now',
            liked: false
        };

        posts.unshift(newPost);
        postInput.value = '';
        renderPosts();
        showToast('✅ Post published!', 1800);
    }

    // ----- FOLLOW SUGGESTIONS -----
    function setupFollowButtons() {
        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (following.has(id)) {
                    following.delete(id);
                    this.textContent = 'Follow';
                    this.classList.remove('following');
                    showToast('👋 Unfollowed');
                } else {
                    following.add(id);
                    this.textContent = 'Following';
                    this.classList.add('following');
                    showToast('✅ Followed!');
                }
            });
        });
    }

    // ----- NAVIGATION -----
    function navigateTo(page) {
        currentPage = page;
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Show/hide create post section
        if (page === 'home') {
            createPostSection.style.display = 'block';
            renderPosts();
        } else {
            createPostSection.style.display = 'none';
            // Show page-specific content
            const pageContent = {
                'friends': `
                    <div style="text-align:center; padding:2rem; background:white; border-radius:1.6rem; border:1px solid #e2e8f0;">
                        <i class="fas fa-users" style="font-size:3rem; color:#6366f1; opacity:0.4; display:block; margin-bottom:1rem;"></i>
                        <h3 style="margin-bottom:0.5rem;">Your Friends</h3>
                        <p style="color:#94a3b8; margin-bottom:1rem;">Connect with people you know</p>
                        <div style="display:flex; flex-direction:column; gap:0.8rem; text-align:left; max-width:400px; margin:0 auto;">
                            <div style="display:flex; align-items:center; gap:12px; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <div style="width:40px; height:40px; border-radius:50%; background:#f59e0b; display:flex; align-items:center; justify-content:center; color:white; font-weight:600;">AK</div>
                                <div><p style="font-weight:500;">Alex Kim</p><span style="font-size:0.8rem; color:#94a3b8;">Online</span></div>
                                <button style="margin-left:auto; padding:0.3rem 1rem; border:none; background:#6366f1; color:white; border-radius:40px; cursor:pointer; font-size:0.8rem;">Message</button>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <div style="width:40px; height:40px; border-radius:50%; background:#10b981; display:flex; align-items:center; justify-content:center; color:white; font-weight:600;">SM</div>
                                <div><p style="font-weight:500;">Sarah Miller</p><span style="font-size:0.8rem; color:#94a3b8;">Last seen 2h ago</span></div>
                                <button style="margin-left:auto; padding:0.3rem 1rem; border:none; background:#6366f1; color:white; border-radius:40px; cursor:pointer; font-size:0.8rem;">Message</button>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <div style="width:40px; height:40px; border-radius:50%; background:#8b5cf6; display:flex; align-items:center; justify-content:center; color:white; font-weight:600;">TC</div>
                                <div><p style="font-weight:500;">Tom Chen</p><span style="font-size:0.8rem; color:#94a3b8;">Online</span></div>
                                <button style="margin-left:auto; padding:0.3rem 1rem; border:none; background:#6366f1; color:white; border-radius:40px; cursor:pointer; font-size:0.8rem;">Message</button>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <div style="width:40px; height:40px; border-radius:50%; background:#ec4899; display:flex; align-items:center; justify-content:center; color:white; font-weight:600;">EM</div>
                                <div><p style="font-weight:500;">Emma Wilson</p><span style="font-size:0.8rem; color:#94a3b8;">Last seen 1h ago</span></div>
                                <button style="margin-left:auto; padding:0.3rem 1rem; border:none; background:#6366f1; color:white; border-radius:40px; cursor:pointer; font-size:0.8rem;">Message</button>
                            </div>
                        </div>
                    </div>
                `,
                'memories': `
                    <div style="text-align:center; padding:2rem; background:white; border-radius:1.6rem; border:1px solid #e2e8f0;">
                        <i class="fas fa-clock" style="font-size:3rem; color:#6366f1; opacity:0.4; display:block; margin-bottom:1rem;"></i>
                        <h3 style="margin-bottom:0.5rem;">Your Memories</h3>
                        <p style="color:#94a3b8; margin-bottom:1.5rem;">Relive your favorite moments</p>
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:1rem; max-width:600px; margin:0 auto;">
                            <div style="background:#f1f5f9; border-radius:12px; padding:1rem; cursor:pointer;" onclick="window.showToast ? window.showToast('📸 Memory from 2 years ago') : alert('Memory from 2 years ago')">
                                <i class="fas fa-calendar-alt" style="font-size:1.5rem; color:#6366f1; display:block; margin-bottom:0.5rem;"></i>
                                <p style="font-size:0.85rem; font-weight:500;">Summer 2024</p>
                                <span style="font-size:0.7rem; color:#94a3b8;">12 photos</span>
                            </div>
                            <div style="background:#f1f5f9; border-radius:12px; padding:1rem; cursor:pointer;" onclick="window.showToast ? window.showToast('📸 Memory from 3 years ago') : alert('Memory from 3 years ago')">
                                <i class="fas fa-calendar-alt" style="font-size:1.5rem; color:#6366f1; display:block; margin-bottom:0.5rem;"></i>
                                <p style="font-size:0.85rem; font-weight:500;">Vacation 2023</p>
                                <span style="font-size:0.7rem; color:#94a3b8;">8 photos</span>
                            </div>
                            <div style="background:#f1f5f9; border-radius:12px; padding:1rem; cursor:pointer;" onclick="window.showToast ? window.showToast('📸 Memory from 4 years ago') : alert('Memory from 4 years ago')">
                                <i class="fas fa-calendar-alt" style="font-size:1.5rem; color:#6366f1; display:block; margin-bottom:0.5rem;"></i>
                                <p style="font-size:0.85rem; font-weight:500;">Graduation 2022</p>
                                <span style="font-size:0.7rem; color:#94a3b8;">15 photos</span>
                            </div>
                            <div style="background:#f1f5f9; border-radius:12px; padding:1rem; cursor:pointer;" onclick="window.showToast ? window.showToast('📸 Memory from 1 year ago') : alert('Memory from 1 year ago')">
                                <i class="fas fa-calendar-alt" style="font-size:1.5rem; color:#6366f1; display:block; margin-bottom:0.5rem;"></i>
                                <p style="font-size:0.85rem; font-weight:500;">Birthday 2025</p>
                                <span style="font-size:0.7rem; color:#94a3b8;">20 photos</span>
                            </div>
                        </div>
                    </div>
                `,
                'saved': `
                    <div style="text-align:center; padding:2rem; background:white; border-radius:1.6rem; border:1px solid #e2e8f0;">
                        <i class="fas fa-bookmark" style="font-size:3rem; color:#6366f1; opacity:0.4; display:block; margin-bottom:1rem;"></i>
                        <h3 style="margin-bottom:0.5rem;">Saved Posts</h3>
                        <p style="color:#94a3b8; margin-bottom:1.5rem;">Your curated collection</p>
                        <div style="display:flex; flex-direction:column; gap:0.8rem; max-width:500px; margin:0 auto;">
                            <div style="display:flex; align-items:center; gap:12px; padding:0.8rem; background:#f8fafc; border-radius:12px; text-align:left;">
                                <i class="fas fa-file-alt" style="color:#6366f1;"></i>
                                <div><p style="font-weight:500;">Design System Tips</p><span style="font-size:0.8rem; color:#94a3b8;">Saved 2 days ago</span></div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:0.8rem; background:#f8fafc; border-radius:12px; text-align:left;">
                                <i class="fas fa-file-alt" style="color:#6366f1;"></i>
                                <div><p style="font-weight:500;">React Best Practices</p><span style="font-size:0.8rem; color:#94a3b8;">Saved 5 days ago</span></div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:0.8rem; background:#f8fafc; border-radius:12px; text-align:left;">
                                <i class="fas fa-file-alt" style="color:#6366f1;"></i>
                                <div><p style="font-weight:500;">Remote Work Guide</p><span style="font-size:0.8rem; color:#94a3b8;">Saved 1 week ago</span></div>
                            </div>
                        </div>
                    </div>
                `,
                'settings': `
                    <div style="text-align:center; padding:2rem; background:white; border-radius:1.6rem; border:1px solid #e2e8f0;">
                        <i class="fas fa-cog" style="font-size:3rem; color:#6366f1; opacity:0.4; display:block; margin-bottom:1rem;"></i>
                        <h3 style="margin-bottom:0.5rem;">Settings</h3>
                        <p style="color:#94a3b8; margin-bottom:1.5rem;">Customize your experience</p>
                        <div style="display:flex; flex-direction:column; gap:0.8rem; max-width:400px; margin:0 auto; text-align:left;">
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <span><i class="fas fa-moon" style="color:#6366f1; margin-right:10px;"></i>Dark Mode</span>
                                <label style="position:relative; display:inline-block; width:50px; height:26px;">
                                    <input type="checkbox" style="opacity:0; width:0; height:0;" />
                                    <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#ccc; transition:.3s; border-radius:26px;"></span>
                                </label>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <span><i class="fas fa-bell" style="color:#6366f1; margin-right:10px;"></i>Notifications</span>
                                <label style="position:relative; display:inline-block; width:50px; height:26px;">
                                    <input type="checkbox" checked style="opacity:0; width:0; height:0;" />
                                    <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#6366f1; transition:.3s; border-radius:26px;"></span>
                                </label>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <span><i class="fas fa-lock" style="color:#6366f1; margin-right:10px;"></i>Privacy</span>
                                <span style="color:#94a3b8; font-size:0.85rem;">Manage <i class="fas fa-chevron-right" style="margin-left:5px;"></i></span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.8rem; background:#f8fafc; border-radius:12px;">
                                <span><i class="fas fa-user-edit" style="color:#6366f1; margin-right:10px;"></i>Edit Profile</span>
                                <span style="color:#94a3b8; font-size:0.85rem;">Update <i class="fas fa-chevron-right" style="margin-left:5px;"></i></span>
                            </div>
                        </div>
                    </div>
                `
            };

            postsContainer.innerHTML = pageContent[page] || `<div style="text-align:center; padding:3rem; background:white; border-radius:1.6rem; border:1px solid #e2e8f0;"><p>Page content coming soon</p></div>`;
            
            // Re-bind any buttons in the rendered content
            if (page === 'friends') {
                document.querySelectorAll('.friends-message-btn').forEach(btn => {
                    btn.addEventListener('click', () => showToast('💬 Message sent!'));
                });
            }
        }
    }

    // ----- EXPOSE showToast for inline onclick -----
    window.showToast = showToast;

    // ----- EVENT LISTENERS -----
    submitPostBtn.addEventListener('click', createPost);

    postInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createPost();
        }
    });

    photoBtn.addEventListener('click', () => {
        showToast('📸 Photo uploaded successfully!', 2000);
    });

    videoBtn.addEventListener('click', () => {
        showToast('🎥 Video uploaded successfully!', 2000);
    });

    searchBtn.addEventListener('click', () => {
        if (currentPage !== 'home') {
            navigateTo('home');
        } else {
            renderPosts();
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentPage !== 'home') {
                navigateTo('home');
            } else {
                renderPosts();
            }
        }
    });

    searchInput.addEventListener('input', function() {
        if (this.value === '' && currentPage === 'home') {
            renderPosts();
        }
    });

    // Notifications button
    notifBtn.addEventListener('click', function() {
        notificationCount = 0;
        const badge = this.querySelector('.badge');
        if (badge) badge.style.display = 'none';
        showToast(`🔔 You have 3 new notifications:\n• John liked your post\n• Sarah commented on your photo\n• Alex mentioned you in a comment`, 3500);
    });

    // Messages button
    msgBtn.addEventListener('click', function() {
        messageCount = 0;
        const badge = this.querySelector('.badge');
        if (badge) badge.style.display = 'none';
        showToast(`💬 2 unread messages:\n• Alex: "Hey, are you available?"\n• Sarah: "Check out my latest post!"`, 3500);
    });

    // Profile button
    profileBtn.addEventListener('click', function() {
        showToast(`👤 John Doe\n📧 johndoe@email.com\n📍 Product Designer\n👥 234 followers\n📌 12 posts`, 3500);
    });

    // Nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateTo(page);
        });
    });

    // Trending topics click
    document.querySelectorAll('.trending-item').forEach(item => {
        item.addEventListener('click', function() {
            const trend = this.dataset.trend || this.textContent.trim();
            searchInput.value = trend;
            if (currentPage !== 'home') {
                navigateTo('home');
            } else {
                renderPosts();
                showToast(`🔍 Searching for ${trend}`);
            }
        });
    });

    // ----- INIT -----
    renderPosts();
    setupFollowButtons();

    // welcome toast
    setTimeout(() => {
        showToast('👋 Welcome to Social Platform!', 2500);
    }, 800);

    console.log('Social Platform initialized!');
})();