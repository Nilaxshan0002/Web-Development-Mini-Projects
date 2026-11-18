(function() {
  "use strict";

  // ----- sample quiz data -----
  const QUIZ_DATA = [
    {
      category: "Science",
      question: "What is the chemical symbol for water?",
      options: ["H2O", "CO2", "NaCl", "HCl"],
      correct: 0
    },
    {
      category: "History",
      question: "In which year did the Berlin Wall fall?",
      options: ["1985", "1989", "1991", "1987"],
      correct: 1
    },
    {
      category: "Geography",
      question: "What is the capital of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      correct: 2
    },
    {
      category: "Technology",
      question: "Which company developed the first graphical web browser?",
      options: ["Microsoft", "Apple", "Netscape", "Google"],
      correct: 2
    },
    {
      category: "Sports",
      question: "How many players are on a football (soccer) team?",
      options: ["9", "10", "11", "12"],
      correct: 2
    },
    {
      category: "Art",
      question: "Who painted the Mona Lisa?",
      options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"],
      correct: 2
    },
    {
      category: "Math",
      question: "What is the square root of 144?",
      options: ["10", "11", "12", "13"],
      correct: 2
    },
    {
      category: "Literature",
      question: "Who wrote '1984'?",
      options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"],
      correct: 1
    },
    {
      category: "Music",
      question: "Which instrument has 88 keys?",
      options: ["Guitar", "Violin", "Piano", "Flute"],
      correct: 2
    },
    {
      category: "General",
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correct: 3
    }
  ];

  // ----- DOM refs -----
  const questionScreen = document.getElementById('questionScreen');
  const resultScreen = document.getElementById('resultScreen');
  const qNumber = document.getElementById('qNumber');
  const qText = document.getElementById('qText');
  const qCategory = document.getElementById('qCategory');
  const optionsContainer = document.getElementById('optionsContainer');
  const feedbackMsg = document.getElementById('feedbackMsg');
  const nextBtn = document.getElementById('nextBtn');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const progressText = document.getElementById('progressText');
  const progressPercent = document.getElementById('progressPercent');
  const progressFill = document.getElementById('progressFill');
  const finalScore = document.getElementById('finalScore');
  const resultDetail = document.getElementById('resultDetail');
  const restartBtn = document.getElementById('restartBtn');

  // ----- state -----
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let totalQuestions = 0;

  // ----- helpers -----
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ----- init / load -----
  function loadQuiz() {
    questions = shuffleArray([...QUIZ_DATA]);
    totalQuestions = questions.length;
    currentIndex = 0;
    score = 0;
    answered = false;
    updateScore();
    renderQuestion();
    showQuestionScreen();
  }

  // ----- render question -----
  function renderQuestion() {
    if (currentIndex >= totalQuestions) {
      showResult();
      return;
    }

    const q = questions[currentIndex];
    qNumber.textContent = `QUESTION ${currentIndex + 1}`;
    qText.textContent = q.question;
    qCategory.textContent = q.category;

    const letters = ['A', 'B', 'C', 'D'];
    optionsContainer.innerHTML = q.options.map((opt, idx) => `
      <button class="option-btn" data-index="${idx}" data-correct="${q.correct}">
        <span class="letter">${letters[idx]}</span>
        <span>${escapeHtml(opt)}</span>
      </button>
    `).join('');

    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', onOptionClick);
    });

    feedbackMsg.innerHTML = `<i class="fas fa-info-circle"></i><span>Select an option</span>`;
    feedbackMsg.className = 'feedback-message';
    nextBtn.disabled = true;
    answered = false;

    const progress = ((currentIndex) / totalQuestions) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
    progressPercent.textContent = `${Math.round(progress)}%`;
  }

  // ----- option click handler -----
  function onOptionClick(e) {
    if (answered) return;
    const btn = e.currentTarget;
    const selectedIdx = parseInt(btn.dataset.index);
    const correctIdx = parseInt(btn.dataset.correct);
    const isCorrect = selectedIdx === correctIdx;

    document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

    const allOpts = document.querySelectorAll('.option-btn');
    allOpts.forEach((b, idx) => {
      if (idx === correctIdx) {
        b.classList.add('correct');
      } else if (idx === selectedIdx && !isCorrect) {
        b.classList.add('wrong');
      }
    });

    if (isCorrect) {
      score++;
      updateScore();
    }

    const msg = isCorrect ? '✅ Correct!' : '❌ Incorrect.';
    feedbackMsg.innerHTML = `<i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${msg}</span>`;
    feedbackMsg.className = `feedback-message ${isCorrect ? 'correct' : 'wrong'}`;

    answered = true;
    nextBtn.disabled = false;
  }

  // ----- next question -----
  function goToNext() {
    if (!answered) return;
    currentIndex++;
    if (currentIndex >= totalQuestions) {
      showResult();
    } else {
      renderQuestion();
    }
  }

  // ----- update score display -----
  function updateScore() {
    scoreDisplay.textContent = score;
  }

  // ----- show result -----
  function showResult() {
    questionScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    finalScore.textContent = `${score} / ${totalQuestions}`;
    progressFill.style.width = '100%';
    progressText.textContent = `Complete!`;
    progressPercent.textContent = '100%';

    const pct = (score / totalQuestions) * 100;
    let detail = '';
    if (pct === 100) detail = '🏆 Perfect score! Outstanding!';
    else if (pct >= 80) detail = '🌟 Excellent! You really know your stuff.';
    else if (pct >= 60) detail = '👍 Good job! Keep learning and you\'ll master it.';
    else if (pct >= 40) detail = '📚 Not bad! Review the topics and try again.';
    else detail = '💪 Keep going! Practice makes perfect.';
    resultDetail.textContent = detail;
  }

  function showQuestionScreen() {
    questionScreen.classList.remove('hidden');
    resultScreen.classList.add('hidden');
  }

  // ----- restart -----
  function restartQuiz() {
    loadQuiz();
  }

  // ----- escape html -----
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ----- event listeners -----
  nextBtn.addEventListener('click', goToNext);
  restartBtn.addEventListener('click', restartQuiz);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !nextBtn.disabled && !resultScreen.classList.contains('hidden')) {
      goToNext();
    }
  });

  // ----- init -----
  loadQuiz();

  console.log('✅ Quiz App · professional edition (separate files)');
})();