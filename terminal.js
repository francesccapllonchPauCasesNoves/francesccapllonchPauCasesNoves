/**
 * ====================================================================
 * CachyOS Interactive Terminal - Componente para Portfolio
 * Desarrollado para Francesc Capllonch (@fr-capllonch)
 * Estilo Hacker / Dev Glassmorphic con soporte de comandos, historial y UI táctil
 * ====================================================================
 */

(function () {
  'use strict';

  // Configuración y datos del sistema
  const CONFIG = {
    username: 'visitor',
    hostname: 'cachyos',
    path: '~',
    version: '2.4.1',
    bootDelay: 2000, // Espera para que el preloader de la web haya terminado
    typeSpeed: 18,   // ms por caracter en la animación de boot
  };

  // Base de datos de proyectos
  const PROJECTS = [
    {
      title: 'ECO RIDE',
      tech: ['Dart', 'Flutter', 'Clean Architecture'],
      desc: 'Aplicación de movilidad sostenible desarrollada con Dart y Flutter. Implementa buenas prácticas y diseño reactivo.',
      url: 'https://github.com/fr-capllonch/practica_final_1_francesc_capllonch'
    },
    {
      title: 'LOG FILTER',
      tech: ['Java', 'RegEx', 'Data Processing'],
      desc: 'Herramienta de análisis y filtrado de registros de servidor en Java de alto rendimiento.',
      url: 'https://github.com/fr-capllonch/PF1'
    },
    {
      title: 'FLUTTER EXERCISE APP',
      tech: ['Flutter', 'Dart', 'Mobile UI'],
      desc: 'Proyecto de interfaz móvil multiplataforma explorando gestión de estado y diseño interactivo.',
      url: 'https://github.com/fr-capllonch/Exercici1_Flutter'
    },
    {
      title: 'PORTFOLIO WEB & SHELL',
      tech: ['HTML5', 'CSS3', 'Tailwind', 'JavaScript'],
      desc: 'Portfolio personal interactivo con emulador de terminal, internacionalización y diseño responsive.',
      url: 'https://github.com/fr-capllonch'
    }
  ];

  // Estado interno de la terminal
  let history = [];
  let historyIndex = -1;
  let isBooting = false;
  let bootSkipped = false;
  let activeThemeIndex = 0;
  const themes = ['', 'theme-matrix', 'theme-synthwave'];

  // Referencias a elementos del DOM
  let terminalWindow;
  let terminalBody;
  let terminalOutput;
  let terminalInput;
  let quickButtons;
  let closeBtn;
  let minimizeBtn;
  let maximizeBtn;

  /**
   * Inicialización del componente al cargar el DOM
   */
  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    setupEventListeners();
    scheduleBootSequence();
  });

  /**
   * Captura de elementos del DOM
   */
  function initElements() {
    terminalWindow = document.getElementById('terminal-window');
    terminalBody = document.getElementById('terminal-body');
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');
    quickButtons = document.querySelectorAll('.quick-btn');
    closeBtn = document.getElementById('term-btn-close');
    minimizeBtn = document.getElementById('term-btn-minimize');
    maximizeBtn = document.getElementById('term-btn-maximize');
  }

  /**
   * Programación de la secuencia de inicio
   */
  function scheduleBootSequence() {
    // Si hay un preloader en la página, esperamos a que termine
    const preloader = document.getElementById('preloader');
    const delay = preloader ? CONFIG.bootDelay : 300;

    setTimeout(() => {
      runBootSequence();
    }, delay);
  }

  /**
   * Ejecuta la animación de inicio con efecto de escritura (typewriter)
   */
  async function runBootSequence() {
    if (isBooting) return;
    isBooting = true;

    const bootLines = [
      { text: `[  \x1b[32mOK\x1b[0m  ] Initializing CachyOS Portfolio Shell v${CONFIG.version}...`, delay: 25 },
      { text: `[  \x1b[32mOK\x1b[0m  ] Kernel: 6.12.3-cachyos-bore (x86_64-v3)`, delay: 15 },
      { text: `[  \x1b[32mOK\x1b[0m  ] Loaded modules: DAM, Java, Flutter, Tailwind, Linux Kernel.`, delay: 15 },
      { text: `\x1b[36m➜\x1b[0m Session opened for user \x1b[32m${CONFIG.username}\x1b[0m@\x1b[36m${CONFIG.hostname}\x1b[0m`, delay: 20 },
      { text: `Type '\x1b[33mhelp\x1b[0m' to see available commands or click the quick buttons below.`, delay: 20 }
    ];

    for (const item of bootLines) {
      if (bootSkipped) break;
      await typeWriterLine(item.text, item.delay);
    }

    isBooting = false;
    terminalInput.disabled = false;
    terminalInput.focus();
    scrollToBottom();
  }

  /**
   * Imprime una línea con efecto máquina de escribir
   */
  function typeWriterLine(formattedText, charDelay = 20) {
    return new Promise((resolve) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'terminal-entry text-slate-300';
      terminalOutput.appendChild(lineDiv);

      // Si el usuario saltó la animación, renderizamos directo
      if (bootSkipped) {
        lineDiv.innerHTML = parseAnsiColors(formattedText);
        resolve();
        return;
      }

      // Renderizado rápido
      lineDiv.innerHTML = parseAnsiColors(formattedText);
      scrollToBottom();
      setTimeout(resolve, charDelay * 4);
    });
  }

  /**
   * Conversor simple de códigos ANSI a clases HTML
   */
  function parseAnsiColors(text) {
    return text
      .replace(/\x1b\[32m/g, '<span class="term-success">')
      .replace(/\x1b\[36m/g, '<span class="term-highlight">')
      .replace(/\x1b\[33m/g, '<span class="term-warning">')
      .replace(/\x1b\[31m/g, '<span class="term-error">')
      .replace(/\x1b\[0m/g, '</span>');
  }

  /**
   * Configuración de eventos de interacción
   */
  function setupEventListeners() {
    // Enfocar el input al hacer clic en cualquier punto del interior de la terminal
    if (terminalBody) {
      terminalBody.addEventListener('click', () => {
        terminalInput.focus();
      });
    }

    // Manejador de teclado para el input
    if (terminalInput) {
      terminalInput.addEventListener('keydown', handleKeyDown);
    }

    // Botones de acceso rápido táctiles
    quickButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          executeCommandDirectly(cmd);
        }
      });
    });

    // Botones de control de ventana estilo macOS/Linux
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetTerminal();
      });
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMinimize();
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMaximize();
      });
    }
  }

  /**
   * Manejador de teclas especiales (Enter, Flechas arriba/abajo, Tab)
   */
  function handleKeyDown(e) {
    // Si aún está en boot, saltar animación inmediatamente al interactuar
    if (isBooting) {
      bootSkipped = true;
    }

    if (e.key === 'Enter') {
      const rawInput = terminalInput.value;
      const cmd = rawInput.trim();
      terminalInput.value = '';

      if (cmd.length > 0) {
        history.push(cmd);
        historyIndex = history.length;
      }

      printCommandLine(rawInput);
      processCommand(cmd);
      scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex > 0) {
        historyIndex--;
        terminalInput.value = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        terminalInput.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        terminalInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabAutocomplete();
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      clearScreen();
    }
  }

  /**
   * Autocompletado con tecla Tab
   */
  function handleTabAutocomplete() {
    const current = terminalInput.value.trim().toLowerCase();
    if (!current) return;

    const available = ['help', 'about', 'projects', 'skills', 'neofetch', 'fetch', 'contact', 'clear', 'theme', 'whoami', 'date', 'sudo'];
    const matches = available.filter(c => c.startsWith(current));

    if (matches.length === 1) {
      terminalInput.value = matches[0];
    } else if (matches.length > 1) {
      printCommandLine(current);
      const matchText = matches.map(m => `<span class="term-highlight">${m}</span>`).join('   ');
      printOutput(`<div class="term-muted">Posibles comandos:</div><div>${matchText}</div>`);
      terminalInput.value = current;
      scrollToBottom();
    }
  }

  /**
   * Ejecuta un comando disparado desde la UI táctil
   */
  function executeCommandDirectly(cmd) {
    if (isBooting) {
      bootSkipped = true;
      isBooting = false;
    }

    history.push(cmd);
    historyIndex = history.length;

    printCommandLine(cmd);
    processCommand(cmd);
    terminalInput.value = '';
    terminalInput.focus();
    scrollToBottom();
  }

  /**
   * Imprime en pantalla la línea del prompt ejecutada
   */
  function printCommandLine(cmd) {
    const entry = document.createElement('div');
    entry.className = 'terminal-entry';
    entry.innerHTML = `
      <div class="terminal-cmd-echo">
        <span class="term-prompt-user">${CONFIG.username}</span><span class="term-prompt-at">@</span><span class="term-prompt-host">${CONFIG.hostname}</span><span class="term-prompt-sep">:</span><span class="term-prompt-path">${CONFIG.path}</span><span class="term-prompt-sign">$</span>
        <span class="text-slate-100 font-bold ml-1">${escapeHtml(cmd)}</span>
      </div>
    `;
    terminalOutput.appendChild(entry);
  }

  /**
   * Imprime salida en la terminal
   */
  function printOutput(htmlContent) {
    const outputBlock = document.createElement('div');
    outputBlock.className = 'terminal-output-block mb-3';
    outputBlock.innerHTML = htmlContent;
    terminalOutput.appendChild(outputBlock);
  }

  /**
   * Procesador e intérprete principal de comandos
   */
  function processCommand(rawCmd) {
    const parts = rawCmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!cmd) return;

    switch (cmd) {
      case 'help':
        renderHelp();
        break;

      case 'about':
        renderAbout();
        break;

      case 'projects':
        renderProjects();
        break;

      case 'skills':
        renderSkills();
        break;

      case 'neofetch':
      case 'fetch':
        renderNeofetch();
        break;

      case 'contact':
        renderContact();
        break;

      case 'clear':
        clearScreen();
        break;

      case 'theme':
        cycleTheme();
        break;

      case 'whoami':
        printOutput(`<div class="term-highlight">visitor</div><div class="text-xs text-slate-400">Permisos: Explorador autorizado del portfolio</div>`);
        break;

      case 'date':
        printOutput(`<div>${new Date().toLocaleString()}</div>`);
        break;

      case 'sudo':
        printOutput(`<div class="term-error">🚨 Permiso denegado: el usuario '${CONFIG.username}' no está en el archivo sudoers. Este incidente será reportado. 😉</div>`);
        break;

      default:
        printOutput(`
          <div class="term-error">cachyos-shell: command not found: <span class="font-bold">${escapeHtml(cmd)}</span></div>
          <div class="text-slate-400 text-xs mt-1">Escribe '<span class="term-warning cursor-pointer underline" onclick="window.TerminalRun('help')">help</span>' para ver la lista de comandos disponibles.</div>
        `);
        break;
    }
  }

  /**
   * COMANDO: help
   */
  function renderHelp() {
    const html = `
      <div class="space-y-1">
        <div class="term-highlight font-bold mb-2">Comandos del sistema disponibles:</div>
        <div class="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-x-3 gap-y-1 text-sm">
          <div><span class="term-warning font-bold">help</span></div>
          <div class="text-slate-300">Muestra este menú de ayuda y comandos.</div>

          <div><span class="term-warning font-bold">about</span></div>
          <div class="text-slate-300">Biografía sobre mi perfil, formación y filosofía.</div>

          <div><span class="term-warning font-bold">projects</span></div>
          <div class="text-slate-300">Listado de proyectos destacados con enlaces a GitHub.</div>

          <div><span class="term-warning font-bold">skills</span></div>
          <div class="text-slate-300">Stack tecnológico y competencias en formato tabla.</div>

          <div><span class="term-warning font-bold">neofetch</span></div>
          <div class="text-slate-300">Ficha técnica del sistema CachyOS / Arch y specs.</div>

          <div><span class="term-warning font-bold">contact</span></div>
          <div class="text-slate-300">Información de contacto, email y redes sociales.</div>

          <div><span class="term-warning font-bold">clear</span></div>
          <div class="text-slate-300">Limpia la pantalla de la terminal.</div>

          <div><span class="term-warning font-bold">theme</span></div>
          <div class="text-slate-300">Alterna el esquema de colores Neón (Cyan / Matrix / Synthwave).</div>
        </div>
        <div class="term-muted text-xs mt-2 pt-2 border-t border-slate-800">
          Tip: Usa las teclas [↑] y [↓] para navegar por el historial o [Tab] para autocompletar.
        </div>
      </div>
    `;
    printOutput(html);
  }

  /**
   * COMANDO: about
   */
  function renderAbout() {
    const html = `
      <div class="space-y-2">
        <div class="term-highlight font-bold text-base">Francesc Capllonch Massanet</div>
        <div class="text-indigo-400 font-medium">Estudiante de DAM (Desarrollo de Aplicaciones Multiplataforma) @ CIFP Pau Casesnoves</div>
        <p class="text-slate-300 leading-relaxed">
          Apasionado por la informática, los sistemas Linux y el desarrollo de software limpio y eficiente. 
          Cuento con formación como <span class="term-highlight">Técnico en Sistemas Microinformáticos y Redes (SMR - EQF 4)</span> 
          y una constante motivación por la ciberseguridad.
        </p>
        <p class="text-slate-300 leading-relaxed">
          Además del código, soy monitor de <span class="term-highlight">Kitesurf</span> desde hace más de 2 años. Esta experiencia 
          me ha enseñado a comunicarme con claridad en inglés, trabajar bajo presión, resolver imprevistos y liderar personas 
          con paciencia y empatía.
        </p>
        <div class="flex items-center gap-2 pt-1 text-xs text-slate-400">
          <span class="term-success">●</span> Mallorca, Illes Balears &nbsp;|&nbsp; 
          <span class="term-success">●</span> Enfoque: Frontend Moderno, Cross-Platform (Flutter) & Linux
        </div>
      </div>
    `;
    printOutput(html);
  }

  /**
   * COMANDO: projects
   */
  function renderProjects() {
    let cardsHtml = PROJECTS.map((proj, idx) => `
      <div class="term-project-card">
        <div class="flex flex-wrap items-center justify-between gap-1 mb-1">
          <span class="font-bold text-slate-100">${idx + 1}. ${proj.title}</span>
          <a href="${proj.url}" target="_blank" rel="noopener noreferrer" class="term-link text-xs flex items-center gap-1">
            Ver código en GitHub <span>↗</span>
          </a>
        </div>
        <p class="text-xs text-slate-300 mb-2">${proj.desc}</p>
        <div class="flex flex-wrap gap-1">
          ${proj.tech.map(t => `<span class="term-tag">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');

    const html = `
      <div>
        <div class="term-highlight font-bold mb-2">Proyectos Destacados en GitHub:</div>
        ${cardsHtml}
      </div>
    `;
    printOutput(html);
  }

  /**
   * COMANDO: skills
   */
  function renderSkills() {
    const html = `
      <div class="space-y-3">
        <div class="term-highlight font-bold">Stack Tecnológico & Competencias:</div>
        <div class="term-table-wrapper">
          <pre class="term-ascii text-xs sm:text-sm">
┌────────────────────┬─────────────────────────────────────────────────┐
│ CATEGORÍA          │ TECNOLOGÍAS & HERRAMIENTAS                      │
├────────────────────┼─────────────────────────────────────────────────┤
│ Lenguajes          │ Java, JavaScript, Dart, SQL, HTML5, CSS3, Bash  │
│ Frameworks & UI    │ Tailwind CSS, Flutter, Responsive Design        │
│ Bases de Datos     │ MySQL, MongoDB (Relacionales & NoSQL)           │
│ Sistemas & DevOps  │ CachyOS / Arch Linux, Git, GitHub, Cisco PT     │
│ Certificaciones    │ Título SMR (EQF Nivel 4), Cisco Ciberseguridad │
│ Idiomas            │ Castellano (Nativo), Catalán (Nativo), Inglés   │
└────────────────────┴─────────────────────────────────────────────────┘</pre>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span class="term-success font-bold">Mentalidad de Seguridad:</span> Enfoque proactivo en buenas prácticas y diseño seguro.
          </div>
          <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span class="term-highlight font-bold">Pensamiento Crítico:</span> Capacidad de análisis y resolución estructurada de bugs.
          </div>
        </div>
      </div>
    `;
    printOutput(html);
  }

  /**
   * COMANDO: neofetch / fetch
   */
  function renderNeofetch() {
    const asciiLogo = `
       /\\         
      /  \\        
     /\\   \\       
    /      \\      
   /   ,,   \\     
  /   |  |  -\\    
 /_-''    ''-_\\   `;

    const html = `
      <div class="neofetch-container">
        <div class="neofetch-logo">${asciiLogo}</div>
        <div class="neofetch-info">
          <div class="neofetch-title">francesc<span class="text-slate-400">@</span>cachyos-zenith</div>
          <div class="neofetch-sep">-----------------------------</div>
          <div class="neofetch-row"><span class="neofetch-key">OS:</span><span class="neofetch-val">CachyOS Linux x86_64 (Arch-based)</span></div>
          <div class="neofetch-row"><span class="neofetch-key">Host:</span><span class="neofetch-val">CIFP Pau Casesnoves</span></div>
          <div class="neofetch-row"><span class="neofetch-key">Kernel:</span><span class="neofetch-val">6.12.3-cachyos-bore</span></div>
          <div class="neofetch-row"><span class="neofetch-key">Uptime:</span><span class="neofetch-val">DAM Student (Year 2)</span></div>
          <div class="neofetch-row"><span class="neofetch-key">Shell:</span><span class="neofetch-val">zsh 5.9 (x86_64-pc-linux-gnu)</span></div>
          <div class="neofetch-row"><span class="neofetch-key">WM:</span><span class="neofetch-val">Hyprland / Web-Engine</span></div>
          <div class="neofetch-row"><span class="neofetch-key">Terminal:</span><span class="neofetch-val">CachyOS Portfolio Shell v${CONFIG.version}</span></div>
          <div class="neofetch-row"><span class="neofetch-key">Interests:</span><span class="neofetch-val">Linux, Web Dev, Cybersecurity, Kitesurf 🏄</span></div>
          <div class="neofetch-row"><span class="neofetch-key">Memory:</span><span class="neofetch-val">100% Focused & Motivated</span></div>

          <div class="neofetch-palette">
            <span class="palette-box bg-slate-900 border border-slate-700"></span>
            <span class="palette-box bg-red-500"></span>
            <span class="palette-box bg-emerald-500"></span>
            <span class="palette-box bg-yellow-400"></span>
            <span class="palette-box bg-sky-500"></span>
            <span class="palette-box bg-purple-500"></span>
            <span class="palette-box bg-cyan-400"></span>
            <span class="palette-box bg-slate-100"></span>
          </div>
        </div>
      </div>
    `;
    printOutput(html);
  }

  /**
   * COMANDO: contact
   */
  function renderContact() {
    const html = `
      <div class="space-y-2">
        <div class="term-highlight font-bold">Información de Contacto & Redes:</div>
        <div class="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-sm">
          <div class="text-slate-400">Email:</div>
          <div><a href="mailto:frcapllonch@outlook.com" class="term-link font-mono">frcapllonch@outlook.com</a></div>

          <div class="text-slate-400">LinkedIn:</div>
          <div><a href="https://www.linkedin.com/in/francesc-capllonch-massanet-62b5a2365/" target="_blank" rel="noopener noreferrer" class="term-link">linkedin.com/in/francesc-capllonch-massanet</a></div>

          <div class="text-slate-400">GitHub:</div>
          <div><a href="https://github.com/fr-capllonch" target="_blank" rel="noopener noreferrer" class="term-link font-mono">github.com/fr-capllonch</a></div>

          <div class="text-slate-400">Ubicación:</div>
          <div class="text-slate-200">Mallorca, España 📍</div>
        </div>
      </div>
    `;
    printOutput(html);
  }

  /**
   * COMANDO: clear
   */
  function clearScreen() {
    terminalOutput.innerHTML = '';
  }

  /**
   * COMANDO: theme (alterna esquemas de color)
   */
  function cycleTheme() {
    themes.forEach(t => {
      if (t) terminalWindow.classList.remove(t);
    });

    activeThemeIndex = (activeThemeIndex + 1) % themes.length;
    const nextTheme = themes[activeThemeIndex];
    if (nextTheme) {
      terminalWindow.classList.add(nextTheme);
    }

    const themeNames = ['Cyberpunk Cyan (Default)', 'Matrix Green', 'Synthwave Magenta'];
    printOutput(`<div class="term-success">Esquema de color cambiado a: <span class="font-bold">${themeNames[activeThemeIndex]}</span></div>`);
  }

  /**
   * Reinicio completo de la terminal (Botón rojo)
   */
  function resetTerminal() {
    clearScreen();
    bootSkipped = false;
    printOutput(`<div class="term-warning text-xs mb-2">⚡ Reiniciando sesión de shell CachyOS...</div>`);
    runBootSequence();
  }

  /**
   * Minimizar la terminal (Botón amarillo)
   */
  function toggleMinimize() {
    terminalWindow.classList.toggle('minimized');
    if (!terminalWindow.classList.contains('minimized')) {
      terminalInput.focus();
    }
  }

  /**
   * Maximizar la terminal (Botón verde)
   */
  function toggleMaximize() {
    terminalWindow.classList.toggle('maximized');
    scrollToBottom();
    terminalInput.focus();
  }

  /**
   * Desplaza el scroll automáticamente hacia el final
   */
  function scrollToBottom() {
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  /**
   * Helper para escapar strings HTML
   */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Exportar helper a ventana para enlaces clickeables interactivos
  window.TerminalRun = function (cmd) {
    executeCommandDirectly(cmd);
  };

})();

