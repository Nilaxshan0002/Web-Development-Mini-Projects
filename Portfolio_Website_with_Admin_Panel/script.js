(function() {
  "use strict";

  // ============================================================
  // DATA HELPERS (localStorage)
  // ============================================================
  function getData(key, defaultVal) {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // ---------- Projects ----------
  function getProjects() {
    return getData('projects', [
      { id:1, title:"EcoShop Platform", category:"Web Design", status:"Published", date:"2026-07-15" },
      { id:2, title:"HealthTrack App", category:"Mobile", status:"Published", date:"2026-07-10" },
      { id:3, title:"Brand Identity Kit", category:"Branding", status:"Draft", date:"2026-07-05" },
      { id:4, title:"Analytics Dashboard", category:"Development", status:"Published", date:"2026-06-28" },
      { id:5, title:"Landing Page Redesign", category:"UI/UX", status:"Draft", date:"2026-06-20" }
    ]);
  }
  function saveProjects(p) { setData('projects', p); }

  // ---------- Media ----------
  function getMedia() {
    return getData('mediaItems', [
      { id:1, name:"project-thumbnail-1.jpg", type:"image", date:"2026-07-14", imageUrl:"https://picsum.photos/seed/project-thumb/400/300" },
      { id:2, name:"logo-design-final.png", type:"image", date:"2026-07-12", imageUrl:"https://picsum.photos/seed/logo-design/400/300" },
      { id:3, name:"dashboard-mockup.pdf", type:"document", date:"2026-07-08", imageUrl:"https://picsum.photos/seed/dashboard-mockup/400/300" },
      { id:4, name:"hero-background.jpg", type:"image", date:"2026-07-05", imageUrl:"https://picsum.photos/seed/hero-bg/400/300" }
    ]);
  }
  function saveMedia(m) { setData('mediaItems', m); }

  // ---------- Blog ----------
  function getBlogPosts() {
    return getData('blogPosts', [
      { id:1, title:"Design Trends 2026", category:"Design", status:"Published", date:"2026-07-16" },
      { id:2, title:"Why UX Matters", category:"Development", status:"Draft", date:"2026-07-12" },
      { id:3, title:"Remote Work Tips", category:"Business", status:"Published", date:"2026-07-08" }
    ]);
  }
  function saveBlogPosts(p) { setData('blogPosts', p); }

  // ---------- Clients ----------
  function getClients() {
    return getData('clients', [
      { id:1, name:"John Doe", company:"TechStart", status:"Active", date:"2026-07-14" },
      { id:2, name:"Jane Smith", company:"DesignLab", status:"Inactive", date:"2026-07-10" },
      { id:3, name:"Bob Johnson", company:"WebWorks", status:"Active", date:"2026-07-05" }
    ]);
  }
  function saveClients(c) { setData('clients', c); }

  // ---------- Settings ----------
  function getSettings() {
    return getData('settings', {
      profileName:"James Davis",
      profileEmail:"james@portfolio.plus",
      profileRole:"Administrator",
      siteTitle:"Portfolio+ Admin",
      defaultStatus:"Draft",
      itemsPerPage:"10"
    });
  }
  function saveSettings(s) { setData('settings', s); }

  // ============================================================
  // GLOBALS
  // ============================================================
  let projects = getProjects();
  let mediaItems = getMedia();
  let blogPosts = getBlogPosts();
  let clients = getClients();
  let settings = getSettings();

  let nextProjectId = projects.length ? Math.max(...projects.map(p=>p.id)) + 1 : 1;
  let nextMediaId = mediaItems.length ? Math.max(...mediaItems.map(m=>m.id)) + 1 : 1;
  let nextBlogId = blogPosts.length ? Math.max(...blogPosts.map(p=>p.id)) + 1 : 1;
  let nextClientId = clients.length ? Math.max(...clients.map(c=>c.id)) + 1 : 1;

  // DOM refs
  const toast = document.getElementById('toast');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalBody = document.getElementById('modalBody');
  const saveModalBtn = document.getElementById('saveModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const sidebar = document.getElementById('sidebar');
  const mobileToggle = document.getElementById('mobileToggle');

  let currentModalMode = null; // 'project','media','blog','client'
  let editingId = null;

  // ============================================================
  // TOAST
  // ============================================================
  let toastTimeout = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  const sectionNames = ['dashboard','portfolio','media','blog','clients','settings'];
  const sections = {};
  sectionNames.forEach(s => {
    sections[s] = document.getElementById('section-'+s);
  });

  function showSection(section) {
    sectionNames.forEach(s => {
      sections[s].classList.toggle('active', s === section);
    });
    // update sidebar active
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.classList.toggle('active', link.dataset.section === section);
    });
    // update heading
    const titleMap = {
      dashboard:'Dashboard',
      portfolio:'Portfolio Management',
      media:'Media Library',
      blog:'Blog Posts',
      clients:'Clients',
      settings:'Settings'
    };
    const iconMap = {
      dashboard:'fa-briefcase',
      portfolio:'fa-folder-open',
      media:'fa-image',
      blog:'fa-file-alt',
      clients:'fa-users',
      settings:'fa-cog'
    };
    document.getElementById('pageTitle').innerHTML =
      `<i class="fas ${iconMap[section]}" style="color:#4f6ef7; margin-right:0.5rem;"></i> ${titleMap[section]}`;

    // update top actions
    const actionsContainer = document.getElementById('topActions');
    actionsContainer.innerHTML = '';
    if (section === 'dashboard') {
      actionsContainer.innerHTML = `
        <button class="btn-primary" id="dashboardAddProject"><i class="fas fa-plus"></i> Add Project</button>
        <button id="previewBtn"><i class="fas fa-eye"></i> Preview</button>
      `;
      document.getElementById('dashboardAddProject')?.addEventListener('click', () => openModal('project','add'));
      document.getElementById('previewBtn')?.addEventListener('click', function() {
        const publishedCount = projects.filter(p => p.status === 'Published').length;
        showToast(`👀 Preview mode · ${publishedCount} published projects`);
      });
    } else if (section === 'portfolio') {
      actionsContainer.innerHTML = `<button class="btn-primary" id="portfolioAddProject"><i class="fas fa-plus"></i> Add Project</button>`;
      document.getElementById('portfolioAddProject')?.addEventListener('click', () => openModal('project','add'));
    } else if (section === 'media') {
      actionsContainer.innerHTML = `<button class="btn-primary" id="uploadBtn"><i class="fas fa-upload"></i> Upload</button>`;
      document.getElementById('uploadBtn')?.addEventListener('click', uploadMedia);
    } else if (section === 'blog') {
      actionsContainer.innerHTML = `<button class="btn-primary" id="blogAddPost"><i class="fas fa-plus"></i> New Post</button>`;
      document.getElementById('blogAddPost')?.addEventListener('click', () => openModal('blog','add'));
    } else if (section === 'clients') {
      actionsContainer.innerHTML = `<button class="btn-primary" id="clientsAddClient"><i class="fas fa-plus"></i> Add Client</button>`;
      document.getElementById('clientsAddClient')?.addEventListener('click', () => openModal('client','add'));
    } else if (section === 'settings') {
      actionsContainer.innerHTML = `<button class="btn-primary" id="saveSettingsBtn"><i class="fas fa-save"></i> Save Settings</button>`;
      document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettingsHandler);
    }
  }

  // Sidebar links
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      showSection(section);
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
      // render relevant data on switch
      if (section === 'dashboard') renderDashboard();
      else if (section === 'portfolio') renderPortfolioTable();
      else if (section === 'media') renderMedia();
      else if (section === 'blog') renderBlogTable();
      else if (section === 'clients') renderClientsTable();
      else if (section === 'settings') populateSettings();
    });
  });

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // ----- Dashboard -----
  function renderDashboard() {
    // stats
    document.getElementById('totalProjects').textContent = projects.length;
    const published = projects.filter(p => p.status === 'Published').length;
    document.getElementById('publishedProjects').textContent = published;
    document.getElementById('publishedCount').textContent = published;

    // featured grid
    const grid = document.getElementById('portfolioGrid');
    const featured = projects.filter(p => p.status === 'Published').slice(0, 4);
    grid.innerHTML = '';
    featured.forEach(p => {
      const div = document.createElement('div');
      div.className = 'stat-card';
      const iconMap = { 'Web Design':'fa-laptop-code', 'Development':'fa-code', 'UI/UX':'fa-paint-brush', 'Branding':'fa-pen-fancy', 'Mobile':'fa-mobile-alt' };
      const icon = iconMap[p.category] || 'fa-folder';
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;">
          <i class="fas ${icon}" style="color:#4f6ef7;font-size:1.2rem;"></i>
          <strong style="font-size:0.95rem;">${p.title}</strong>
        </div>
        <div style="font-size:0.75rem;color:#6b7f9e;display:flex;justify-content:space-between;">
          <span>${p.category}</span><span>${p.date}</span>
        </div>
        <div style="margin-top:0.5rem;display:flex;gap:0.4rem;">
          <button class="view-btn" data-id="${p.id}" style="background:transparent;border:1px solid #dce5f5;padding:0.15rem 0.8rem;border-radius:20px;font-size:0.7rem;cursor:pointer;font-family:'Inter',sans-serif;color:#5a6e8a;transition:0.2s;">View</button>
          <button class="edit-btn-feat" data-id="${p.id}" style="background:transparent;border:1px solid #dce5f5;padding:0.15rem 0.8rem;border-radius:20px;font-size:0.7rem;cursor:pointer;font-family:'Inter',sans-serif;color:#5a6e8a;transition:0.2s;">Edit</button>
        </div>
      `;
      grid.appendChild(div);
    });
    // bind view/edit for featured
    document.querySelectorAll('#portfolioGrid .view-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = Number(this.dataset.id);
        const p = projects.find(x => x.id === id);
        if (p) showToast(`🔍 Viewing: ${p.title} (${p.category})`);
      });
    });
    document.querySelectorAll('#portfolioGrid .edit-btn-feat').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = Number(this.dataset.id);
        const p = projects.find(x => x.id === id);
        if (p) openModal('project','edit', p);
      });
    });
    // click on whole card
    document.querySelectorAll('#portfolioGrid .stat-card').forEach((card, idx) => {
      card.addEventListener('click', function() {
        const featuredList = projects.filter(p => p.status === 'Published').slice(0,4);
        const p = featuredList[idx];
        if (p) showToast(`📁 ${p.title} · ${p.category} · ${p.status}`);
      });
    });

    // all projects table (dashboard)
    renderProjectsTable('projectsTableBody', true);
  }

  // ----- Projects Table (shared) -----
  function renderProjectsTable(tbodyId, isDashboard) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    projects.forEach(p => {
      const tr = document.createElement('tr');
      const statusClass = p.status === 'Published' ? 'published' : 'draft';
      tr.innerHTML = `
        <td><strong>${p.title}</strong></td>
        <td>${p.category}</td>
        <td><span class="status-badge ${statusClass}">${p.status}</span></td>
        <td>${p.date}</td>
        <td style="text-align:right;">
          <div class="action-btns" style="justify-content:flex-end;">
            <button class="edit-btn" data-id="${p.id}"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    // bind events
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = Number(this.dataset.id);
        if (confirm('Delete this project?')) {
          projects = projects.filter(p => p.id !== id);
          saveProjects(projects);
          renderAllSections();
          showToast('🗑️ Project deleted');
        }
      });
    });
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = Number(this.dataset.id);
        const p = projects.find(x => x.id === id);
        if (p) openModal('project','edit', p);
      });
    });
  }

  // ----- Portfolio Table (full page) -----
  function renderPortfolioTable() {
    renderProjectsTable('portfolioTableBody', false);
  }

  // ----- Media -----
  function renderMedia() {
    const grid = document.getElementById('mediaGrid');
    grid.innerHTML = '';
    if (mediaItems.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:#6b7f9e;"><i class="fas fa-folder-open" style="font-size:2.4rem;color:#dce5f5;display:block;margin-bottom:0.5rem;"></i><p style="font-weight:500;">No media files</p></div>`;
      document.getElementById('mediaCount').textContent = '0 items';
      return;
    }
    mediaItems.forEach(m => {
      const div = document.createElement('div');
      div.className = 'media-item';
      const badgeClass = m.type === 'pdf' ? 'pdf' : m.type === 'document' ? 'document' : 'image';
      const displayType = m.type === 'document' ? 'PDF' : m.type.toUpperCase();
      div.innerHTML = `
        <div class="media-thumb">
          <img src="${m.imageUrl}" alt="${m.name}" loading="lazy" />
          <span class="type-badge ${badgeClass}">${displayType}</span>
        </div>
        <div class="media-body">
          <div class="media-name" title="${m.name}">${m.name}</div>
          <div class="media-meta">${m.date}</div>
          <div class="media-actions">
            <button class="view-media" data-id="${m.id}"><i class="fas fa-eye"></i> View</button>
            <button class="delete-media" data-id="${m.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `;
      grid.appendChild(div);
    });
    document.querySelectorAll('.delete-media').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = Number(this.dataset.id);
        if (confirm('Delete this media?')) {
          mediaItems = mediaItems.filter(m => m.id !== id);
          saveMedia(mediaItems);
          renderMedia();
          showToast('🗑️ Media deleted');
        }
      });
    });
    document.querySelectorAll('.view-media').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = Number(this.dataset.id);
        const item = mediaItems.find(m => m.id === id);
        if (item) showToast(`🔍 Viewing: ${item.name}`);
      });
    });
    document.querySelectorAll('.media-item').forEach(item => {
      item.addEventListener('click', function() {
        const id = Number(this.querySelector('.view-media')?.dataset.id);
        if (id) {
          const found = mediaItems.find(m => m.id === id);
          if (found) showToast(`📁 ${found.name}`);
        }
      });
    });
    document.getElementById('mediaCount').textContent = mediaItems.length + ' items';
  }

  function uploadMedia() {
    const fakeName = 'upload-' + Date.now() + '.png';
    mediaItems.push({
      id: nextMediaId++,
      name: fakeName,
      type: 'image',
      date: new Date().toISOString().slice(0,10),
      imageUrl: 'https://picsum.photos/seed/' + Date.now() + '/400/300'
    });
    saveMedia(mediaItems);
    renderMedia();
    showToast('📤 Uploaded: ' + fakeName);
  }

  // ----- Blog -----
  function renderBlogTable() {
    const tbody = document.getElementById('blogTableBody');
    tbody.innerHTML = '';
    blogPosts.forEach(p => {
      const tr = document.createElement('tr');
      const statusClass = p.status === 'Published' ? 'published' : 'draft';
      tr.innerHTML = `
        <td><strong>${p.title}</strong></td>
        <td>${p.category}</td>
        <td><span class="status-badge ${statusClass}">${p.status}</span></td>
        <td>${p.date}</td>
        <td style="text-align:right;">
          <div class="action-btns" style="justify-content:flex-end;">
            <button class="edit-blog" data-id="${p.id}"><i class="fas fa-edit"></i></button>
            <button class="delete-blog" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.delete-blog').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = Number(this.dataset.id);
        if (confirm('Delete this post?')) {
          blogPosts = blogPosts.filter(p => p.id !== id);
          saveBlogPosts(blogPosts);
          renderBlogTable();
          showToast('🗑️ Post deleted');
        }
      });
    });
    tbody.querySelectorAll('.edit-blog').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = Number(this.dataset.id);
        const p = blogPosts.find(x => x.id === id);
        if (p) openModal('blog','edit', p);
      });
    });
  }

  // ----- Clients -----
  function renderClientsTable() {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    clients.forEach(c => {
      const tr = document.createElement('tr');
      const statusClass = c.status === 'Active' ? 'active' : 'inactive';
      tr.innerHTML = `
        <td><strong>${c.name}</strong></td>
        <td>${c.company}</td>
        <td><span class="status-badge ${statusClass}">${c.status}</span></td>
        <td>${c.date}</td>
        <td style="text-align:right;">
          <div class="action-btns" style="justify-content:flex-end;">
            <button class="edit-client" data-id="${c.id}"><i class="fas fa-edit"></i></button>
            <button class="delete-client" data-id="${c.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.delete-client').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = Number(this.dataset.id);
        if (confirm('Delete this client?')) {
          clients = clients.filter(c => c.id !== id);
          saveClients(clients);
          renderClientsTable();
          showToast('🗑️ Client deleted');
        }
      });
    });
    tbody.querySelectorAll('.edit-client').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = Number(this.dataset.id);
        const c = clients.find(x => x.id === id);
        if (c) openModal('client','edit', c);
      });
    });
  }

  // ----- Settings -----
  function populateSettings() {
    document.getElementById('profileName').value = settings.profileName || '';
    document.getElementById('profileEmail').value = settings.profileEmail || '';
    document.getElementById('profileRole').value = settings.profileRole || '';
    document.getElementById('siteTitle').value = settings.siteTitle || '';
    document.getElementById('defaultStatus').value = settings.defaultStatus || 'Draft';
    document.getElementById('itemsPerPage').value = settings.itemsPerPage || '10';
  }

  function saveSettingsHandler() {
    settings.profileName = document.getElementById('profileName').value.trim();
    settings.profileEmail = document.getElementById('profileEmail').value.trim();
    settings.profileRole = document.getElementById('profileRole').value.trim();
    settings.siteTitle = document.getElementById('siteTitle').value.trim();
    settings.defaultStatus = document.getElementById('defaultStatus').value;
    settings.itemsPerPage = document.getElementById('itemsPerPage').value;
    saveSettings(settings);
    showToast('✅ Settings saved');
  }

  // ============================================================
  // MODAL SYSTEM
  // ============================================================
  function openModal(type, mode, data) {
    currentModalMode = type;
    editingId = null;
    modalBody.innerHTML = '';
    if (type === 'project') {
      modalTitle.textContent = mode === 'add' ? 'Add New Project' : 'Edit Project';
      modalDesc.textContent = mode === 'add' ? 'Fill in the details to add a new project.' : 'Update the project details.';
      modalBody.innerHTML = `
        <div class="form-group"><label>Project Title</label><input type="text" id="modalProjectTitle" placeholder="e.g. E-commerce Platform" value="${data ? data.title : ''}" /></div>
        <div class="form-group"><label>Category</label>
          <select id="modalProjectCategory">
            <option value="Web Design" ${data && data.category==='Web Design'?'selected':''}>Web Design</option>
            <option value="Development" ${data && data.category==='Development'?'selected':''}>Development</option>
            <option value="UI/UX" ${data && data.category==='UI/UX'?'selected':''}>UI/UX</option>
            <option value="Branding" ${data && data.category==='Branding'?'selected':''}>Branding</option>
            <option value="Mobile" ${data && data.category==='Mobile'?'selected':''}>Mobile App</option>
          </select>
        </div>
        <div class="form-group"><label>Status</label>
          <select id="modalProjectStatus">
            <option value="Published" ${data && data.status==='Published'?'selected':''}>Published</option>
            <option value="Draft" ${data && data.status==='Draft'?'selected':''}>Draft</option>
          </select>
        </div>
      `;
      if (data) editingId = data.id;
      saveModalBtn.onclick = function() {
        const title = document.getElementById('modalProjectTitle').value.trim();
        const category = document.getElementById('modalProjectCategory').value;
        const status = document.getElementById('modalProjectStatus').value;
        if (!title) { alert('Please enter a title.'); return; }
        const date = new Date().toISOString().slice(0,10);
        if (editingId !== null) {
          const p = projects.find(x => x.id === editingId);
          if (p) { p.title = title; p.category = category; p.status = status; }
          showToast('✏️ Project updated');
        } else {
          projects.push({ id: nextProjectId++, title, category, status, date });
          showToast('✅ Project added');
        }
        saveProjects(projects);
        closeModal();
        renderAllSections();
      };
    } else if (type === 'blog') {
      modalTitle.textContent = mode === 'add' ? 'Add New Post' : 'Edit Post';
      modalDesc.textContent = mode === 'add' ? 'Create a new blog post.' : 'Update the post.';
      modalBody.innerHTML = `
        <div class="form-group"><label>Post Title</label><input type="text" id="modalBlogTitle" placeholder="e.g. Design Trends" value="${data ? data.title : ''}" /></div>
        <div class="form-group"><label>Category</label>
          <select id="modalBlogCategory">
            <option value="Design" ${data && data.category==='Design'?'selected':''}>Design</option>
            <option value="Development" ${data && data.category==='Development'?'selected':''}>Development</option>
            <option value="Business" ${data && data.category==='Business'?'selected':''}>Business</option>
            <option value="Personal" ${data && data.category==='Personal'?'selected':''}>Personal</option>
          </select>
        </div>
        <div class="form-group"><label>Status</label>
          <select id="modalBlogStatus">
            <option value="Published" ${data && data.status==='Published'?'selected':''}>Published</option>
            <option value="Draft" ${data && data.status==='Draft'?'selected':''}>Draft</option>
          </select>
        </div>
      `;
      if (data) editingId = data.id;
      saveModalBtn.onclick = function() {
        const title = document.getElementById('modalBlogTitle').value.trim();
        const category = document.getElementById('modalBlogCategory').value;
        const status = document.getElementById('modalBlogStatus').value;
        if (!title) { alert('Please enter a title.'); return; }
        const date = new Date().toISOString().slice(0,10);
        if (editingId !== null) {
          const p = blogPosts.find(x => x.id === editingId);
          if (p) { p.title = title; p.category = category; p.status = status; }
          showToast('✏️ Post updated');
        } else {
          blogPosts.push({ id: nextBlogId++, title, category, status, date });
          showToast('✅ Post added');
        }
        saveBlogPosts(blogPosts);
        closeModal();
        renderBlogTable();
        if (document.getElementById('section-dashboard').classList.contains('active')) renderDashboard();
      };
    } else if (type === 'client') {
      modalTitle.textContent = mode === 'add' ? 'Add New Client' : 'Edit Client';
      modalDesc.textContent = mode === 'add' ? 'Enter client details.' : 'Update client information.';
      modalBody.innerHTML = `
        <div class="form-group"><label>Client Name</label><input type="text" id="modalClientName" placeholder="e.g. John Doe" value="${data ? data.name : ''}" /></div>
        <div class="form-group"><label>Company</label><input type="text" id="modalClientCompany" placeholder="e.g. TechStart" value="${data ? data.company : ''}" /></div>
        <div class="form-group"><label>Status</label>
          <select id="modalClientStatus">
            <option value="Active" ${data && data.status==='Active'?'selected':''}>Active</option>
            <option value="Inactive" ${data && data.status==='Inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
      `;
      if (data) editingId = data.id;
      saveModalBtn.onclick = function() {
        const name = document.getElementById('modalClientName').value.trim();
        const company = document.getElementById('modalClientCompany').value.trim();
        const status = document.getElementById('modalClientStatus').value;
        if (!name) { alert('Please enter a name.'); return; }
        const date = new Date().toISOString().slice(0,10);
        if (editingId !== null) {
          const c = clients.find(x => x.id === editingId);
          if (c) { c.name = name; c.company = company; c.status = status; }
          showToast('✏️ Client updated');
        } else {
          clients.push({ id: nextClientId++, name, company, status, date });
          showToast('✅ Client added');
        }
        saveClients(clients);
        closeModal();
        renderClientsTable();
        if (document.getElementById('section-dashboard').classList.contains('active')) renderDashboard();
      };
    } else {
      return;
    }
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    editingId = null;
    currentModalMode = null;
  }

  // ============================================================
  // RENDER ALL SECTIONS (after data changes)
  // ============================================================
  function renderAllSections() {
    let activeSection = 'dashboard';
    sectionNames.forEach(s => {
      if (sections[s].classList.contains('active')) activeSection = s;
    });
    if (activeSection === 'dashboard') renderDashboard();
    else if (activeSection === 'portfolio') renderPortfolioTable();
    else if (activeSection === 'media') renderMedia();
    else if (activeSection === 'blog') renderBlogTable();
    else if (activeSection === 'clients') renderClientsTable();
    else if (activeSection === 'settings') populateSettings();
  }

  // ============================================================
  // EVENT BINDINGS (global)
  // ============================================================
  closeModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    if (e.key === 'Enter' && modalOverlay.classList.contains('active')) {
      saveModalBtn.click();
    }
  });

  // Upload zone (media)
  document.getElementById('uploadZone')?.addEventListener('click', uploadMedia);
  document.getElementById('uploadZone')?.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = '#4f6ef7';
    this.style.background = '#f0f4fe';
  });
  document.getElementById('uploadZone')?.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.style.borderColor = '#dce5f5';
    this.style.background = 'transparent';
  });
  document.getElementById('uploadZone')?.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = '#dce5f5';
    this.style.background = 'transparent';
    uploadMedia();
  });

  // User card
  document.getElementById('userCard')?.addEventListener('click', function() {
    showToast('👤 James Davis · Admin · Portfolio+');
  });

  // Footer links
  document.getElementById('docLink')?.addEventListener('click', function(e) { e.preventDefault(); showToast('📄 Documentation — coming soon'); });
  document.getElementById('supportLink')?.addEventListener('click', function(e) { e.preventDefault(); showToast('💬 Support — contact@portfolio.plus'); });
  document.getElementById('privacyLink')?.addEventListener('click', function(e) { e.preventDefault(); showToast('🔒 Privacy Policy — updated 2026'); });

  // Mobile toggle
  mobileToggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
  });
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && e.target !== mobileToggle && !mobileToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });

  // ============================================================
  // INIT
  // ============================================================
  showSection('dashboard');
  renderDashboard();

  // Cross-tab sync
  window.addEventListener('storage', function(e) {
    if (e.key === 'projects' || e.key === 'mediaItems' || e.key === 'blogPosts' || e.key === 'clients' || e.key === 'settings') {
      projects = getProjects();
      mediaItems = getMedia();
      blogPosts = getBlogPosts();
      clients = getClients();
      settings = getSettings();
      renderAllSections();
    }
  });

})();