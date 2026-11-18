// script.js - EventHub Pro Booking System

(function() {
    "use strict";

    // ----- event database -----
    let events = [
        { id: 1, title: "Tech Summit 2026", date: "2026-08-15", time: "09:00", venue: "Convention Center",
            category: "Conference", price: 299, available: 120,
            description: "Join industry leaders for a day of innovation, networking, and cutting-edge technology talks.",
            image: "💻" },
        { id: 2, title: "Jazz & Blues Night", date: "2026-08-20", time: "19:30", venue: "The Grand Hall",
            category: "Concert", price: 89, available: 45,
            description: "An unforgettable evening of smooth jazz and soulful blues performed by world-class musicians.",
            image: "🎷" },
        { id: 3, title: "Startup Pitch Fest", date: "2026-08-25", time: "14:00", venue: "Innovation Hub",
            category: "Networking", price: 149, available: 80,
            description: "Watch 10 startups pitch their ideas to a panel of investors. Network with founders and VCs.",
            image: "🚀" },
        { id: 4, title: "Art Exhibition: Modern Masters", date: "2026-09-01", time: "10:00",
            venue: "City Art Gallery", category: "Exhibition", price: 45, available: 200,
            description: "Explore the works of modern art masters in this exclusive curated exhibition.",
            image: "🎨" },
        { id: 5, title: "Cooking Masterclass", date: "2026-09-05", time: "11:00", venue: "Culinary Studio",
            category: "Workshop", price: 120, available: 25,
            description: "Learn to cook gourmet dishes with celebrity chef Marco Rossi. Includes ingredients and recipes.",
            image: "🍳" },
        { id: 6, title: "Film Festival: Indie Showcase", date: "2026-09-10", time: "18:00",
            venue: "Cinema Paradiso", category: "Film", price: 65, available: 90,
            description: "Independent filmmakers showcase their latest works. Q&A sessions with directors after screenings.",
            image: "🎬" },
    ];

    // ----- bookings state -----
    let bookings = [];
    let bookingIdCounter = 1;

    // ----- DOM refs -----
    const eventGrid = document.getElementById('eventGrid');
    const bookingsList = document.getElementById('bookingsList');
    const eventsSection = document.getElementById('eventsSection');
    const bookingsSection = document.getElementById('bookingsSection');
    const tabs = document.querySelectorAll('.tabs button');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const notificationBtn = document.getElementById('notificationBtn');
    const helpBtn = document.getElementById('helpBtn');
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');

    // Footer links
    const helpLink = document.getElementById('helpLink');
    const privacyLink = document.getElementById('privacyLink');
    const termsLink = document.getElementById('termsLink');

    // Profile dropdown links
    const profileLink = document.getElementById('profileLink');
    const myEventsLink = document.getElementById('myEventsLink');
    const myBookingsLink = document.getElementById('myBookingsLink');
    const settingsLink = document.getElementById('settingsLink');
    const logoutLink = document.getElementById('logoutLink');

    let currentEventId = null;
    let toastTimeout = null;

    // ----- show toast notification -----
    function showToast(message, isError = false) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        const icon = toast.querySelector('i');
        if (isError) {
            icon.className = 'fas fa-exclamation-circle error';
        } else {
            icon.className = 'fas fa-check-circle';
        }
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ----- render events -----
    function renderEvents() {
        eventGrid.innerHTML = '';
        events.forEach(e => {
            const card = document.createElement('div');
            card.className = 'event-card';
            const isSoldOut = e.available <= 0;
            card.innerHTML = `
                <div class="event-image">
                    <span style="font-size:3.5rem;">${e.image || '🎫'}</span>
                    <span class="date-badge"><i class="far fa-calendar-alt"></i> ${formatDate(e.date)}</span>
                    <span class="price-badge">$${e.price}</span>
                </div>
                <div class="event-info">
                    <h4>${e.title}</h4>
                    <div class="meta">
                        <span><i class="fas fa-clock"></i> ${e.time}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${e.venue}</span>
                    </div>
                    <div class="description">${e.description}</div>
                    <div class="ticket-status">
                        <span class="available ${isSoldOut ? 'sold-out' : ''}">
                            <i class="fas ${isSoldOut ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                            ${isSoldOut ? 'Sold Out' : `${e.available} tickets left`}
                        </span>
                        <button class="btn-book" data-id="${e.id}" ${isSoldOut ? 'disabled' : ''}>
                            ${isSoldOut ? 'Sold Out' : 'Book Now'}
                        </button>
                    </div>
                </div>
            `;
            eventGrid.appendChild(card);
        });

        // attach book button events
        document.querySelectorAll('.btn-book:not([disabled])').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                openBookingModal(id);
            });
        });

        // click on card to view details
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', function() {
                const btn = this.querySelector('.btn-book');
                if (btn && !btn.disabled) {
                    const id = parseInt(btn.dataset.id);
                    openBookingModal(id);
                }
            });
        });
    }

    // ----- render bookings -----
    function renderBookings() {
        bookingsList.innerHTML = '';
        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div style="text-align:center; padding:3rem 1rem; color:#6b7f9e; background:rgba(255,255,255,0.7); backdrop-filter:blur(8px); border-radius:28px; border:1px solid rgba(255,255,255,0.5);">
                    <i class="fas fa-ticket-alt" style="font-size:3rem; color:#dce5f5; margin-bottom:0.5rem;"></i>
                    <h3 style="color:#1a2332;">No bookings yet</h3>
                    <p>Browse events and book your first ticket!</p>
                </div>
            `;
            return;
        }

        bookings.forEach(b => {
            const event = events.find(e => e.id === b.eventId);
            if (!event) return;
            const div = document.createElement('div');
            div.className = 'booking-card';
            div.innerHTML = `
                <div class="booking-info">
                    <h4>${event.title}</h4>
                    <div class="details">
                        <span><i class="fas fa-calendar-alt"></i> ${formatDate(event.date)} at ${event.time}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${event.venue}</span>
                        <span><i class="fas fa-ticket-alt"></i> ${b.tickets} ticket${b.tickets > 1 ? 's' : ''}</span>
                        <span><i class="fas fa-dollar-sign"></i> $${b.totalPrice}</span>
                        <span><i class="fas fa-user"></i> ${b.name}</span>
                        <span><i class="fas fa-envelope"></i> ${b.email}</span>
                    </div>
                </div>
                <span class="booking-status ${b.status}">${b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                ${b.status === 'confirmed' ? `<button class="btn-cancel" data-id="${b.id}">Cancel</button>` : ''}
            `;
            bookingsList.appendChild(div);
        });

        // attach cancel events
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                cancelBooking(id);
            });
        });
    }

    // ----- open booking modal -----
    function openBookingModal(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event || event.available <= 0) return;

        currentEventId = eventId;
        modalTitle.textContent = `🎟️ ${event.title}`;

        let quantity = 1;
        const pricePerTicket = event.price;

        function updateModal() {
            const total = quantity * pricePerTicket;
            modalBody.innerHTML = `
                <div class="event-detail">
                    <div class="detail-row"><span class="label">📅 Date</span><span>${formatDate(event.date)} at ${event.time}</span></div>
                    <div class="detail-row"><span class="label">📍 Venue</span><span>${event.venue}</span></div>
                    <div class="detail-row"><span class="label">💰 Price per ticket</span><span>$${pricePerTicket}</span></div>
                    <div class="detail-row"><span class="label">🎫 Available</span><span>${event.available}</span></div>
                </div>
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" id="bookingName" value="James Davis" placeholder="Full name" />
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="bookingEmail" value="james@example.com" placeholder="Email address" />
                </div>
                <div class="form-group">
                    <label>Number of Tickets</label>
                    <div class="ticket-qty">
                        <button id="qtyMinus">−</button>
                        <span id="qtyDisplay">${quantity}</span>
                        <button id="qtyPlus">+</button>
                    </div>
                </div>
                <div class="total-price">Total: $${total}</div>
                <div class="modal-actions">
                    <button class="btn-secondary" id="cancelBookingBtn">Cancel</button>
                    <button class="btn-primary" id="confirmBookingBtn"><i class="fas fa-check"></i> Confirm Booking</button>
                </div>
            `;

            // attach qty events
            document.getElementById('qtyMinus').addEventListener('click', function() {
                if (quantity > 1) {
                    quantity--;
                    updateModal();
                }
            });
            document.getElementById('qtyPlus').addEventListener('click', function() {
                if (quantity < event.available) {
                    quantity++;
                    updateModal();
                } else {
                    showToast('❌ Not enough tickets available.', true);
                }
            });

            document.getElementById('cancelBookingBtn').addEventListener('click', function() {
                modalOverlay.classList.remove('active');
            });

            document.getElementById('confirmBookingBtn').addEventListener('click', function() {
                const name = document.getElementById('bookingName').value.trim();
                const email = document.getElementById('bookingEmail').value.trim();
                if (!name || !email) {
                    showToast('⚠️ Please enter your name and email.', true);
                    return;
                }
                confirmBooking(eventId, quantity, name, email);
            });
        }

        updateModal();
        modalOverlay.classList.add('active');
    }

    // ----- confirm booking -----
    function confirmBooking(eventId, quantity, name, email) {
        const event = events.find(e => e.id === eventId);
        if (!event || event.available < quantity) {
            showToast('❌ Sorry, tickets are no longer available.', true);
            modalOverlay.classList.remove('active');
            return;
        }

        // update event availability
        event.available -= quantity;

        // create booking
        const booking = {
            id: bookingIdCounter++,
            eventId: eventId,
            tickets: quantity,
            totalPrice: quantity * event.price,
            status: 'confirmed',
            name: name,
            email: email,
            bookedAt: new Date().toISOString()
        };
        bookings.push(booking);

        modalOverlay.classList.remove('active');
        renderAll();
        showToast(`🎉 Booked ${quantity} ticket${quantity > 1 ? 's' : ''} for ${event.title}!`);
    }

    // ----- cancel booking -----
    function cancelBooking(bookingId) {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        if (confirm('Cancel this booking?')) {
            // return tickets to event
            const event = events.find(e => e.id === booking.eventId);
            if (event) {
                event.available += booking.tickets;
            }
            booking.status = 'cancelled';
            renderAll();
            showToast('✅ Booking cancelled successfully.');
        }
    }

    // ----- helper functions -----
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function renderAll() {
        renderEvents();
        renderBookings();
        updateBadge();
    }

    function updateBadge() {
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = confirmed;
            badge.style.display = confirmed > 0 ? 'block' : 'none';
        }
    }

    // ----- tab switching -----
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const tabName = this.dataset.tab;
            if (tabName === 'events') {
                eventsSection.style.display = 'block';
                bookingsSection.classList.remove('active');
            } else {
                eventsSection.style.display = 'none';
                bookingsSection.classList.add('active');
                renderBookings();
            }
        });
    });

    // ----- modal controls -----
    closeModalBtn.addEventListener('click', function() {
        modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            modalOverlay.classList.remove('active');
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            modalOverlay.classList.remove('active');
        }
    });

    // ----- profile dropdown toggle -----
    profileSection.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
        if (!profileSection.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // ----- profile dropdown actions -----
    profileLink.addEventListener('click', function(e) {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        showToast('👤 Viewing your profile');
    });

    myEventsLink.addEventListener('click', function(e) {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        showToast('📅 Showing your created events');
    });

    myBookingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        document.querySelector('[data-tab="bookings"]').click();
        showToast('🎫 Viewing your bookings');
    });

    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        showToast('⚙️ Opening settings');
    });

    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        if (confirm('Are you sure you want to logout?')) {
            showToast('👋 Logged out successfully');
        }
    });

    // ----- notification button -----
    notificationBtn.addEventListener('click', function() {
        const count = bookings.filter(b => b.status === 'confirmed').length;
        if (count > 0) {
            showToast(`📬 You have ${count} confirmed booking${count !== 1 ? 's' : ''}`);
        } else {
            showToast('📬 No new notifications');
        }
    });

    // ----- help button (header) -----
    helpBtn.addEventListener('click', function() {
        showToast('💡 Need help? Contact support at support@eventhub.com');
    });

    // ----- footer links -----
    helpLink.addEventListener('click', function(e) {
        e.preventDefault();
        showToast('📖 Help Center - Find answers to common questions');
    });

    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        showToast('🔒 Privacy Policy - Your data is safe with us');
    });

    termsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showToast('📜 Terms of Service - Please read our terms carefully');
    });

    // ----- init -----
    renderAll();

})();