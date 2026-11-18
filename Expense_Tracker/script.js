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
    const filterCategory = document.getElementById('filterCategory');
    const searchInput = document.getElementById('searchInput');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const exportBtn = document.getElementById('exportBtn');
    const toast = document.getElementById('toast');

    // ----- State -----
    let transactions = [];
    let editingId = null;
    let toastTimeout = null;

    // ----- Local Storage Key -----
    const STORAGE_KEY = 'expense_tracker_data';

    // ----- Toast notification -----
    function showToast(message, type = 'success') {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toast.classList.remove('show');
        }

        toast.textContent = message;
        toast.className = 'toast ' + type;
        
        // Force reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

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
            const now = Date.now();
            transactions = [{
                id: now - 86400000,
                description: 'Grocery Shopping',
                amount: 85.50,
                category: 'Food',
                type: 'expense',
                date: new Date(now - 86400000).toISOString()
            }, {
                id: now - 172800000,
                description: 'Freelance Payment',
                amount: 250.00,
                category: 'Other',
                type: 'income',
                date: new Date(now - 172800000).toISOString()
            }, {
                id: now - 259200000,
                description: 'Bus Pass',
                amount: 45.00,
                category: 'Transport',
                type: 'expense',
                date: new Date(now - 259200000).toISOString()
            }, {
                id: now - 345600000,
                description: 'Salary Deposit',
                amount: 2000.00,
                category: 'Other',
                type: 'income',
                date: new Date(now - 345600000).toISOString()
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
            showToast('Please enter a description.', 'error');
            descriptionInput.focus();
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount greater than 0.', 'error');
            amountInput.focus();
            return;
        }

        if (editingId !== null) {
            // Update existing transaction
            const index = transactions.findIndex(tx => tx.id === editingId);
            if (index !== -1) {
                transactions[index] = {
                    ...transactions[index],
                    description: description,
                    amount: amount,
                    category: category,
                    type: type,
                };
                showToast('Transaction updated! ✅', 'success');
            }
            editingId = null;
            addBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add';
        } else {
            // Add new transaction
            const newTx = {
                id: generateId(),
                description: description,
                amount: amount,
                category: category,
                type: type,
                date: new Date().toISOString()
            };
            transactions.push(newTx);
            showToast('Transaction added! ✅', 'success');
        }

        saveToStorage();
        renderAll();

        // Clear inputs
        descriptionInput.value = '';
        amountInput.value = '';
        descriptionInput.focus();
    }

    // ----- Edit transaction -----
    function editTransaction(id) {
        const transaction = transactions.find(tx => tx.id === id);
        if (!transaction) return;

        editingId = id;
        descriptionInput.value = transaction.description;
        amountInput.value = transaction.amount;
        categorySelect.value = transaction.category;
        typeSelect.value = transaction.type;
        addBtn.innerHTML = '<i class="fas fa-save"></i> Update';
        descriptionInput.focus();
        showToast('Edit mode: Update the transaction details', 'success');
    }

    // ----- Delete transaction -----
    function deleteTransaction(id) {
        const transaction = transactions.find(tx => tx.id === id);
        if (!transaction) return;
        
        if (!confirm(`Delete "${transaction.description}"?`)) return;
        
        transactions = transactions.filter(tx => tx.id !== id);
        saveToStorage();
        renderAll();
        showToast('Transaction deleted 🗑️', 'error');
    }

    // ----- Clear all transactions -----
    function clearAll() {
        if (transactions.length === 0) {
            showToast('No transactions to clear', 'error');
            return;
        }
        if (!confirm('Delete ALL transactions? This cannot be undone.')) return;
        transactions = [];
        saveToStorage();
        renderAll();
        showToast('All transactions cleared 🗑️', 'error');
    }

    // ----- Export transactions to CSV -----
    function exportData() {
        if (transactions.length === 0) {
            showToast('No transactions to export', 'error');
            return;
        }

        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const rows = transactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.description,
            tx.category,
            tx.type,
            tx.amount.toFixed(2)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported successfully 📥', 'success');
    }

    // ----- Get filtered transactions -----
    function getFilteredTransactions() {
        const filter = filterType.value;
        const categoryFilter = filterCategory.value;
        const search = searchInput.value.trim().toLowerCase();

        let filtered = [...transactions];

        // Filter by type
        if (filter !== 'all') {
            filtered = filtered.filter(tx => tx.type === filter);
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(tx => tx.category === categoryFilter);
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

        // Add negative class if balance is negative
        if (balance < 0) {
            totalBalanceEl.classList.add('negative');
        } else {
            totalBalanceEl.classList.remove('negative');
        }
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
                        <div class="tx-actions">
                            <button class="edit-btn" data-id="${tx.id}" aria-label="Edit">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="delete-btn" data-id="${tx.id}" aria-label="Delete">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </li>
                `;
        });

        transactionList.innerHTML = html;

        // Attach edit events
        transactionList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id, 10);
                editTransaction(id);
            });
        });

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

        // Filter changes
        filterType.addEventListener('change', renderList);
        filterCategory.addEventListener('change', renderList);
        searchInput.addEventListener('input', renderList);

        // Clear all
        clearAllBtn.addEventListener('click', clearAll);

        // Export
        exportBtn.addEventListener('click', exportData);

        // Load data
        loadFromStorage();
    }

    // ----- Start app -----
    init();

})();