(function() {
  "use strict";

  // ----- DOM refs -----
  const resultEl = document.getElementById('result');
  const expressionEl = document.getElementById('expression');
  const memoryIndicator = document.getElementById('memoryIndicator');
  const toast = document.getElementById('toast');

  // ----- state -----
  let currentInput = '0';
  let previousInput = '';
  let operator = null;
  let shouldResetDisplay = false;
  let memory = null;
  let hasMemory = false;
  let lastAction = null;
  let expression = '';

  // ----- helpers -----
  function formatNumber(num) {
    if (num === Infinity || num === -Infinity || isNaN(num)) {
      return 'Error';
    }
    const str = String(num);
    if (str.length > 12) {
      return num.toExponential(6);
    }
    return str;
  }

  function updateDisplay() {
    resultEl.textContent = currentInput;
    expressionEl.textContent = expression;
    memoryIndicator.classList.toggle('show', hasMemory);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // ----- input number -----
  function inputNumber(value) {
    if (shouldResetDisplay) {
      currentInput = '0';
      shouldResetDisplay = false;
    }

    if (value === '.') {
      if (currentInput.includes('.')) return;
      if (currentInput === '') currentInput = '0';
      currentInput += '.';
    } else {
      if (currentInput === '0' && value !== '.') {
        currentInput = value;
      } else {
        currentInput += value;
      }
    }

    // Limit input length
    if (currentInput.replace('-', '').replace('.', '').length > 15) {
      currentInput = currentInput.slice(0, -1);
    }

    updateDisplay();
  }

  // ----- operator -----
  function handleOperator(op) {
    const current = parseFloat(currentInput);
    if (isNaN(current)) return;

    if (operator && !shouldResetDisplay) {
      calculate();
    }

    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
    expression = `${currentInput} ${op} `;
    updateDisplay();

    // Highlight active operator
    document.querySelectorAll('.btn.operator').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.operator === op);
    });
  }

  // ----- calculate -----
  function calculate() {
    if (!operator || shouldResetDisplay) return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(current)) return;

    let result;
    let opSymbol = operator;

    switch (operator) {
      case '+':
        result = prev + current;
        break;
      case '−':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        if (current === 0) {
          resultEl.textContent = 'Error';
          resultEl.classList.add('error');
          expression = `${prev} ${opSymbol} ${current} =`;
          updateDisplay();
          showToast('❌ Cannot divide by zero');
          operator = null;
          previousInput = '';
          shouldResetDisplay = true;
          document.querySelectorAll('.btn.operator').forEach(btn => btn.classList.remove('active'));
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    const formattedResult = formatNumber(result);
    if (formattedResult === 'Error') {
      resultEl.textContent = 'Error';
      resultEl.classList.add('error');
      expression = `${prev} ${opSymbol} ${current} =`;
      updateDisplay();
      showToast('❌ Calculation error');
      operator = null;
      previousInput = '';
      shouldResetDisplay = true;
      document.querySelectorAll('.btn.operator').forEach(btn => btn.classList.remove('active'));
      return;
    }

    resultEl.classList.remove('error');
    expression = `${prev} ${opSymbol} ${current} =`;
    currentInput = formattedResult;
    operator = null;
    previousInput = '';
    shouldResetDisplay = true;
    document.querySelectorAll('.btn.operator').forEach(btn => btn.classList.remove('active'));
    updateDisplay();
  }

  // ----- clear -----
  function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetDisplay = false;
    expression = '';
    resultEl.classList.remove('error');
    document.querySelectorAll('.btn.operator').forEach(btn => btn.classList.remove('active'));
    updateDisplay();
  }

  // ----- backspace -----
  function backspace() {
    if (shouldResetDisplay) return;
    if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
  }

  // ----- percentage -----
  function percentage() {
    const num = parseFloat(currentInput);
    if (isNaN(num)) return;
    currentInput = formatNumber(num / 100);
    shouldResetDisplay = true;
    updateDisplay();
  }

  // ----- toggle sign -----
  function toggleSign() {
    if (currentInput === '0') return;
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = '-' + currentInput;
    }
    updateDisplay();
  }

  // ----- memory functions -----
  function memoryStore() {
    const value = parseFloat(currentInput);
    if (isNaN(value)) {
      showToast('❌ Invalid value');
      return;
    }
    memory = value;
    hasMemory = true;
    updateDisplay();
    showToast('💾 Memory stored');
  }

  function memoryRecall() {
    if (!hasMemory) {
      showToast('⚠️ No memory stored');
      return;
    }
    if (shouldResetDisplay) {
      currentInput = '0';
      shouldResetDisplay = false;
    }
    currentInput = formatNumber(memory);
    updateDisplay();
    showToast('📤 Memory recalled');
  }

  function memoryClear() {
    memory = null;
    hasMemory = false;
    updateDisplay();
    showToast('🗑️ Memory cleared');
  }

  // ----- keyboard support -----
  function handleKeyboard(e) {
    const key = e.key;

    // Numbers
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      inputNumber(key);
      return;
    }

    // Decimal
    if (key === '.') {
      e.preventDefault();
      inputNumber('.');
      return;
    }

    // Operators
    if (['+', '-', '*', '/'].includes(key)) {
      e.preventDefault();
      const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      handleOperator(opMap[key]);
      return;
    }

    // Enter or = to calculate
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculate();
      return;
    }

    // Backspace
    if (key === 'Backspace') {
      e.preventDefault();
      backspace();
      return;
    }

    // Escape to clear
    if (key === 'Escape') {
      e.preventDefault();
      clearAll();
      return;
    }

    // Percentage
    if (key === '%') {
      e.preventDefault();
      percentage();
      return;
    }

    // Toggle sign
    if (key === '¬' || key === '~') {
      e.preventDefault();
      toggleSign();
      return;
    }
  }

  // ----- event listeners -----
  // Number buttons
  document.querySelectorAll('.btn.number').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.value;
      if (value === '.') {
        // Check if we already have a decimal in current input
        if (currentInput.includes('.')) return;
      }
      inputNumber(value);
    });
  });

  // Operator buttons
  document.querySelectorAll('.btn.operator').forEach(btn => {
    btn.addEventListener('click', () => {
      handleOperator(btn.dataset.operator);
    });
  });

  // Equals button
  document.querySelector('[data-action="calculate"]').addEventListener('click', calculate);

  // Clear button
  document.querySelector('[data-action="clear"]').addEventListener('click', clearAll);

  // Memory buttons
  document.querySelector('[data-action="memory"]').addEventListener('click', memoryStore);
  document.querySelector('[data-action="memoryRecall"]').addEventListener('click', memoryRecall);
  document.querySelector('[data-action="memoryClear"]').addEventListener('click', memoryClear);

  // Keyboard support
  document.addEventListener('keydown', handleKeyboard);

  // ----- init -----
  updateDisplay();

  console.log('✅ Custom Calculator');
  console.log('   ⌨️  Keyboard supported: numbers, operators (+, -, *, /)');
  console.log('   ⌨️  Enter = calculate  |  Backspace = delete  |  Escape = clear');
  console.log('   🧮 Memory: M = store  |  MR = recall  |  MC = clear');

  // Add extra keyboard support for percentage and sign toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === '%') {
      e.preventDefault();
      percentage();
    }
    if (e.key === '¬' || e.key === '~' || e.key === '`') {
      e.preventDefault();
      toggleSign();
    }
    // Support for numpad enter
    if (e.key === 'Enter' && e.location === 3) {
      e.preventDefault();
      calculate();
    }
  });

})();