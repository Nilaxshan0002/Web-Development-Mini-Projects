(function() {
  "use strict";

  // ----- quotes data -----
  const quotes = [
    {
      text: "Code is simple when logic is clear.",
      author: "Developer Mindset"
    },
    {
      text: "The only way to learn a new programming language is by writing programs in it.",
      author: "Dennis Ritchie"
    },
    {
      text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
      author: "Martin Fowler"
    },
    {
      text: "First, solve the problem. Then, write the code.",
      author: "John Johnson"
    },
    {
      text: "Experience is the name everyone gives to their mistakes.",
      author: "Oscar Wilde"
    },
    {
      text: "In order to be irreplaceable, one must always be different.",
      author: "Coco Chanel"
    },
    {
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker"
    },
    {
      text: "Simplicity is the soul of efficiency.",
      author: "Austin Freeman"
    },
    {
      text: "Good design adds value faster than it adds cost.",
      author: "Thomas C. Gale"
    },
    {
      text: "The function of good software is to make the complex appear to be simple.",
      author: "Grady Booch"
    },
    {
      text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.",
      author: "Dan Salomon"
    },
    {
      text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.",
      author: "Antoine de Saint-Exupéry"
    },
    {
      text: "The most damaging phrase in the language is: 'It's always been done that way.'",
      author: "Grace Hopper"
    },
    {
      text: "Think twice, code once.",
      author: "Anonymous"
    },
    {
      text: "The expert in anything was once a beginner.",
      author: "Helen Hayes"
    }
  ];

  // ----- DOM refs -----
  const quoteText = document.getElementById('quoteText');
  const authorName = document.getElementById('authorName');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const copyBtn = document.getElementById('copyBtn');
  const shareBtn = document.getElementById('shareBtn');
  const currentQuoteNum = document.getElementById('currentQuoteNum');
  const totalQuotes = document.getElementById('totalQuotes');
  const toast = document.getElementById('toast');

  // ----- state -----
  let currentIndex = 0;
  let quoteHistory = [];
  let isTransitioning = false;

  // ----- initialize counter -----
  totalQuotes.textContent = quotes.length;

  // ----- show quote with animation -----
  function showQuote(index, animate = true) {
    if (isTransitioning) return;
    
    const quote = quotes[index];
    if (!quote) return;

    currentIndex = index;
    currentQuoteNum.textContent = index + 1;

    if (animate) {
      isTransitioning = true;
      
      // Fade out
      quoteText.classList.remove('show');
      quoteText.classList.add('fade');
      authorName.classList.remove('show');
      authorName.classList.add('fade');

      setTimeout(() => {
        // Update content
        quoteText.textContent = quote.text;
        authorName.textContent = quote.author;
        
        // Fade in
        quoteText.classList.remove('fade');
        quoteText.classList.add('show');
        authorName.classList.remove('fade');
        authorName.classList.add('show');
        
        isTransitioning = false;
      }, 300);
    } else {
      // Instant update (for initial load)
      quoteText.textContent = quote.text;
      authorName.textContent = quote.author;
      quoteText.classList.add('show');
      authorName.classList.add('show');
    }

    // Track history
    quoteHistory.push(index);
    if (quoteHistory.length > 50) quoteHistory.shift();
  }

  // ----- get random quote (different from current) -----
  function getRandomQuote() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === currentIndex && quotes.length > 1);
    return newIndex;
  }

  // ----- new quote -----
  function newQuote() {
    if (isTransitioning) return;
    const newIndex = getRandomQuote();
    showQuote(newIndex, true);
  }

  // ----- copy quote -----
  function copyQuote() {
    const quote = quotes[currentIndex];
    const text = `"${quote.text}" — ${quote.author}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Copied to clipboard!');
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 2000);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('📋 Copied to clipboard!');
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    } catch (err) {
      showToast('❌ Failed to copy');
    }
    document.body.removeChild(textarea);
  }

  // ----- share quote -----
  function shareQuote() {
    const quote = quotes[currentIndex];
    const text = `"${quote.text}" — ${quote.author}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Quote',
        text: text,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      copyQuote();
      showToast('📋 Quote copied for sharing!');
    }
  }

  // ----- toast notification -----
  let toastTimeout = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ----- keyboard shortcuts -----
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      newQuote();
    }
    if (e.key === 'c' || e.key === 'C') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        copyQuote();
      }
    }
    if (e.key === 's' || e.key === 'S') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        shareQuote();
      }
    }
  });

  // ----- event listeners -----
  newQuoteBtn.addEventListener('click', newQuote);
  copyBtn.addEventListener('click', copyQuote);
  shareBtn.addEventListener('click', shareQuote);

  // Double-click on quote to copy
  quoteText.addEventListener('dblclick', copyQuote);
  authorName.addEventListener('dblclick', copyQuote);

  // ----- init -----
  // Show a random quote on load
  const initialIndex = Math.floor(Math.random() * quotes.length);
  showQuote(initialIndex, false);

  console.log('✅ Quote Generator');
  console.log('   ⌨️  Space = new quote  |  c = copy  |  s = share');
  console.log(`   📚 ${quotes.length} quotes loaded`);
})();