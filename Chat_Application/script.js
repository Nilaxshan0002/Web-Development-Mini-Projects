// script.js
(function() {
    'use strict';

    // ----- DOM refs -----
    const container = document.getElementById('messageContainer');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const dropdown = document.getElementById('dropdownMenu');
    const menuToggle = document.getElementById('menuToggle');
    const callBtn = document.getElementById('callBtn');
    const videoBtn = document.getElementById('videoBtn');
    const toast = document.getElementById('toast');

    // ----- state -----
    let toastTimeout = null;
    const messages = [
        { id: 1, text: 'Hey everyone! 👋', from: 'alice', time: '9:41 AM' },
        { id: 2, text: 'Hi Alice! Ready for the new project?', from: 'bob', time: '9:43 AM' },
        { id: 3, text: 'Absolutely! I\'ve been brainstorming some ideas.', from: 'alice', time: '9:45 AM' },
        { id: 4, text: 'Sounds great! Let\'s share them in the call later.', from: 'bob', time: '9:47 AM' },
    ];

    const currentUser = 'bob';

    // ----- helpers -----
    function getTime() {
        const d = new Date();
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    function showToast(message, duration = 2200) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // ----- render messages -----
    function renderMessages() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(typingIndicator);

        messages.forEach(msg => {
            const isOutgoing = (msg.from === currentUser);
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;

            const avatar = document.createElement('div');
            avatar.className = 'avatar-small';
            avatar.textContent = msg.from.charAt(0).toUpperCase();

            const bubbleWrapper = document.createElement('div');
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.textContent = msg.text;

            const timeElem = document.createElement('div');
            timeElem.className = 'time';
            timeElem.textContent = msg.time || getTime();

            bubbleWrapper.appendChild(bubble);
            bubbleWrapper.appendChild(timeElem);

            msgDiv.appendChild(avatar);
            msgDiv.appendChild(bubbleWrapper);

            container.insertBefore(msgDiv, typingIndicator);
        });

        container.scrollTop = container.scrollHeight;
    }

    // ----- add message -----
    function addMessage(text, from = currentUser, time = getTime()) {
        const newMsg = {
            id: Date.now() + Math.random(),
            text: text.trim(),
            from: from,
            time: time,
        };
        messages.push(newMsg);
        renderMessages();
        container.scrollTop = container.scrollHeight;
    }

    // ----- simulate incoming -----
    function simulateIncomingMessage() {
        const replies = [
            'That\'s a great point! 👍', 'I completely agree with you.',
            'Let\'s dive deeper into that.', 'Interesting! Tell me more.',
            'Sure, I\'ll take a look.', 'Thanks for sharing! 😊',
            'I\'ll get back to you on that.', 'Perfect, let\'s do it!',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const delay = 1200 + Math.random() * 1800;

        typingIndicator.style.opacity = '1';

        setTimeout(() => {
            typingIndicator.style.opacity = '0';
            addMessage(randomReply, 'alice', getTime());
            setTimeout(() => {
                typingIndicator.style.opacity = '0.7';
            }, 200);
        }, delay);
    }

    // ----- send message -----
    function sendMessage() {
        const text = input.value.trim();
        if (text === '') return;

        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.6';

        addMessage(text, currentUser, getTime());
        input.value = '';
        input.focus();

        setTimeout(() => {
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
        }, 300);

        if (text.length > 1) {
            setTimeout(() => {
                simulateIncomingMessage();
            }, 500);
        }
    }

    // ----- dropdown toggle -----
    function toggleDropdown(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    }

    // ----- close dropdown -----
    function closeDropdown() {
        dropdown.classList.remove('show');
    }

    // ----- dropdown actions -----
    function handleDropdownAction(action) {
        closeDropdown();
        switch (action) {
            case 'profile': showToast('👤 Profile opened (demo)'); break;
            case 'settings': showToast('⚙️ Settings panel (demo)'); break;
            case 'theme': showToast('🎨 Theme switcher (demo)'); break;
            case 'archive': showToast('📁 Archive loaded (demo)'); break;
            case 'clear':
                if (confirm('Clear all messages?')) {
                    messages.length = 0;
                    renderMessages();
                    showToast('🧹 Chat cleared', 1800);
                }
                break;
            default: showToast('✨ Action triggered');
        }
    }

    // ----- header actions (call / video) -----
    function handleCall() {
        showToast('📞 Calling ... (demo)');
    }

    function handleVideo() {
        showToast('📹 Video call starting ... (demo)');
    }

    // ----- event listeners -----
    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Header buttons
    callBtn.addEventListener('click', handleCall);
    videoBtn.addEventListener('click', handleVideo);
    menuToggle.addEventListener('click', toggleDropdown);

    // Dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = item.dataset.action;
            if (action) handleDropdownAction(action);
        });
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== menuToggle) {
            closeDropdown();
        }
    });

    // ----- initial render -----
    renderMessages();

    // first auto reply after mount
    setTimeout(() => {
        const last = messages[messages.length - 1];
        if (last && last.from !== 'alice') {
            typingIndicator.style.opacity = '0.7';
            setTimeout(() => {
                typingIndicator.style.opacity = '0';
                addMessage('Sounds like a plan! Let’s finalize it.', 'alice', getTime());
                setTimeout(() => {
                    typingIndicator.style.opacity = '0.7';
                }, 200);
            }, 1400);
        }
    }, 1200);

    // typing indicator on focus
    input.addEventListener('focus', () => {
        typingIndicator.style.opacity = '1';
    });

    input.addEventListener('blur', () => {
        typingIndicator.style.opacity = '0.7';
    });

    window.addEventListener('resize', () => {
        container.scrollTop = container.scrollHeight;
    });

})();