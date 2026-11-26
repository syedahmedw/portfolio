/* ══════════════════════════════════════════════
   Syed Ahmed W — Portfolio JavaScript
   Clean, modular, zero-dependency interactions.
   ══════════════════════════════════════════════ */

;(function () {
  'use strict';

  // ── Helpers ──
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ══════════════════════════════════════════════
  // FOOTER YEAR
  // ══════════════════════════════════════════════
  $$('#year').forEach(el => { el.textContent = new Date().getFullYear(); });

  // ══════════════════════════════════════════════
  // READING PROGRESS BAR
  // ══════════════════════════════════════════════
  const progressBar = $('#reading-progress-bar');

  function updateReadingProgress() {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.width = Math.max(0, Math.min(100, ratio * 100)) + '%';
  }

  if (progressBar) {
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress();
  }

  // ══════════════════════════════════════════════
  // THEME TOGGLE
  // ══════════════════════════════════════════════
  const themeToggle = $('.theme-toggle');
  const savedTheme = (() => {
    try { return localStorage.getItem('saw-theme'); } catch { return null; }
  })();

  if (savedTheme === 'light') document.body.classList.add('light-theme');

  if (themeToggle) {
    const updateThemeLabel = () => {
      const isLight = document.body.classList.contains('light-theme');
      themeToggle.textContent = isLight ? '☼' : '◐';
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      themeToggle.title = isLight ? 'Switch to dark theme' : 'Switch to light theme';
      // Update meta theme-color
      const metaTheme = $('meta[name="theme-color"]');
      if (metaTheme) metaTheme.content = isLight ? '#f4f5f0' : '#0b0d0b';
    };

    updateThemeLabel();
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      try {
        localStorage.setItem('saw-theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
      } catch { /* ignore */ }
      updateThemeLabel();
    });
  }

  // ══════════════════════════════════════════════
  // PROJECTS HUB — SEARCH, FILTER, SORT
  // ══════════════════════════════════════════════
  const searchInput = $('#project-search');
  const projectTiles = $$('#project-grid .project-tile');
  const filterButtons = $$('.filter-chip');
  let activeFilter = 'all';

  function updateProjects() {
    if (!projectTiles.length) return;
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;

    projectTiles.forEach(tile => {
      const matchesCategory = activeFilter === 'all' || tile.dataset.category === activeFilter;
      const haystack = (tile.dataset.search + ' ' + tile.textContent).toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const show = matchesCategory && matchesQuery;

      tile.hidden = !show;
      if (show) visible++;
    });

    const count = $('#results-count');
    if (count) count.textContent = visible + ' project' + (visible === 1 ? '' : 's');

    const empty = $('#empty-state');
    if (empty) empty.hidden = visible !== 0;
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateProjects);
  }

  filterButtons.forEach(button =>
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      updateProjects();
    })
  );

  const clearFilters = $('#clear-filters');
  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      activeFilter = 'all';
      if (searchInput) searchInput.value = '';
      filterButtons.forEach((item, index) => {
        item.classList.toggle('active', index === 0);
        item.setAttribute('aria-pressed', String(index === 0));
      });
      updateProjects();
    });
  }

  // Keyboard shortcuts for search
  document.addEventListener('keydown', event => {
    if (event.key === '/' && searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === 'Escape' && searchInput && document.activeElement === searchInput) {
      searchInput.value = '';
      updateProjects();
      searchInput.blur();
    }
  });

  // Sort control
  const sortSelect = $('#project-sort');
  const projectGrid = $('#project-grid');

  if (sortSelect && projectGrid) {
    const originalOrder = [...projectGrid.querySelectorAll('.project-tile')];

    sortSelect.addEventListener('change', () => {
      const mode = sortSelect.value;
      const ordered = [...originalOrder];

      if (mode === 'az') {
        ordered.sort((a, b) => {
          const aTitle = $('h2', a)?.textContent || '';
          const bTitle = $('h2', b)?.textContent || '';
          return aTitle.localeCompare(bTitle);
        });
      } else if (mode === 'category') {
        ordered.sort((a, b) => {
          const catCmp = (a.dataset.category || '').localeCompare(b.dataset.category || '');
          if (catCmp !== 0) return catCmp;
          const aTitle = $('h2', a)?.textContent || '';
          const bTitle = $('h2', b)?.textContent || '';
          return aTitle.localeCompare(bTitle);
        });
      }

      ordered.forEach(tile => projectGrid.appendChild(tile));
    });
  }

  // ══════════════════════════════════════════════
  // PROJECT DETAIL PAGE
  // ══════════════════════════════════════════════
  const projects = {
    'vaultcards': {
      title: 'VaultCards',
      category: 'ANDROID / PRIVACY',
      summary: 'A private, offline-first Android vault for keeping card, banking, identity, and family details organized — secured with AES-256 GCM encryption and biometric authentication.',
      repo: 'https://github.com/syedahmedw/VaultCards',
      screenshots: [
        { src: 'assets/project-screenshots/vaultcards/vault-settings.jpeg', alt: 'VaultCards home screen with a list of card types', caption: 'Vault home' },
        { src: 'assets/project-screenshots/vaultcards/add-debit-card.jpeg', alt: 'Purple preview on the credit card form', caption: 'Credit card form' },
        { src: 'assets/project-screenshots/vaultcards/add-credit-card.jpeg', alt: 'Blue preview on the debit card form', caption: 'Debit card form' },
        { src: 'assets/project-screenshots/vaultcards/add-document.jpeg', alt: 'VaultCards document template selection', caption: 'Document templates' },
        { src: 'assets/project-screenshots/vaultcards/vault-home.jpeg', alt: 'VaultCards PIN and biometric controls', caption: 'Security settings' },
        { src: 'assets/project-screenshots/vaultcards/vault-home-backup.jpeg', alt: 'VaultCards bank account entry form', caption: 'Bank account form' },
        { src: 'assets/project-screenshots/vaultcards/restore-backup.jpeg', alt: 'VaultCards restore from backup dialog', caption: 'Restore from backup' },
        { src: 'assets/project-screenshots/vaultcards/share-details.jpeg', alt: 'VaultCards welcome screen', caption: 'Welcome screen' }
      ],
      tags: ['Kotlin', 'Jetpack Compose', 'Room Database', 'AES-256 GCM', 'Biometric Auth', 'Material 3'],
      about: 'VaultCards is an offline-first Android application built with Kotlin and Jetpack Compose for securely organizing credit/debit card details, banking information, identity documents, and family records. The source code confirms AES-256 GCM encryption via the Android Keystore system, with PBKDF2 key derivation. The app uses Room Database for local persistence, Material 3 theming with customizable card designs, and supports biometric unlock through Android\'s BiometricPrompt API. Features include encrypted JSON backup/restore, selective field sharing via text, search across all vault items, and an onboarding flow.',
      features: [
        'Store and organize credit cards, debit cards, banking accounts, identity documents, and family member records.',
        'AES-256 GCM encryption with Android Keystore integration and PBKDF2 key derivation (confirmed in source code).',
        'Biometric authentication using Android BiometricPrompt with PIN fallback.',
        'Customizable card themes with gradient colors, chip display, and card network detection.',
        'Encrypted JSON backup and restore with file-level encryption.',
        'Selective field sharing — choose exactly which details to share as formatted text.',
        'Full-text search across all vault items with category filtering.',
        'Material 3 UI with dark/light theme support and onboarding walkthrough.'
      ],
      techDetails: 'Built with Kotlin and Jetpack Compose using MVVM architecture. Data layer uses Room Database with DAO pattern. Security layer implements VaultCrypto (AES-256 GCM, 12-byte IV, 128-bit tag), VaultAuthManager (BiometricPrompt + PIN), and ExportImportManager (encrypted JSON). Navigation via Jetpack Navigation Compose.'
    },

    'expense-tracker': {
      title: 'Travel Expense Tracker',
      category: 'WEB APP / TRAVEL FINANCE',
      summary: 'A mobile-friendly, installable Progressive Web App for organizing trip expenses into editable categories, tracking budgets, and exporting summaries.',
      repo: 'https://github.com/syedahmedw/Travel-Expense-Tracker',
      screenshots: [
        { src: 'assets/project-screenshots/travel/home.webp', alt: 'Expense Tracker home with a trip budget and expense categories', caption: 'Expense entry and trip budget' },
        { src: 'assets/project-screenshots/travel/summary.webp', alt: 'Expense Tracker summary with a category pie chart and totals', caption: 'Spending breakdown and totals' },
        { src: 'assets/project-screenshots/travel/export.webp', alt: 'Expense Tracker export options for JSON, CSV, and Excel', caption: 'Export options' }
      ],
      tags: ['JavaScript', 'HTML / CSS', 'Chart.js', 'Service Workers', 'PWA', 'LocalStorage'],
      about: 'The Travel Expense Tracker is described in the resume as an installable Progressive Web App built with JavaScript, HTML, and CSS. It supports trip expense entries grouped into editable categories, per-category and grand totals, budget warnings, Chart.js pie-chart visualizations, and JSON/CSV/Excel export. Data is stored locally using the Web Storage API and the project includes a service worker for offline-ready PWA behavior.',
      features: [
        'Add and delete trip expenses organized into customizable categories.',
        'Set a trip budget and receive over-budget warnings.',
        'View category totals and a Chart.js pie-chart summary visualization.',
        'Export expense records to JSON, CSV, or Excel formats.',
        'Installable as a Progressive Web App with offline support via Service Workers.',
        'Responsive mobile-friendly layout for use during travel.'
      ]
    },

    'sgpa-calculator': {
      title: 'SGPA Calculator 2.0',
      category: 'EDUCATION / WEB APP',
      summary: 'A responsive single-page SGPA calculator with credit-weighted calculations, dynamic grade-point computation, and browser storage for data persistence.',
      repo: null,
      privateRepo: true,
      tags: ['JavaScript', 'HTML / CSS', 'PWA', 'Service Worker', 'Local Storage', 'Private Repository'],
      about: 'The SGPA Calculator 2.0 is a responsive web application for computing semester GPAs. The inspected source code confirms: students enter subjects with CIE marks (0–50), SEE marks (0–50), and credit values (1–4). The app calculates total marks, maps them to grade points using VTU-style thresholds (90+ → 10, 80+ → 9, ... 40+ → 5, below 40 → 0), computes credit-weighted contributions, and derives the SGPA. It includes save/load via localStorage, a dark mode toggle with system preference detection, and a web app manifest with service worker for PWA installation. This is also known as the Academic Performance Tracker.',
      features: [
        'Enter subjects with CIE marks, SEE marks, and credit values.',
        'Automatic grade-point calculation using VTU-style mark thresholds (confirmed in source).',
        'Credit-weighted SGPA computation displayed in real time.',
        'Save and reload subject data using browser localStorage.',
        'Dark/light theme toggle with system preference detection.',
        'PWA support with web app manifest and service worker for offline use.'
      ],
      techDetails: 'Pure vanilla JavaScript with DOM manipulation. Grade calculation: total = CIE + SEE, mapped to grade points (90→10, 80→9, 70→8, 60→7, 50→6, 40→5, <40→0). SGPA = Σ(credit × grade) / Σ(credit). Includes manifest.json and service-worker.js for installability.'
    },

    'stock-dashboard': {
      repo: 'https://github.com/mrmasn/fiction/tree/Stock-data-analysis',
      title: 'Stock Data Analysis Dashboard',
      category: 'DATA ANALYTICS / POWER BI',
      summary: 'An interactive financial dashboard exploring 52-week stock performance through KPIs, DAX calculations, slicers, and data modeling.',
      tags: ['Power BI', 'DAX', 'Data Modeling', 'Financial Analysis'],
      about: 'As described in the resume, this Power BI dashboard analyzes 52-week stock performance using advanced DAX calculations, dynamic KPIs, slicers, and data modeling. It is designed to make financial performance easier to explore through interactive visuals and calculated measures.',
      features: [
        'Explore stock performance across a 52-week period with interactive visuals.',
        'Dynamic KPIs and calculated measures using advanced DAX formulas.',
        'Filter dashboard views with slicers.',
        'Use a data model to organize underlying stock data.'
      ]
    },

    'co2-analytics': {
      repo: 'https://github.com/mrmasn/Tableau',
      title: 'Global CO₂ Emission Analytics',
      screenshots: [
        { src: 'assets/project-screenshots/tableau/dashboard.png', alt: 'Embedded Tableau preview with per-capita emissions, world emissions, and top emitters', caption: 'Dashboard thumbnail from the Tableau workbook' }
      ],
      category: 'DATA ANALYTICS / TABLEAU',
      summary: 'An interactive Tableau dashboard for exploring global emissions patterns with geospatial maps, trends, and dynamic filters.',
      tags: ['Tableau', 'Geospatial Analysis', 'Data Visualization'],
      about: 'As described in the resume, this Tableau dashboard uses geospatial maps, trend visualizations, and dynamic filters to analyze global CO₂ emissions patterns. It supports data-driven exploration of environmental data across regions and time periods.',
      features: [
        'Explore geographic emissions differences using interactive map visualizations.',
        'Inspect emissions trends over time.',
        'Explore emissions patterns using dynamic filters.'
      ]
    },

    'weather-app': {
      repo: 'https://github.com/syedahmedw/cloud-peek',
      title: 'Interactive Weather Application',
      category: 'WEB APPLICATION / API',
      summary: 'A responsive weather application using JavaScript and the OpenWeather API for dynamic, real-time data rendering.',
      tags: ['JavaScript', 'REST API', 'Responsive Design', 'Async/Await', 'Error Handling'],
      about: 'As described in the resume, this responsive weather application integrates the OpenWeather API with asynchronous JavaScript (fetch/async-await) for real-time data fetching, dynamic content rendering, and comprehensive error handling for invalid searches and API failures.',
      features: [
        'Fetch and render live weather data using async JavaScript and the OpenWeather API.',
        'Display temperature, humidity, wind speed, and weather conditions dynamically.',
        'Handle loading states, invalid city searches, and API errors gracefully.',
        'Responsive layout that works across desktop, tablet, and mobile screens.'
      ]
    },

    'portfolio': {
      title: 'Personal Portfolio Website',
      category: 'PERSONAL / WEB',
      summary: 'A premium dark portfolio with a separate Projects Hub, keyboard navigation, theme toggle, and responsive design — built to present work clearly.',
      tags: ['HTML / CSS', 'JavaScript', 'Responsive Design', 'Accessibility', 'Dark Theme'],
      about: 'This portfolio redesign evolves the original personal website into a deliberate professional experience. The homepage introduces the person behind the work with an editorial layout, while the separate Projects Hub lets visitors search, filter, and sort a growing project collection. The site features a reading progress bar, keyboard-accessible quick navigation (Ctrl/⌘+K), dark/light theme toggle with preference persistence, semantic HTML, and responsive layouts from desktop through mobile.',
      features: [
        'Separate homepage, Projects Hub directory, and individual project detail pages.',
        'Search and category filter system on the project directory.',
        'Quick navigation palette accessible via Ctrl/⌘+K or toolbar button.',
        'Animated avatar with a spoken introduction and transcript.',
        'Dark and light theme toggle with localStorage persistence.',
        'Reading progress indicator, smooth scroll, and responsive layouts.',
        'Semantic HTML, skip links, ARIA attributes, and reduced-motion support.'
      ]
    }
  };

  // Order for "next project" navigation
  const projectOrder = ['vaultcards', 'expense-tracker', 'sgpa-calculator', 'stock-dashboard', 'co2-analytics', 'weather-app', 'portfolio'];

  function safeLink(label, url, className) {
    const anchor = document.createElement('a');
    anchor.className = className || 'button button-outline';
    anchor.href = url;
    anchor.textContent = label;
    if (url.startsWith('http')) {
      anchor.target = '_blank';
      anchor.rel = 'noreferrer';
    }
    return anchor;
  }

  function projectPreview(link, project, thumbnail = project.screenshots?.[0]?.src) {
    link.dataset.previewTitle = project.title;
    link.dataset.previewDescription = project.summary;
    link.dataset.previewType = project.category;
    link.dataset.previewSource = project.repo || (project.privateRepo ? 'Private repository' : 'No repository linked');
    if (thumbnail) link.dataset.previewImage = thumbnail;
  }

  function renderProjectDetail() {
    const titleNode = $('#detail-title');
    if (!titleNode) return;

    const id = new URLSearchParams(location.search).get('id') || 'vaultcards';
    const project = projects[id] || projects.vaultcards;

    // Set page title
    document.title = project.title + ' — Syed Ahmed W';

    // Breadcrumb
    const crumb = $('#detail-crumb');
    if (crumb) crumb.textContent = project.title;

    // Category, title, summary
    const category = $('#detail-category');
    if (category) category.textContent = project.category;
    titleNode.textContent = project.title;

    const summary = $('#detail-summary');
    if (summary) summary.textContent = project.summary;

    // About text
    const about = $('#detail-about');
    if (about) about.textContent = project.about;

    // Tags
    const tags = $('#detail-tags');
    if (tags) {
      project.tags.forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag;
        tags.appendChild(span);
      });
    }

    // Features
    const features = $('#detail-features');
    if (features) {
      project.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        features.appendChild(li);
      });
    }

    // Technical details section
    const techSection = $('#detail-tech-section');
    const techContent = $('#detail-tech');
    if (techSection && techContent && project.techDetails) {
      techSection.hidden = false;
      const p = document.createElement('p');
      p.textContent = project.techDetails;
      techContent.appendChild(p);
    }

    const gallery = $('#detail-gallery-section');
    const screenshots = project.screenshots || [];
    if (gallery && screenshots.length) {
      const fullSize = $('.gallery-full-size', gallery);
      const image = $('img', fullSize);
      const caption = $('.gallery-caption', gallery);
      const picker = $('.gallery-picker', gallery);
      let selected = 0;

      function selectScreenshot(index) {
        selected = index;
        const shot = screenshots[index];
        fullSize.href = shot.src;
        fullSize.setAttribute('aria-label', 'Open full-size screenshot: ' + shot.caption);
        image.src = shot.src;
        image.alt = shot.alt;
        caption.textContent = shot.caption;
        Array.from(picker.children).forEach((item, position) => {
          item.setAttribute('aria-pressed', String(position === index));
        });
      }

      screenshots.forEach((shot, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', shot.caption);
        const thumb = document.createElement('img');
        thumb.src = shot.src;
        thumb.alt = '';
        thumb.loading = 'lazy';
        button.appendChild(thumb);
        button.addEventListener('click', () => selectScreenshot(index));
        picker.appendChild(button);
      });

      $('.gallery-prev', gallery).addEventListener('click', () => {
        selectScreenshot((selected - 1 + screenshots.length) % screenshots.length);
      });
      $('.gallery-next', gallery).addEventListener('click', () => {
        selectScreenshot((selected + 1) % screenshots.length);
      });
      $('.gallery-controls', gallery).hidden = screenshots.length < 2;
      picker.hidden = screenshots.length < 2;
      selectScreenshot(0);
      gallery.hidden = false;
    }

    // Action buttons
    const actions = $('#detail-actions');
    if (actions) {
      actions.appendChild(safeLink('All projects', 'projects.html', 'button button-primary'));

      if (project.repo) {
        const source = safeLink('View on GitHub', project.repo, 'button button-outline');
        projectPreview(source, project);
        actions.appendChild(source);
      }

      if (project.privateRepo) {
        const privateNote = document.createElement('span');
        privateNote.className = 'private-repo-note';
        privateNote.textContent = '⌑ Source code · Private repository';
        actions.appendChild(privateNote);
      }
    }

    // Next project suggestion
    const nextSection = $('.next-project');
    if (nextSection) {
      const currentIndex = projectOrder.indexOf(id);
      const nextIndex = (currentIndex + 1) % projectOrder.length;
      const nextId = projectOrder[nextIndex];
      const nextProject = projects[nextId];

      if (nextProject) {
        const heading = $('h2', nextSection);
        if (heading) heading.textContent = 'Next: ' + nextProject.title;

        const link = $('a', nextSection);
        if (link) {
          link.href = 'project.html?id=' + nextId;
          link.textContent = 'View project';
          projectPreview(link, nextProject);
        }
      }
    }
  }

  renderProjectDetail();

  $$('.project-tile').forEach(tile => {
    const visual = $('.tile-visual', tile);
    const project = projects[new URL(visual.href).searchParams.get('id')];
    if (!project) return;
    projectPreview(visual, project, $('img', visual)?.getAttribute('src'));
    if (project.repo) {
      const link = safeLink('GitHub', project.repo, 'project-repo');
      link.setAttribute('aria-label', 'GitHub repository for ' + project.title);
      tile.appendChild(link);
    }
  });

  // ══════════════════════════════════════════════
  // COMMAND PALETTE (Quick Navigation)
  // ══════════════════════════════════════════════
  const overlay = $('#command-overlay');
  const commandInput = $('#command-input');
  const commandResults = $('#command-results');

  const quickLinks = [
    { label: 'Home', hint: 'Page', href: 'index.html' },
    { label: 'About me', hint: 'Section', href: 'index.html#about' },
    { label: 'Skills & toolkit', hint: 'Section', href: 'index.html#skills' },
    { label: 'Projects on home page', hint: 'Section', href: 'index.html#featured' },
    { label: 'Education & leadership', hint: 'Section', href: 'index.html#experience' },
    { label: 'Contact', hint: 'Section', href: 'index.html#contact' },
    { label: 'Projects Hub', hint: 'Page', href: 'projects.html' },
    { label: 'VaultCards', hint: 'Project', href: 'project.html?id=vaultcards' },
    { label: 'Travel Expense Tracker', hint: 'Project', href: 'project.html?id=expense-tracker' },
    { label: 'SGPA Calculator 2.0', hint: 'Project', href: 'project.html?id=sgpa-calculator' },
    { label: 'Stock Data Analysis', hint: 'Project', href: 'project.html?id=stock-dashboard' },
    { label: 'Global CO₂ Analytics', hint: 'Project', href: 'project.html?id=co2-analytics' },
    { label: 'Weather Application', hint: 'Project', href: 'project.html?id=weather-app' },
    { label: 'Personal Portfolio Website', hint: 'Project', href: 'project.html?id=portfolio' },
    { label: 'Résumé', hint: 'Page', href: 'resume.html' }
  ];

  let selectedQuickLink = 0;

  function renderQuickLinks() {
    if (!commandResults || !commandInput) return;
    const q = commandInput.value.trim().toLowerCase();
    const filtered = quickLinks.filter(item =>
      (item.label + ' ' + item.hint).toLowerCase().includes(q)
    );

    selectedQuickLink = Math.min(selectedQuickLink, Math.max(0, filtered.length - 1));
    commandResults.innerHTML = '';

    filtered.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'command-result' + (index === selectedQuickLink ? ' selected' : '');
      button.type = 'button';

      const label = document.createElement('span');
      label.textContent = item.label;

      const hint = document.createElement('small');
      hint.textContent = item.hint;

      button.append(label, hint);
      button.addEventListener('mouseenter', () => {
        selectedQuickLink = index;
        $$('.command-result', commandResults).forEach((el, i) =>
          el.classList.toggle('selected', i === index)
        );
      });
      button.addEventListener('click', () => {
        closePalette();
        location.href = item.href;
      });
      commandResults.appendChild(button);
    });

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'command-hint';
      empty.textContent = 'No matching destination. Try "projects", "skills", or "contact".';
      commandResults.appendChild(empty);
    }
  }

  function openPalette() {
    if (!overlay || !commandInput) return;
    overlay.hidden = false;
    commandInput.value = '';
    selectedQuickLink = 0;
    renderQuickLinks();
    commandInput.focus();
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  const commandTrigger = $('.command-trigger');
  if (commandTrigger) {
    commandTrigger.addEventListener('click', openPalette);
  }

  if (commandInput) {
    commandInput.addEventListener('input', () => {
      selectedQuickLink = 0;
      renderQuickLinks();
    });
  }

  if (overlay) {
    // Click backdrop to close
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closePalette();
    });

    // Keyboard navigation in palette
    if (commandInput) {
      commandInput.addEventListener('keydown', event => {
        const q = commandInput.value.trim().toLowerCase();
        const filtered = quickLinks.filter(item =>
          (item.label + ' ' + item.hint).toLowerCase().includes(q)
        );

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          selectedQuickLink = Math.min(selectedQuickLink + 1, filtered.length - 1);
          renderQuickLinks();
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          selectedQuickLink = Math.max(selectedQuickLink - 1, 0);
          renderQuickLinks();
        }
        if (event.key === 'Enter' && filtered[selectedQuickLink]) {
          closePalette();
          location.href = filtered[selectedQuickLink].href;
        }
        if (event.key === 'Escape') closePalette();
      });
    }
  }

  // Global keyboard shortcut
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openPalette();
    }
    if (event.key === 'Escape') closePalette();
  });

  // ══════════════════════════════════════════════
  // SMOOTH HEADER SCROLL BEHAVIOR
  // ══════════════════════════════════════════════
  const header = $('.site-header');
  let lastScrollY = 0;

  if (header) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        header.style.borderBottomColor = currentScrollY > lastScrollY
          ? 'transparent'
          : 'var(--line)';
      } else {
        header.style.borderBottomColor = 'var(--line)';
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }
})();
