(() => {
  const preview = document.createElement('div');
  preview.className = 'link-preview';
  preview.id = 'link-preview';
  preview.setAttribute('role', 'tooltip');
  preview.hidden = true;
  document.body.appendChild(preview);

  const profile = {
    title: 'Syed Ahmed W',
    description: 'Computer Science student · Software and data analytics',
    image: 'assets/syed-ahmed-portrait-sm.webp',
    footer: 'Bengaluru, India',
    profile: true
  };
  const sections = {
    main: ['Portfolio', 'Meet Syed Ahmed W and explore his work.'],
    featured: ['Projects', 'Seven web, Android, and analytics projects.'],
    about: ['About Syed Ahmed W', 'Computer Science at Malnad College of Engineering.'],
    skills: ['Technical skills', 'Programming languages, development tools, and analytics.'],
    experience: ['Education and leadership', 'College coursework and Leo Club editorial work.'],
    contact: ['Contact', 'Email and professional profiles.']
  };
  let hovered;
  let focused;
  let active;
  let timer;

  function describe(anchor) {
    const url = new URL(anchor.href);
    const slug = url.searchParams.get('id');
    const tile = anchor.closest('.project-tile');
    const project = tile?.querySelector('.tile-visual') ||
      (slug && Array.from(document.querySelectorAll('.tile-visual')).find(link => new URL(link.href).searchParams.get('id') === slug));
    const details = anchor.dataset.previewTitle ? anchor.dataset : project?.dataset;
    const title = anchor.getAttribute('aria-label') || anchor.textContent.trim() || 'Open link';

    if (url.hostname === 'linkedin.com' || url.hostname === 'www.linkedin.com') {
      return { ...profile, type: 'LinkedIn', address: url.pathname.replace(/^\//, '') };
    }
    if (url.hostname === 'github.com') {
      const address = url.pathname.replace(/^\//, '');
      if (address === 'syedahmedw') return { ...profile, type: 'GitHub', address: '@syedahmedw' };
      return { type: 'GitHub repository', title: details?.previewTitle || title, address,
        description: details?.previewDescription, image: details?.previewImage };
    }
    if (details?.previewTitle) {
      const source = details.previewSource;
      const footer = source?.startsWith('https://github.com/') ? 'GitHub · ' + source.slice('https://github.com/'.length) : source;
      return { type: details.previewType, title: details.previewTitle, description: details.previewDescription,
        image: details.previewImage, footer };
    }
    if (url.protocol === 'mailto:') {
      return { type: 'Email', title: 'Contact Syed Ahmed W', address: url.pathname };
    }
    if (url.pathname.endsWith('.pdf') || url.pathname.endsWith('/resume.html')) {
      return { type: url.pathname.endsWith('.pdf') ? 'PDF document' : 'Résumé page', title: 'Syed Ahmed W',
        description: 'Education, technical skills, projects, and leadership.' };
    }
    if (/\.(webp|png|jpe?g|avif)$/i.test(url.pathname)) {
      return { type: 'Screenshot', title: anchor.querySelector('img')?.alt || title, image: anchor.getAttribute('href') };
    }
    if (url.pathname.endsWith('projects.html')) {
      return { type: 'Portfolio page', title: 'Projects', description: 'Browse, filter, and search all seven projects.' };
    }
    if (url.origin === location.origin) {
      const section = sections[url.hash.slice(1)];
      return { type: 'Portfolio', title: section?.[0] || (slug ? title : 'Syed Ahmed W'),
        description: section?.[1] || (slug ? 'Project overview and technical details.' : 'Homepage and selected work.') };
    }
    return { type: url.hostname, title, address: url.hostname + (url.pathname === '/' ? '' : url.pathname) };
  }

  function addText(parent, className, value) {
    if (!value) return;
    const item = document.createElement('div');
    item.className = className;
    item.textContent = value;
    parent.appendChild(item);
  }

  function place() {
    if (!active || preview.hidden) return;
    const box = active.getBoundingClientRect();
    const gap = 9;
    const edge = 12;
    const maxLeft = window.innerWidth - preview.offsetWidth - edge;
    const below = box.bottom + gap;
    const above = box.top - preview.offsetHeight - gap;
    preview.style.left = Math.max(edge, Math.min(box.left, maxLeft)) + 'px';
    const top = below + preview.offsetHeight <= window.innerHeight - edge || above < edge ? below : above;
    preview.style.top = Math.max(edge, Math.min(top, window.innerHeight - preview.offsetHeight - edge)) + 'px';
  }

  function show(anchor) {
    const data = describe(anchor);
    active?.removeAttribute('aria-describedby');
    active = anchor;
    preview.replaceChildren();
    preview.classList.toggle('link-preview-profile', Boolean(data.profile));
    if (data.image) {
      const image = document.createElement('img');
      image.src = data.image;
      image.alt = '';
      image.className = data.profile ? 'link-preview-avatar' : 'link-preview-image';
      preview.appendChild(image);
    }
    const body = document.createElement('div');
    body.className = 'link-preview-body';
    addText(body, 'link-preview-type', data.type);
    addText(body, 'link-preview-title', data.title);
    addText(body, 'link-preview-address', data.address);
    addText(body, 'link-preview-description', data.description);
    addText(body, 'link-preview-footer', data.footer);
    preview.appendChild(body);
    anchor.setAttribute('aria-describedby', preview.id);
    preview.hidden = false;
    place();
  }

  function update() {
    clearTimeout(timer);
    const target = hovered || focused;
    if (target && active === target) return;
    active?.removeAttribute('aria-describedby');
    active = null;
    preview.hidden = true;
    if (target) timer = setTimeout(() => show(target), hovered ? 220 : 0);
  }

  function previewTarget(element) {
    return element.closest('a[href]:not(.skip-link)') ||
      element.closest('.project-tile')?.querySelector('.tile-visual');
  }

  document.addEventListener('pointerover', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const target = previewTarget(event.target);
    if (target === hovered) return;
    hovered = target;
    update();
  });
  document.addEventListener('pointerout', event => {
    if (!hovered || previewTarget(event.target) !== hovered) return;
    if (event.relatedTarget instanceof Element && previewTarget(event.relatedTarget) === hovered) return;
    hovered = null;
    update();
  });
  document.addEventListener('focusin', event => {
    const target = event.target.closest('a[href]:not(.skip-link)');
    focused = target?.matches(':focus-visible') ? target : null;
    update();
  });
  document.addEventListener('focusout', () => { focused = null; update(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    hovered = focused = null;
    update();
  });
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, { passive: true });
})();
