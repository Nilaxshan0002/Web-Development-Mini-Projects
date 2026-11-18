// script.js – CodeForge editor logic

(function() {
  "use strict";

  // ----- default code snippets -----
  const defaultCode = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Demo</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 1rem; background: #f5f7fb; color: #1a1f2e; }
    h1 { color: #3b6eff; }
    .card { background: white; padding: 1.5rem; border-radius: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
    button { background: #3b6eff; border: none; color: white; padding: 0.6rem 1.6rem; border-radius: 40px; font-weight: 600; cursor: pointer; }
    button:hover { background: #2a56d9; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✨ CodeForge</h1>
    <p>Write HTML, CSS & JavaScript in real-time.</p>
    <button id="clickMe">Click me</button>
    <p id="message" style="margin-top:0.8rem; font-weight:500;"></p>
  </div>
  <script>
    document.getElementById('clickMe')?.addEventListener('click', function() {
      document.getElementById('message').textContent = '🎉 Hello from JavaScript!';
    });
  <\/script>
</body>
</html>`,
    css: `/* style.css */
body {
  background: #0d1117;
  color: #e6edf3;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.card {
  background: #161b22;
  padding: 2rem 3rem;
  border-radius: 32px;
  border: 1px solid #30363d;
  text-align: center;
}
h1 {
  color: #58a6ff;
}
button {
  background: #238636;
  border: none;
  color: white;
  padding: 0.6rem 2rem;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}
button:hover {
  background: #2ea043;
}`,
    js: `// script.js
console.log('🚀 CodeForge ready!');

function greet(name) {
  return \`Hello, \${name}!\`;
}

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.createElement('button');
  btn.textContent = 'Run JS';
  btn.style.cssText = 'background:#3b6eff; border:none; color:white; padding:0.6rem 1.6rem; border-radius:40px; font-weight:600; cursor:pointer; margin-top:1rem;';
  document.body.prepend(btn);

  btn.addEventListener('click', function() {
    alert(greet('Developer'));
  });
});`
  };

  // ----- state -----
  let currentFile = 'html';
  let editor = null;
  let currentCode = { ...defaultCode };

  // ----- DOM refs -----
  const editorContainer = document.getElementById('editorContainer');
  const previewFrame = document.getElementById('previewFrame');
  const consoleOutput = document.getElementById('consoleOutput');
  const langBadge = document.getElementById('langBadge');
  const runBtn = document.getElementById('runBtn');
  const resetBtn = document.getElementById('resetBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fileTabs = document.querySelectorAll('.file-tabs button');

  // ----- init CodeMirror -----
  function initEditor() {
    editor = CodeMirror(editorContainer, {
      value: currentCode.html,
      mode: 'htmlmixed',
      theme: 'dracula',
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      lineWrapping: true,
      extraKeys: {
        "Ctrl-S": function() { runCode(); },
        "Cmd-S": function() { runCode(); }
      }
    });

    editor.on('change', function() {
      clearTimeout(window._editorTimeout);
      window._editorTimeout = setTimeout(() => {
        runCode();
      }, 400);
    });

    updateEditorContent('html');
  }

  // ----- update editor content based on file -----
  function updateEditorContent(file) {
    if (!editor) return;
    currentFile = file;
    let code = currentCode[file] || '';
    editor.setValue(code);

    let mode = 'htmlmixed';
    let label = 'HTML';
    if (file === 'css') { mode = 'css'; label = 'CSS'; }
    else if (file === 'js') { mode = 'javascript'; label = 'JavaScript'; }
    editor.setOption('mode', mode);
    langBadge.textContent = label;

    fileTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.file === file);
    });
  }

  // ----- run / preview -----
  function runCode() {
    if (!editor) return;
    currentCode[currentFile] = editor.getValue();

    let fullHtml = currentCode.html;

    if (currentCode.css && currentCode.css.trim()) {
      const cssTag = `<style>${currentCode.css}</style>`;
      if (fullHtml.includes('</head>')) {
        fullHtml = fullHtml.replace('</head>', cssTag + '</head>');
      } else {
        fullHtml = cssTag + fullHtml;
      }
    }

    if (currentCode.js && currentCode.js.trim()) {
      const jsTag = `<script>${currentCode.js}<\/script>`;
      if (fullHtml.includes('</body>')) {
        fullHtml = fullHtml.replace('</body>', jsTag + '</body>');
      } else {
        fullHtml = fullHtml + jsTag;
      }
    }

    try {
      const doc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(fullHtml);
        doc.close();
        consoleOutput.textContent = '✅ Preview updated successfully';
        consoleOutput.className = 'output success';
      } else {
        consoleOutput.textContent = '⚠️ Could not access iframe';
        consoleOutput.className = 'output error';
      }
    } catch (err) {
      consoleOutput.textContent = '❌ Error: ' + err.message;
      consoleOutput.className = 'output error';
    }
  }

  // ----- reset current file to default -----
  function resetCurrentFile() {
    if (!editor) return;
    const defaultVal = defaultCode[currentFile] || '';
    currentCode[currentFile] = defaultVal;
    editor.setValue(defaultVal);
    runCode();
    consoleOutput.textContent = `↺ Reset ${currentFile} to default`;
    consoleOutput.className = 'output';
  }

  // ----- clear editor content -----
  function clearEditor() {
    if (!editor) return;
    editor.setValue('');
    currentCode[currentFile] = '';
    runCode();
    consoleOutput.textContent = `🧹 Cleared ${currentFile}`;
    consoleOutput.className = 'output';
  }

  // ----- file tab switching -----
  fileTabs.forEach(btn => {
    btn.addEventListener('click', function() {
      const file = this.dataset.file;
      if (editor) {
        currentCode[currentFile] = editor.getValue();
      }
      updateEditorContent(file);
      runCode();
    });
  });

  // ----- event listeners -----
  runBtn.addEventListener('click', function() {
    if (editor) {
      currentCode[currentFile] = editor.getValue();
    }
    runCode();
    consoleOutput.textContent = '▶️ Running...';
    setTimeout(() => {
      consoleOutput.textContent = '✅ Run complete';
      consoleOutput.className = 'output success';
    }, 200);
  });

  resetBtn.addEventListener('click', resetCurrentFile);
  clearBtn.addEventListener('click', clearEditor);

  // ----- keyboard shortcut: Ctrl+Enter to run -----
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runBtn.click();
    }
  });

  // ----- init -----
  initEditor();
  setTimeout(() => {
    runCode();
    consoleOutput.textContent = '🚀 Ready — edit code and see live preview';
    consoleOutput.className = 'output success';
  }, 300);

  previewFrame.addEventListener('error', function() {
    consoleOutput.textContent = '⚠️ Iframe load error';
    consoleOutput.className = 'output error';
  });

})();