(function() {
    'use strict';

    // ----- data with image URLs (using picsum for professional look) -----
    const jobs = [
        { id: 1, title: 'Senior UX Designer', company: 'Google', location: 'Remote', type: 'Full-time', category: 'design', salary: '$120k – $150k', remote: true, image: 'https://picsum.photos/seed/google/200/200' },
        { id: 2, title: 'Frontend Engineer', company: 'Meta', location: 'New York, NY', type: 'Full-time', category: 'engineering', salary: '$130k – $170k', remote: false, image: 'https://picsum.photos/seed/meta/200/200' },
        { id: 3, title: 'Marketing Lead', company: 'Spotify', location: 'Austin, TX', type: 'Full-time', category: 'marketing', salary: '$100k – $130k', remote: false, image: 'https://picsum.photos/seed/spotify/200/200' },
        { id: 4, title: 'DevOps Engineer', company: 'Amazon', location: 'Remote', type: 'Remote', category: 'engineering', salary: '$140k – $180k', remote: true, image: 'https://picsum.photos/seed/amazon/200/200' },
        { id: 5, title: 'Product Designer', company: 'Figma', location: 'San Francisco, CA', type: 'Full-time', category: 'design', salary: '$125k – $155k', remote: false, image: 'https://picsum.photos/seed/figma/200/200' },
        { id: 6, title: 'Content Strategist', company: 'HubSpot', location: 'Remote', type: 'Remote', category: 'marketing', salary: '$85k – $110k', remote: true, image: 'https://picsum.photos/seed/hubspot/200/200' },
        { id: 7, title: 'Backend Engineer', company: 'Stripe', location: 'Remote', type: 'Full-time', category: 'engineering', salary: '$150k – $200k', remote: true, image: 'https://picsum.photos/seed/stripe/200/200' },
        { id: 8, title: 'Brand Designer', company: 'Airbnb', location: 'Los Angeles, CA', type: 'Full-time', category: 'design', salary: '$115k – $145k', remote: false, image: 'https://picsum.photos/seed/airbnb/200/200' },
        { id: 9, title: 'SEO Specialist', company: 'Shopify', location: 'Remote', type: 'Remote', category: 'marketing', salary: '$75k – $95k', remote: true, image: 'https://picsum.photos/seed/shopify/200/200' },
        { id: 10, title: 'Mobile Developer', company: 'Apple', location: 'Cupertino, CA', type: 'Full-time', category: 'engineering', salary: '$145k – $190k', remote: false, image: 'https://picsum.photos/seed/apple/200/200' },
        { id: 11, title: 'Creative Director', company: 'Disney', location: 'Burbank, CA', type: 'Full-time', category: 'design', salary: '$160k – $210k', remote: false, image: 'https://picsum.photos/seed/disney/200/200' },
        { id: 12, title: 'Growth Marketer', company: 'Slack', location: 'Remote', type: 'Remote', category: 'marketing', salary: '$95k – $125k', remote: true, image: 'https://picsum.photos/seed/slack/200/200' },
    ];

    // ----- DOM refs -----
    const grid = document.getElementById('jobGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const toast = document.getElementById('toast');
    const jobCount = document.getElementById('jobCount');
    const filterTags = document.querySelectorAll('.filter-tags span');
    const savedBtn = document.getElementById('savedBtn');
    const alertsBtn = document.getElementById('alertsBtn');
    const postJobBtn = document.getElementById('postJobBtn');

    // ----- state -----
    let currentFilter = 'all';
    let currentSearch = '';
    let toastTimer = null;
    let savedJobs = new Set(); // store saved job IDs

    // ----- helpers -----
    function showToast(message, duration = 2200) {
        if (toastTimer) clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // ----- render jobs -----
    function renderJobs() {
        const filtered = jobs.filter(job => {
            // filter by category
            if (currentFilter !== 'all' && job.category !== currentFilter) return false;
            // search (title, company, location)
            if (currentSearch.trim() !== '') {
                const q = currentSearch.toLowerCase().trim();
                const match = job.title.toLowerCase().includes(q) ||
                              job.company.toLowerCase().includes(q) ||
                              job.location.toLowerCase().includes(q);
                if (!match) return false;
            }
            return true;
        });

        // update count
        jobCount.textContent = `${filtered.length} jobs`;

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:3rem 1rem; color:#64748b;">
                    <i class="fas fa-search" style="font-size:2rem; opacity:0.3; margin-bottom:1rem; display:block;"></i>
                    <p style="font-size:1.1rem; font-weight:500;">No jobs found</p>
                    <p style="font-size:0.9rem; margin-top:0.3rem;">Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(job => {
            const isRemote = job.remote;
            const badgeClass = isRemote ? 'badge remote' : 'badge';
            const badgeText = isRemote ? '🌍 Remote' : job.type;
            const isSaved = savedJobs.has(job.id);

            html += `
                <div class="job-card" data-id="${job.id}">
                    <div class="card-top">
                        <img src="${job.image}" alt="${job.company} logo" class="company-logo" loading="lazy" />
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                    <h3>${job.title}</h3>
                    <div class="company-name">${job.company} · ${job.location}</div>
                    <div class="tags">
                        <span>${job.type}</span>
                        <span>${job.category}</span>
                        ${job.remote ? '<span>🌍 Remote</span>' : '<span>📍 On-site</span>'}
                    </div>
                    <div class="card-footer">
                        <div class="salary">${job.salary} <small>/ year</small></div>
                        <div class="actions">
                            <button class="save-btn ${isSaved ? 'saved' : ''}" data-id="${job.id}" aria-label="Save job">
                                <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}"></i>
                            </button>
                            <button class="apply-btn" data-id="${job.id}"><i class="fas fa-arrow-right"></i> Apply</button>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

        // attach apply listeners
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                const job = jobs.find(j => j.id === id);
                if (job) {
                    showToast(`✅ Applied to ${job.title} at ${job.company}`, 2600);
                }
            });
        });

        // attach save listeners
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                const job = jobs.find(j => j.id === id);
                if (!job) return;

                if (savedJobs.has(id)) {
                    savedJobs.delete(id);
                    showToast(`📌 Removed ${job.title} from saved`, 2000);
                } else {
                    savedJobs.add(id);
                    showToast(`💾 Saved ${job.title}`, 2000);
                }
                renderJobs(); // re-render to update icon
            });
        });
    }

    // ----- filter & search actions -----
    function setFilter(filter) {
        currentFilter = filter;
        filterTags.forEach(tag => {
            const val = tag.dataset.filter;
            if (val === filter) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
        renderJobs();
    }

    function performSearch() {
        currentSearch = searchInput.value;
        renderJobs();
    }

    // ----- event listeners -----
    // filter tags
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const filter = this.dataset.filter;
            if (filter === 'all') {
                setFilter('all');
            } else {
                setFilter(filter);
            }
        });
    });

    // search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // clear search on input empty
    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            currentSearch = '';
            renderJobs();
        }
    });

    // Header buttons - now fully functional
    postJobBtn.addEventListener('click', function() {
        showToast('📋 Opening job posting form...', 2500);
    });

    savedBtn.addEventListener('click', function() {
        if (savedJobs.size === 0) {
            showToast('📌 You have no saved jobs yet', 2000);
        } else {
            const savedCount = savedJobs.size;
            const savedNames = jobs.filter(j => savedJobs.has(j.id)).map(j => j.title).join(', ');
            showToast(`📌 ${savedCount} saved job${savedCount > 1 ? 's' : ''}: ${savedNames}`, 3500);
        }
    });

    alertsBtn.addEventListener('click', function() {
        showToast('🔔 Job alerts settings (demo)', 2200);
    });

    // ----- initial render -----
    renderJobs();

    // ----- welcome toast -----
    setTimeout(() => {
        showToast('👋 Find your dream job today!', 2000);
    }, 600);

})();