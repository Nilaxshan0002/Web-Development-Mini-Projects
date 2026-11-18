// ===== script.js =====

/* ================================================================
       EXPENSE TRACKER — FULL APPLICATION
       with Local Storage persistence, filtering, search, and CRUD
    ================================================================ */

(function() {
    'use strict';

    // ----- DOM References -----
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    const typeSelect = document.getElementById('type');
    const addBtn = document.getElementById('addBtn');
    const transactionList = document.getElementById('transactionList');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const totalBalanceEl = document.getElementById('totalBalance');
    const txCountEl = document.getElementById('txCount');
    const filterType = document.getElementById('filterType');
    const searchInput = document.getElementById('searchInput');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // ----- State -----
    let transactions = [];
    let editingId = null;

    // ----- Local Storage Key -----
    const STORAGE_KEY = 'expense_tracker_data';

    // ----- Load from Local Storage -----
    function loadFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                transactions = JSON.parse(stored);
            } catch (_) {
                transactions = [];
            }
        } else {
            // Seed with sample data for demo
            transactions = [{
                id: Date.now() - 86400000,
                description: 'Grocery Shopping',
                amount: 85.50,
                category: 'Food',
                type: 'expense',
                date: new Date(Date.now() - 86400000).toISOString()
            }, {
                id: Date.now() - 172800000,
                description: 'Freelance Payment',
                amount: 250.00,
                category: 'Other',
                type: 'income',
                date: new Date(Date.now() - 172800000).toISOString()
            }, {
                id: Date.now() - 259200000,
                description: 'Bus Pass',
                amount: 45.00,
                category: 'Transport',
                type: 'expense',
                date: new Date(Date.now() - 259200000).toISOString()
            }];
            saveToStorage();
        }
        renderAll();
    }

    // ----- Save to Local Storage -----
    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }

    // ----- Generate unique ID -----
    function generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    // ----- Add transaction -----
    function addTransaction() {
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        const type = typeSelect.value;

        // Validation
        if (!description) {
            alert('Please enter a description.');
            descriptionInput.focus();
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount greater than 0.');
            amountInput.focus();
            return;
        }

        const newTx = {
            id: generateId(),
            description: description,
            amount: amount,
            category: category,
            type: type,
            date: new Date().toISOString()
        };

        transactions.push(newTx);
        saveToStorage();
        renderAll();

        // Clear inputs
        descriptionInput.value = '';
        amountInput.value = '';
        descriptionInput.focus();
    }

    // ----- Delete transaction -----
    function deleteTransaction(id) {
        if (!confirm('Delete this transaction?')) return;
        transactions = transactions.filter(tx => tx.id !== id);
        saveToStorage();
        renderAll();
    }

    // ----- Clear all transactions -----
    function clearAll() {
        if (transactions.length === 0) return;
        if (!confirm('Delete ALL transactions? This cannot be undone.')) return;
        transactions = [];
        saveToStorage();
        renderAll();
    }

    // ----- Get filtered & searched transactions -----
    function getFilteredTransactions() {
        const filter = filterType.value;
        const search = searchInput.value.trim().toLowerCase();

        let filtered = transactions;

        // Filter by type
        if (filter !== 'all') {
            filtered = filtered.filter(tx => tx.type === filter);
        }

        // Search by description or category
        if (search) {
            filtered = filtered.filter(tx =>
                tx.description.toLowerCase().includes(search) ||
                tx.category.toLowerCase().includes(search)
            );
        }

        // Sort: newest first
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // ----- Format currency -----
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    }

    // ----- Render summary -----
    function renderSummary() {
        const totalIncome = transactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalExpense = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpenseEl.textContent = formatCurrency(totalExpense);
        totalBalanceEl.textContent = formatCurrency(balance);
    }

    // ----- Render transaction list -----
    function renderList() {
        const filtered = getFilteredTransactions();
        const count = filtered.length;
        txCountEl.textContent = count;

        if (count === 0) {
            transactionList.innerHTML = `
                    <li class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <p>No transactions found</p>
                        <span class="sub">Try adjusting your filters or add a new entry</span>
                    </li>
                `;
            return;
        }

        let html = '';
        filtered.forEach(tx => {
            const isIncome = tx.type === 'income';
            const iconClass = isIncome ? 'income-icon' : 'expense-icon';
            const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';
            const amountClass = isIncome ? 'income-amount' : 'expense-amount';
            const sign = isIncome ? '+' : '-';

            html += `
                    <li class="transaction-item" data-id="${tx.id}">
                        <div class="tx-info">
                            <div class="tx-icon ${iconClass}">
                                <i class="fas ${icon}"></i>
                            </div>
                            <div class="tx-details">
                                <span class="tx-title">${escapeHtml(tx.description)}</span>
                                <span class="tx-meta">
                                    <span class="category-badge">${escapeHtml(tx.category)}</span>
                                    <span>${formatDate(tx.date)}</span>
                                </span>
                            </div>
                        </div>
                        <span class="tx-amount ${amountClass}">${sign}${formatCurrency(tx.amount)}</span>
                        <button class="delete-btn" data-id="${tx.id}" aria-label="Delete">
                            <i class="fas fa-times"></i>
                        </button>
                    </li>
                `;
        });

        transactionList.innerHTML = html;

        // Attach delete events
        transactionList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id, 10);
                deleteTransaction(id);
            });
        });
    }

    // ----- Helper: escape HTML -----
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ----- Helper: format date -----
    function formatDate(dateString) {
        const d = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    }

    // ----- Render all -----
    function renderAll() {
        renderSummary();
        renderList();
    }

    // ----- Event listeners -----
    function init() {
        // Add transaction
        addBtn.addEventListener('click', addTransaction);

        // Enter key on amount or description
        amountInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addTransaction();
        });
        descriptionInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addTransaction();
        });

        // Filter change
        filterType.addEventListener('change', renderList);
        searchInput.addEventListener('input', renderList);

        // Clear all
        clearAllBtn.addEventListener('click', clearAll);

        // Load data
        loadFromStorage();
    }

    // ----- Start app -----
    init();

})();