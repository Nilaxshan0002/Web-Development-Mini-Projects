(function() {
    "use strict";

    // ─── DARK MODE TOGGLE ──────────────────────────────
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    function setTheme(dark) {
        if (dark) {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
        // Update chart colors if function exists (page-specific)
        if (typeof window.__updateChartColors === 'function') {
            window.__updateChartColors();
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setTheme(true);
    } else {
        setTheme(false);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            setTheme(!isDark);
        });
    }

    // ─── DROPDOWNS ──────────────────────────────────────
    function setupDropdown(btnId, menuId) {
        const btn = document.getElementById(btnId);
        const menu = document.getElementById(menuId);
        if (!btn || !menu) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.contains('open');
            closeAllDropdowns();
            if (!isOpen) menu.classList.add('open');
        });
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    }

    setupDropdown('notifBtn', 'notifDropdown');
    setupDropdown('msgBtn', 'msgDropdown');
    setupDropdown('settingsBtn', 'settingsDropdown');
    setupDropdown('avatarBtn', 'profileDropdown');

    document.addEventListener('click', closeAllDropdowns);
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        m.addEventListener('click', (e) => e.stopPropagation());
    });

    // ─── MODAL SYSTEM ─────────────────────────────────────
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalSub = document.getElementById('modalSub');
    const modalBody = document.getElementById('modalBody');
    const modalIcon = document.getElementById('modalIcon');
    const modalActionBtn = document.getElementById('modalActionBtn');

    // Shared modal configurations
    const modalConfigs = {
        // ── Settings ──
        settingsProfile: {
            icon: 'fa-user-circle',
            title: 'Profile Settings',
            sub: 'Manage your personal information',
            body: `
                <p><strong>Name:</strong> James Davis</p>
                <p><strong>Email:</strong> james.davis@saasify.com</p>
                <p><strong>Role:</strong> Enterprise Admin</p>
                <p><strong>Member since:</strong> Jan 2024</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">You can update your profile photo, name, and contact details in the full settings panel.</p>
            `
        },
        settingsSecurity: {
            icon: 'fa-shield-alt',
            title: 'Security',
            sub: 'Password & access controls',
            body: `
                <p><strong>Password:</strong> •••••••• <span style="color:var(--primary);cursor:pointer;">Change</span></p>
                <p><strong>Two-factor auth:</strong> <span style="color:var(--positive);">Enabled</span></p>
                <p><strong>Active sessions:</strong> 3 devices</p>
                <p><strong>Last login:</strong> Today, 10:32 AM</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">Review your security settings and connected devices.</p>
            `
        },
        settingsNotif: {
            icon: 'fa-bell',
            title: 'Notification Preferences',
            sub: 'Choose what alerts you receive',
            body: `
                <p><i class="fas fa-check-circle" style="color:var(--positive);"></i> <strong>Email notifications</strong> — On</p>
                <p><i class="fas fa-check-circle" style="color:var(--positive);"></i> <strong>Push notifications</strong> — On</p>
                <p><i class="fas fa-times-circle" style="color:var(--negative);"></i> <strong>Marketing updates</strong> — Off</p>
                <p><i class="fas fa-check-circle" style="color:var(--positive);"></i> <strong>System alerts</strong> — On</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">Adjust your notification channels and frequency.</p>
            `
        },
        settingsAppearance: {
            icon: 'fa-palette',
            title: 'Appearance',
            sub: 'Theme & display preferences',
            body: `
                <p><strong>Theme:</strong> <span style="display:inline-block;background:#1a2332;color:#fff;padding:0.1rem 0.6rem;border-radius:20px;font-size:0.75rem;">Dark</span> <span style="display:inline-block;background:#f4f7fc;color:#1a2332;padding:0.1rem 0.6rem;border-radius:20px;font-size:0.75rem;border:1px solid #ddd;">Light</span> <span style="display:inline-block;background:linear-gradient(135deg,#1a2332,#f4f7fc);color:#fff;padding:0.1rem 0.6rem;border-radius:20px;font-size:0.75rem;">System</span></p>
                <p><strong>Font size:</strong> Medium</p>
                <p><strong>Sidebar:</strong> Expanded</p>
                <p><strong>Animations:</strong> Enabled</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">Customize the look and feel of your dashboard.</p>
            `
        },
        settingsLogout: {
            icon: 'fa-sign-out-alt',
            title: 'Logout',
            sub: 'Are you sure?',
            body: `<p>You are about to log out of your SaaSify account. Any unsaved changes will be lost.</p><p style="margin-top:0.4rem;color:var(--negative);">Confirm to continue.</p>`,
            actionLabel: 'Yes, Logout',
            actionDanger: true
        },
        // ── Profile ──
        profileMy: {
            icon: 'fa-user-circle',
            title: 'My Profile',
            sub: 'James Davis · Enterprise Admin',
            body: `
                <p><strong>Full name:</strong> James Davis</p>
                <p><strong>Email:</strong> james.davis@saasify.com</p>
                <p><strong>Company:</strong> SaaSify Inc.</p>
                <p><strong>Role:</strong> Enterprise Administrator</p>
                <p><strong>Location:</strong> San Francisco, CA</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">View and edit your complete profile information.</p>
            `
        },
        profileBilling: {
            icon: 'fa-credit-card',
            title: 'Billing & Subscription',
            sub: 'Manage your payment methods',
            body: `
                <p><strong>Plan:</strong> Pro Enterprise</p>
                <p><strong>Billing cycle:</strong> Monthly ($99/mo)</p>
                <p><strong>Next invoice:</strong> Oct 15, 2026</p>
                <p><strong>Payment method:</strong> Visa ending in 4242</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">Update your billing information and view invoice history.</p>
            `
        },
        profilePrefs: {
            icon: 'fa-sliders-h',
            title: 'Preferences',
            sub: 'Customize your experience',
            body: `
                <p><strong>Language:</strong> English (US)</p>
                <p><strong>Timezone:</strong> America/Los_Angeles</p>
                <p><strong>Date format:</strong> MM/DD/YYYY</p>
                <p><strong>Dashboard layout:</strong> Compact</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">Set your personal preferences for the platform.</p>
            `
        },
        profileHelp: {
            icon: 'fa-question-circle',
            title: 'Help Center',
            sub: 'Support & documentation',
            body: `
                <p><strong>📚 Documentation:</strong> <a href="#" style="color:var(--primary);text-decoration:none;">Read the docs</a></p>
                <p><strong>🎥 Video tutorials:</strong> <a href="#" style="color:var(--primary);text-decoration:none;">Watch now</a></p>
                <p><strong>💬 Live chat:</strong> Available 24/7</p>
                <p><strong>📧 Email support:</strong> support@saasify.com</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">Get help with any question or issue you encounter.</p>
            `
        },
        profileSignout: {
            icon: 'fa-sign-out-alt',
            title: 'Sign Out',
            sub: 'Are you sure you want to leave?',
            body: `<p>You are about to sign out of your account. You'll need to log in again to access your dashboard.</p><p style="margin-top:0.4rem;color:var(--negative);">Confirm to sign out.</p>`,
            actionLabel: 'Yes, Sign Out',
            actionDanger: true
        },
        // ── Notifications ──
        notif1: {
            icon: 'fa-user-plus',
            title: 'New Follower',
            sub: 'Sarah K. followed you',
            body: `<p>Sarah K. started following your activity. You can now see their updates in your feed.</p><p style="font-size:0.8rem;color:var(--text-muted);">2 minutes ago</p>`
        },
        notif2: {
            icon: 'fa-rocket',
            title: 'Plan Updated',
            sub: 'Pro plan changes',
            body: `<p>Your Pro plan has been updated with new features. Check out the latest improvements in the dashboard.</p><p style="font-size:0.8rem;color:var(--text-muted);">15 minutes ago</p>`
        },
        notif3: {
            icon: 'fa-check-circle',
            title: 'Payment Received',
            sub: 'Invoice #INV-2026-0012',
            body: `<p>Your payment of $99.00 has been successfully processed. Receipt has been sent to your email.</p><p style="font-size:0.8rem;color:var(--text-muted);">1 hour ago</p>`
        },
        // ── Messages ──
        msg1: {
            icon: 'fa-envelope',
            title: 'Emily Chen',
            sub: 'Can you review the latest proposal?',
            body: `<p>Hi James, the Q4 proposal is ready for your review. Please take a look when you have a moment.</p><p style="font-size:0.8rem;color:var(--text-muted);">1 hour ago</p>`
        },
        msg2: {
            icon: 'fa-envelope',
            title: 'Michael Rodriguez',
            sub: 'Thanks for your feedback',
            body: `<p>James, thanks for the quick feedback on the design mockups. I've made the adjustments you suggested.</p><p style="font-size:0.8rem;color:var(--text-muted);">3 hours ago</p>`
        },
        msg3: {
            icon: 'fa-envelope',
            title: 'David Kim',
            sub: 'Meeting at 4pm today',
            body: `<p>Just a reminder that we have the team sync at 4pm in the boardroom. See you there!</p><p style="font-size:0.8rem;color:var(--text-muted);">5 hours ago</p>`
        },
        // ── Footer ──
        privacy: {
            icon: 'fa-shield-alt',
            title: 'Privacy Policy',
            sub: 'How we protect your data',
            body: `<p>We take your privacy seriously. This policy describes how we collect, use, and protect your personal data.</p>
                   <p>We never sell your data to third parties. All information is encrypted and stored securely in compliance with GDPR and CCPA.</p>
                   <p>You can request to view, edit, or delete your data at any time through your account settings.</p>`
        },
        terms: {
            icon: 'fa-file-contract',
            title: 'Terms of Service',
            sub: 'Agreement between you and SaaSify',
            body: `<p>By using SaaSify, you agree to our terms of service. These terms govern your use of our platform and services.</p>
                   <p>You are responsible for maintaining the security of your account and for all activities that occur under your account.</p>
                   <p>We reserve the right to update these terms at any time. Continued use constitutes acceptance of the updated terms.</p>`
        },
        support: {
            icon: 'fa-headset',
            title: 'Support Center',
            sub: 'We\'re here to help',
            body: `<p>Our support team is here to help you 24/7. Reach out via email, live chat, or phone.</p>
                   <p><strong>Email:</strong> support@saasify.com</p>
                   <p><strong>Live Chat:</strong> Available on our website</p>
                   <p><strong>Phone:</strong> +1 (800) 555-0199</p>
                   <p style="margin-top:0.6rem;">Average response time: &lt; 2 hours.</p>`
        },
        // ── Special ──
        markRead: {
            icon: 'fa-check-double',
            title: 'All Clear!',
            sub: 'Notifications marked as read',
            body: `<p>All notifications have been marked as read. You're all caught up! 🎉</p>`
        },
        viewAllMsg: {
            icon: 'fa-inbox',
            title: 'Full Inbox',
            sub: 'All your messages',
            body: `<p>You have 12 unread messages across 4 conversations.</p>
                   <p><strong>Latest:</strong> Emily Chen, Michael Rodriguez, David Kim, Sarah K.</p>
                   <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.6rem;">Open your full message center to reply and manage conversations.</p>`
        },
        upgrade: {
            icon: 'fa-rocket',
            title: 'Upgrade Your Plan',
            sub: 'Choose the best plan for your team',
            body: `
                <p><strong>🚀 Pro Enterprise</strong> — <span style="color:var(--primary);">Current plan</span></p>
                <p style="margin-left:1.2rem;">✓ Advanced analytics & reporting</p>
                <p style="margin-left:1.2rem;">✓ Priority support 24/7</p>
                <p style="margin-left:1.2rem;">✓ Unlimited projects</p>
                <hr style="border-color:var(--border-color);margin:0.8rem 0;">
                <p><strong>💎 Ultimate</strong> — $199/mo</p>
                <p style="margin-left:1.2rem;">✓ Everything in Pro Enterprise</p>
                <p style="margin-left:1.2rem;">✓ Dedicated account manager</p>
                <p style="margin-left:1.2rem;">✓ Custom integrations</p>
                <p style="margin-top:0.8rem;font-size:0.85rem;color:var(--text-muted);">Contact sales for a custom quote.</p>
            `,
            actionLabel: 'Contact Sales'
        }
    };

    function openModal(key) {
        const config = modalConfigs[key];
        if (!config) return;

        modalIcon.innerHTML = `<i class="fas ${config.icon}"></i>`;
        modalTitle.textContent = config.title;
        modalSub.textContent = config.sub || '';
        modalBody.innerHTML = config.body;

        const label = config.actionLabel || 'Got it';
        modalActionBtn.textContent = label;
        modalActionBtn.className = 'modal-action-btn';
        if (config.actionDanger) {
            modalActionBtn.classList.add('danger');
        } else {
            modalActionBtn.classList.remove('danger');
        }
        modalActionBtn.dataset.actionKey = key;

        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (modalActionBtn) {
        modalActionBtn.addEventListener('click', function() {
            const key = this.dataset.actionKey;
            if (key === 'settingsLogout' || key === 'profileSignout') {
                if (confirm('Are you sure you want to sign out?')) {
                    alert('You have been signed out.');
                    closeModal();
                    closeAllDropdowns();
                }
                return;
            }
            if (key === 'upgrade') {
                alert('🚀 Our sales team will contact you shortly with more details.');
                closeModal();
                closeAllDropdowns();
                return;
            }
            closeModal();
            closeAllDropdowns();
        });
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ─── DROPDOWN ITEM CLICK HANDLER ─────────────────────
    document.querySelectorAll('.drop-item, .drop-footer').forEach(el => {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.dataset.action;

            if (action === 'settingsLogout' || action === 'profileSignout') {
                closeAllDropdowns();
                openModal(action);
                return;
            }

            if (action === 'markRead') {
                const badge = document.getElementById('notifBadge');
                if (badge) {
                    badge.textContent = '0';
                    badge.classList.remove('pulse');
                }
                closeAllDropdowns();
                openModal('markRead');
                return;
            }

            if (action === 'viewAllMsg') {
                closeAllDropdowns();
                openModal('viewAllMsg');
                return;
            }

            if (action && (action.startsWith('settings') || action.startsWith('profile') || action.startsWith('notif') || action.startsWith('msg'))) {
                closeAllDropdowns();
                openModal(action);
                return;
            }

            // Fallback by text (for generic menu items)
            const text = this.textContent.trim();
            if (text.includes('Profile') && !text.includes('My Profile')) {
                closeAllDropdowns();
                openModal('settingsProfile');
                return;
            }
            if (text.includes('My Profile')) {
                closeAllDropdowns();
                openModal('profileMy');
                return;
            }
            if (text.includes('Billing')) {
                closeAllDropdowns();
                openModal('profileBilling');
                return;
            }
            if (text.includes('Preferences')) {
                closeAllDropdowns();
                openModal('profilePrefs');
                return;
            }
            if (text.includes('Help Center')) {
                closeAllDropdowns();
                openModal('profileHelp');
                return;
            }
            if (text.includes('Security')) {
                closeAllDropdowns();
                openModal('settingsSecurity');
                return;
            }
            if (text.includes('Appearance')) {
                closeAllDropdowns();
                openModal('settingsAppearance');
                return;
            }

            closeAllDropdowns();
        });
    });

    // ─── UPGRADE BUTTON ────────────────────────────────────
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllDropdowns();
            openModal('upgrade');
        });
    }

    // ─── FOOTER LINKS ─────────────────────────────────────
    document.getElementById('privacyLink')?.addEventListener('click', () => openModal('privacy'));
    document.getElementById('termsLink')?.addEventListener('click', () => openModal('terms'));
    document.getElementById('supportLink')?.addEventListener('click', () => openModal('support'));

    // ─── SIDEBAR NAV CLICK ──────────────────────────────
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Allow navigation to other pages; active class will be set per page
            // Just prevent default if it's same page (hash)
            if (this.getAttribute('href') === '#') e.preventDefault();
        });
    });

    // ─── CLOSE DROPDOWNS ON SCROLL ──────────────────────
    window.addEventListener('scroll', closeAllDropdowns);

})();