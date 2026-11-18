// ----- script.js (separated JavaScript) -----
(function() {
    "use strict";

    // DOM refs
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // State
    let tasks = [];
    let currentFilter = 'all'; // 'all' | 'active' | 'completed'

    // ----- helpers -----
    function formatDate(ts) {
        const d = new Date(ts);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${h12}:${minutes} ${ampm}, ${month}/${day}/${year}`;
    }

    // generate unique ID
    function generateId() {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 8);
    }

    // ----- load from localStorage -----
    function loadFromStorage() {
        const stored = localStorage.getItem('todoTasks');
        if (stored) {
            try {
                tasks = JSON.parse(stored);
                // ensure each task has an id (migration)
                tasks = tasks.filter(t => t && typeof t === 'object').map(t => {
                    if (!t.id) t.id = generateId();
                    if (t.completed === undefined) t.completed = false;
                    if (!t.createdAt) t.createdAt = Date.now();
                    return t;
                });
            } catch {
                tasks = [];
            }
        } else {
            // seed with demo tasks from screenshot
            tasks = [
                { id: generateId(), text: 'Create a react project 🧑‍💻', completed: false, createdAt: Date.now() - 3600000 * 2 },
                { id: generateId(), text: 'Learn React 🧑‍💻', completed: false, createdAt: Date.now() - 3600000 * 3 },
                { id: generateId(), text: 'Create a Todo App 🧑‍💻', completed: false, createdAt: Date.now() - 3600000 * 4 }
            ];
            // adjust dates to match screenshot approx
            tasks[0].createdAt = new Date(2022, 5, 1, 5, 23, 0).getTime();
            tasks[1].createdAt = new Date(2022, 5, 1, 5, 22, 0).getTime();
            tasks[2].createdAt = new Date(2022, 5, 1, 5, 21, 0).getTime();
            saveToStorage();
        }
    }

    function saveToStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    // ----- render -----
    function render() {
        const filtered = getFilteredTasks();
        taskList.innerHTML = '';

        if (filtered.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'empty-state';
            empty.textContent = '✨ Nothing here — add a task!';
            taskList.appendChild(empty);
            return;
        }

        filtered.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;

            // text
            const textSpan = document.createElement('span');
            textSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
            textSpan.textContent = task.text;

            // meta (time)
            const meta = document.createElement('span');
            meta.className = 'task-meta';
            meta.innerHTML = `<i class="far fa-clock"></i> ${formatDate(task.createdAt)}`;

            // actions container
            const actions = document.createElement('div');
            actions.className = 'task-actions';

            // --- complete toggle (with label) ---
            const completeBtn = document.createElement('button');
            completeBtn.className = 'complete-btn';
            completeBtn.innerHTML = task.completed 
                ? '<i class="fas fa-undo"></i><span class="btn-label">Undo</span>' 
                : '<i class="fas fa-check"></i><span class="btn-label">Done</span>';
            completeBtn.title = task.completed ? 'Undo complete' : 'Mark complete';
            completeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleComplete(task.id);
            });

            // --- edit button (with label) ---
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-pen"></i><span class="btn-label">Edit</span>';
            editBtn.title = 'Edit task';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editTask(task.id);
            });

            // --- delete button (with label) ---
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash-can"></i><span class="btn-label">Delete</span>';
            deleteBtn.title = 'Delete task';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });

            actions.appendChild(completeBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            li.appendChild(textSpan);
            li.appendChild(meta);
            li.appendChild(actions);
            taskList.appendChild(li);
        });
    }

    // ----- filter logic -----
    function getFilteredTasks() {
        if (currentFilter === 'all') return tasks.slice();
        if (currentFilter === 'active') return tasks.filter(t => !t.completed);
        if (currentFilter === 'completed') return tasks.filter(t => t.completed);
        return tasks;
    }

    // ----- CRUD -----
    function addTask(text) {
        if (!text.trim()) return;
        const newTask = {
            id: generateId(),
            text: text.trim(),
            completed: false,
            createdAt: Date.now()
        };
        tasks.push(newTask);
        saveToStorage();
        render();
        taskInput.value = '';
        taskInput.focus();
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        render();
    }

    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveToStorage();
            render();
        }
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveToStorage();
            render();
        }
    }

    // ----- filter UI / change -----
    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        render();
    }

    // ----- event listeners -----
    addBtn.addEventListener('click', () => {
        addTask(taskInput.value);
    });

    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask(taskInput.value);
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setFilter(filter);
        });
    });

    // ----- init -----
    loadFromStorage();
    setFilter('all');
    render();

})();