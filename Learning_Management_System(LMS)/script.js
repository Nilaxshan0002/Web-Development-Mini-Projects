// script.js — all JavaScript for LearnHub LMS Dashboard

(function() {
    "use strict";

    // ─── DATA ────────────────────────────────────────────────
    const courses = [
        { title: "UX Design Fundamentals", instructor: "Dr. Sarah Lin", progress: 72, lessons: 14 },
        { title: "Data Science with Python", instructor: "Prof. Mark Chen", progress: 45, lessons: 22 },
        { title: "Digital Marketing Strategy", instructor: "Emma Wong", progress: 90, lessons: 10 },
        { title: "Leadership & Management", instructor: "James Carter", progress: 30, lessons: 18 },
    ];

    const upcoming = [
        { title: "UX Design: Final project", date: "Due Aug 12", dot: "orange" },
        { title: "Python: Assignment #4", date: "Due Aug 15", dot: "blue" },
        { title: "Marketing: Case study", date: "Due Aug 18", dot: "green" },
    ];

    const activities = [
        "Completed 'Design thinking' module",
        "Started Python: Data visualization",
        "Submitted Marketing plan draft",
        "Joined 'Leadership' live session",
    ];

    const assignmentsData = [
        { title: "UX Design: Final project", course: "UX Design Fundamentals", due: "Aug 12", status: "soon" },
        { title: "Python: Assignment #4", course: "Data Science with Python", due: "Aug 15", status: "pending" },
        { title: "Marketing: Case study", course: "Digital Marketing Strategy", due: "Aug 18", status: "pending" },
        { title: "Leadership: Reflection paper", course: "Leadership & Management", due: "Aug 5", status: "done" },
        { title: "Data Science: Quiz #2", course: "Data Science with Python", due: "Aug 2", status: "overdue" },
    ];

    const scheduleData = [
        { day: "Monday", events: [{ time: "10:00 – 11:30", title: "UX Design Lecture" }, { time: "14:00 – 15:30",
                title: "Data Science Lab" }] },
        { day: "Tuesday", events: [{ time: "09:00 – 10:30", title: "Marketing Strategy" }] },
        { day: "Wednesday", events: [{ time: "11:00 – 12:30", title: "Leadership Workshop" }, { time: "15:00 – 16:30",
                title: "Python Study Group" }] },
        { day: "Thursday", events: [{ time: "10:00 – 11:30", title: "UX Design Review" }] },
        { day: "Friday", events: [{ time: "09:00 – 10:30", title: "Data Science Lecture" }, { time: "13:00 – 14:30",
                title: "Marketing Case Study" }] },
        { day: "Saturday", events: [] },
        { day: "Sunday", events: [] },
    ];

    const communityPosts = [
        { author: "Sarah Lin", avatar: "SL", text: "Just finished the UX Design module! Loved the hands-on project. 😍",
            time: "2h ago", likes: 12, replies: 4 },
        { author: "Mark Chen", avatar: "MC", text: "Anyone else working on the Python assignment? Let's form a study group!",
            time: "5h ago", likes: 8, replies: 6 },
        { author: "Emma Wong", avatar: "EW", text: "Marketing case study due next week. I've found some great resources, happy to share!",
            time: "1d ago", likes: 15, replies: 9 },
        { author: "James Carter", avatar: "JC", text: "Leadership reflection paper – don't forget to include real-world examples.",
            time: "2d ago", likes: 5, replies: 2 },
    ];

    const settingsData = [
        { group: "Notifications", items: [
                { label: "Email notifications", value: "On" },
                { label: "Push notifications", value: "Off" },
                { label: "Course reminders", value: "On" },
            ] },
        { group: "Preferences", items: [
                { label: "Dark mode", value: "Off" },
                { label: "Language", value: "English (US)" },
                { label: "Time zone", value: "EST (UTC-5)" },
            ] },
        { group: "Privacy", items: [
                { label: "Profile visibility", value: "Public" },
                { label: "Show progress", value: "On" },
            ] },
    ];

    // ─── DOM refs ────────────────────────────────────────────
    const grid = document.getElementById('courseGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const viewAllLink = document.getElementById('viewAllLink');

    const bellBtn = document.getElementById('bellBtn');
    const bellDropdown = document.getElementById('bellDropdown');
    const helpBtn = document.getElementById('helpBtn');
    const helpDropdown = document.getElementById('helpDropdown');
    const avatarBtn = document.getElementById('avatarBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitleText = document.getElementById('modalTitleText');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    const footerHelp = document.getElementById('footerHelp');
    const footerPrivacy = document.getElementById('footerPrivacy');
    const footerTerms = document.getElementById('footerTerms');

    const sidebarLinks = document.querySelectorAll('#sidebarNav a');
    const pageContainers = {
        dashboard: document.getElementById('page-dashboard'),
        'my-courses': document.getElementById('page-my-courses'),
        assignments: document.getElementById('page-assignments'),
        schedule: document.getElementById('page-schedule'),
        community: document.getElementById('page-community'),
        settings: document.getElementById('page-settings'),
    };

    // ─── ROUTING ─────────────────────────────────────────────
    let currentPage = 'dashboard';

    function navigateTo(page) {
        // hide all pages
        Object.keys(pageContainers).forEach(key => {
            pageContainers[key].classList.add('hidden');
        });
        // show target
        if (pageContainers[page]) {
            pageContainers[page].classList.remove('hidden');
        }
        currentPage = page;

        // update sidebar active state
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // re-render page-specific content if needed
        if (page === 'my-courses') renderCourseList();
        if (page === 'assignments') renderAssignments();
        if (page === 'schedule') renderSchedule();
        if (page === 'community') renderCommunity();
        if (page === 'settings') renderSettings();

        // update search placeholder
        const placeholders = {
            dashboard: 'Search courses, topics...',
            'my-courses': 'Search my courses...',
            assignments: 'Search assignments...',
            schedule: 'Search schedule...',
            community: 'Search community posts...',
            settings: 'Search settings...',
        };
        searchInput.placeholder = placeholders[page] || 'Search...';
        searchInput.value = '';
        // re-run search logic based on page
        performSearch();
    }

    // sidebar click handler
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navigateTo(page);
        });
    });

    // logo click goes to dashboard
    document.querySelector('.logo a')?.addEventListener('click', function(e) {
        e.preventDefault();
        navigateTo('dashboard');
    });

    // ─── RENDER HELPERS ─────────────────────────────────────

    function getIcon(title) {
        if (title.includes('UX')) return 'fa-paint-brush';
        if (title.includes('Data')) return 'fa-chart-bar';
        if (title.includes('Marketing')) return 'fa-bullhorn';
        if (title.includes('Leadership')) return 'fa-users-cog';
        return 'fa-laptop-code';
    }

    // ── Dashboard: course grid ──
    function renderCourses(filter = '') {
        const q = filter.toLowerCase().trim();
        const filtered = courses.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.instructor.toLowerCase().includes(q)
        );

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    No courses match “${filter}”
                </div>
            `;
            return;
        }

        filtered.forEach(c => {
            const card = document.createElement('div');
            card.className = 'course-card';
            const icon = getIcon(c.title);
            card.innerHTML = `
                <div class="course-thumb"><i class="fas ${icon}"></i></div>
                <h4>${c.title}</h4>
                <div class="instructor"><i class="fas fa-check-circle"></i> ${c.instructor}</div>
                <div class="course-meta">
                    <span>${c.lessons} lessons</span>
                    <div class="progress-small">
                        <span>${c.progress}%</span>
                        <div class="bar"><div class="fill" style="width:${c.progress}%;"></div></div>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => alert(`📘 Opening course: "${c.title}"`));
            grid.appendChild(card);
        });
    }

    function renderUpcoming() {
        const list = document.getElementById('upcomingList');
        list.innerHTML = '';
        upcoming.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.innerHTML = `
                <div class="task-info">
                    <span class="dot ${task.dot}"></span>
                    <span>${task.title}</span>
                </div>
                <div class="task-date">${task.date}</div>
            `;
            list.appendChild(div);
        });
    }

    function renderActivity() {
        const list = document.getElementById('activityList');
        list.innerHTML = '';
        activities.forEach(text => {
            const div = document.createElement('div');
            div.className = 'task-item';
            const hrs = Math.floor(Math.random() * 3) + 1;
            div.innerHTML = `
                <div class="task-info">
                    <span class="dot green" style="background:#3b6eff;"></span>
                    <span>${text}</span>
                </div>
                <div class="task-date">${hrs}h ago</div>
            `;
            list.appendChild(div);
        });
    }

    // ── My Courses ──
    function renderCourseList(filter = '') {
        const container = document.getElementById('courseList');
        const q = filter.toLowerCase().trim();
        const filtered = courses.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.instructor.toLowerCase().includes(q)
        );
        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML =
                `<div style="text-align:center;padding:2rem;color:#8a9bb8;"><i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>No courses match “${filter}”</div>`;
            return;
        }
        filtered.forEach(c => {
            const div = document.createElement('div');
            div.className = 'course-list-item';
            const icon = getIcon(c.title);
            div.innerHTML = `
                <div class="info">
                    <div class="icon"><i class="fas ${icon}"></i></div>
                    <div class="details"><div class="title">${c.title}</div><div class="instructor"><i class="fas fa-check-circle" style="color:#3b6eff;font-size:0.6rem;"></i> ${c.instructor}</div></div>
                </div>
                <div class="progress-wrap">
                    <span>${c.progress}%</span>
                    <div class="bar"><div class="fill" style="width:${c.progress}%;"></div></div>
                    <button class="btn-continue" onclick="alert('Continuing ${c.title}')">Continue</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // ── Assignments ──
    function renderAssignments(filter = '') {
        const container = document.getElementById('assignmentList');
        const q = filter.toLowerCase().trim();
        const filtered = assignmentsData.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.course.toLowerCase().includes(q)
        );
        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML =
                `<div style="text-align:center;padding:2rem;color:#8a9bb8;"><i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>No assignments match “${filter}”</div>`;
            return;
        }
        const statusMap = { pending: 'Pending', done: 'Done', overdue: 'Overdue', soon: 'Soon' };
        filtered.forEach(a => {
            const div = document.createElement('div');
            div.className = 'assignment-item';
            div.innerHTML = `
                <div class="assig-info">
                    <span class="status ${a.status}">${statusMap[a.status] || 'Pending'}</span>
                    <span><strong>${a.title}</strong> · ${a.course}</span>
                </div>
                <div class="assig-due">Due ${a.due}</div>
            `;
            container.appendChild(div);
        });
    }

    // ── Schedule ──
    function renderSchedule(filter = '') {
        const container = document.getElementById('scheduleContainer');
        const q = filter.toLowerCase().trim();
        container.innerHTML = '';
        let hasMatch = false;
        scheduleData.forEach(day => {
            const events = day.events.filter(e => e.title.toLowerCase().includes(q) || e.time.toLowerCase()
                .includes(q));
            if (events.length === 0 && q !== '') return;
            hasMatch = true;
            const div = document.createElement('div');
            div.className = 'schedule-day';
            let eventsHtml = '';
            events.forEach(e => {
                eventsHtml +=
                    `<div class="event"><span>${e.title}</span><span class="time">${e.time}</span></div>`;
            });
            if (events.length === 0 && q === '') {
                eventsHtml = `<div style="color:#8a9bb8;font-size:0.8rem;padding:0.3rem 0;">No events</div>`;
            }
            div.innerHTML =
                `<div class="day-label">${day.day}</div><div class="day-events">${eventsHtml}</div>`;
            container.appendChild(div);
        });
        if (!hasMatch && q !== '') {
            container.innerHTML =
                `<div style="text-align:center;padding:2rem;color:#8a9bb8;"><i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>No events match “${filter}”</div>`;
        }
    }

    // ── Community ──
    function renderCommunity(filter = '') {
        const container = document.getElementById('communityContainer');
        const q = filter.toLowerCase().trim();
        const filtered = communityPosts.filter(p =>
            p.text.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q)
        );
        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML =
                `<div style="text-align:center;padding:2rem;color:#8a9bb8;"><i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>No posts match “${filter}”</div>`;
            return;
        }
        filtered.forEach(p => {
            const div = document.createElement('div');
            div.className = 'community-post';
            div.innerHTML = `
                <div class="post-avatar">${p.avatar}</div>
                <div class="post-content">
                    <div class="post-author">${p.author} <span>${p.time}</span></div>
                    <div class="post-text">${p.text}</div>
                    <div class="post-meta">
                        <span><i class="far fa-heart"></i> ${p.likes}</span>
                        <span><i class="far fa-comment"></i> ${p.replies}</span>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // ── Settings ──
    function renderSettings(filter = '') {
        const container = document.getElementById('settingsContainer');
        const q = filter.toLowerCase().trim();
        container.innerHTML = '';
        let hasMatch = false;
        settingsData.forEach(group => {
            const items = group.items.filter(item =>
                item.label.toLowerCase().includes(q) ||
                item.value.toLowerCase().includes(q) ||
                group.group.toLowerCase().includes(q)
            );
            if (items.length === 0 && q !== '') return;
            hasMatch = true;
            const groupDiv = document.createElement('div');
            groupDiv.className = 'settings-group';
            groupDiv.innerHTML = `<h4>${group.group}</h4>`;
            items.forEach(item => {
                const row = document.createElement('div');
                row.className = 'setting-row';
                const isOn = item.value === 'On';
                row.innerHTML = `
                    <span class="label">${item.label}</span>
                    <div style="display:flex;align-items:center;gap:0.8rem;">
                        <span class="value">${item.value}</span>
                        <div class="toggle-switch ${isOn ? 'on' : ''}" onclick="toggleSwitch(this)"></div>
                    </div>
                `;
                groupDiv.appendChild(row);
            });
            container.appendChild(groupDiv);
        });
        if (!hasMatch && q !== '') {
            container.innerHTML =
                `<div style="text-align:center;padding:2rem;color:#8a9bb8;"><i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>No settings match “${filter}”</div>`;
        }
    }

    // ─── SEARCH ─────────────────────────────────────────────

    function performSearch() {
        const query = searchInput.value;
        const page = currentPage;

        if (page === 'dashboard') {
            renderCourses(query);
            if (query.trim()) {
                viewAllLink.textContent = 'Clear filter';
            } else {
                viewAllLink.textContent = 'View all';
            }
        } else if (page === 'my-courses') {
            renderCourseList(query);
        } else if (page === 'assignments') {
            renderAssignments(query);
        } else if (page === 'schedule') {
            renderSchedule(query);
        } else if (page === 'community') {
            renderCommunity(query);
        } else if (page === 'settings') {
            renderSettings(query);
        }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 250);
    });

    // View all / Clear filter (dashboard only)
    viewAllLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage === 'dashboard') {
            if (searchInput.value.trim()) {
                searchInput.value = '';
                performSearch();
            } else {
                alert('📚 Showing all your courses.');
            }
        }
    });

    // ─── TOGGLE SWITCH (settings) ──────────────────────────

    window.toggleSwitch = function(el) {
        el.classList.toggle('on');
        const label = el.closest('.setting-row')?.querySelector('.label')?.textContent || 'Setting';
        const state = el.classList.contains('on') ? 'On' : 'Off';
        alert(`⚙️ ${label} set to ${state}`);
    };

    // ─── DROPDOWNS ──────────────────────────────────────────

    function closeAllDropdowns() {
        bellDropdown.classList.remove('open');
        helpDropdown.classList.remove('open');
        profileDropdown.classList.remove('open');
    }

    function toggleDropdown(dropdown, event) {
        event.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) dropdown.classList.add('open');
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown') && !e.target.closest('.icon-btn') && !e.target.closest('.avatar')) {
            closeAllDropdowns();
        }
    });

    bellBtn.addEventListener('click', function(e) { toggleDropdown(bellDropdown, e); });
    helpBtn.addEventListener('click', function(e) { toggleDropdown(helpDropdown, e); });
    avatarBtn.addEventListener('click', function(e) { toggleDropdown(profileDropdown, e); });

    // ─── MODAL ──────────────────────────────────────────────

    function openModal(type) {
        closeAllDropdowns();
        const map = {
            help: { title: 'Help Center',
                body: '📖 Need assistance? Visit our Help Center for guides, tutorials, and support articles. You can also reach out to our team anytime.' },
            faq: { title: 'Frequently Asked Questions',
                body: '❓ <strong>How do I enroll?</strong> — Browse courses and click “Enroll”.<br><strong>Can I get a certificate?</strong> — Yes, upon completion.<br><strong>How to contact support?</strong> — Use the Help menu.' },
            contact: { title: 'Contact Support',
                body: '📧 Email us at <strong>support@learnhub.com</strong><br>📞 Call +1 (555) 123-4567<br>🕐 Mon–Fri, 9am–6pm EST' },
            privacy: { title: 'Privacy Policy',
                body: '🔒 We respect your privacy. LearnHub collects minimal data to improve your learning experience. We never share your personal information with third parties without your explicit consent. Full policy available on request.' },
            terms: { title: 'Terms of Service',
                body: '📜 By using LearnHub, you agree to our Terms of Service. You are responsible for your account activity. All content is for educational purposes only. We reserve the right to update these terms at any time.' },
        };
        const data = map[type] || map.help;
        modalTitleText.textContent = data.title;
        modalBody.innerHTML = data.body;
        modalOverlay.classList.add('open');
    }

    function closeModal() { modalOverlay.classList.remove('open'); }

    footerHelp.addEventListener('click', function(e) { e.preventDefault();
        openModal('help'); });
    footerPrivacy.addEventListener('click', function(e) { e.preventDefault();
        openModal('privacy'); });
    footerTerms.addEventListener('click', function(e) { e.preventDefault();
        openModal('terms'); });

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
    });

    window.openModal = openModal;

    // ─── INIT ──────────────────────────────────────────────

    // start on dashboard
    navigateTo('dashboard');

})();