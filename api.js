/**
 * api.js — GitHub Repositories API fetch
 *
 * Fetches repos from GitHub and renders ONLY API-fetched cards
 * inside #projects-slider with a 100% uniform card layout.
 * After injection, refreshes the slider pagination dots & arrows.
 *
 * MEDIA CONVENTION:
 *   1. img/<repo-name>.mp4
 *   2. img/default.png when the video is missing or cannot be played
 */

const GITHUB_USERNAME = 'francesccapllonchPauCasesNoves';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

let cachedReposPromise = null;

/**
 * Fetches and caches non-fork GitHub repositories so both the slider
 * and the CachyOS terminal share a single API request.
 */
window.getGitHubRepos = function () {
  if (!cachedReposPromise) {
    cachedReposPromise = fetch(GITHUB_API_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        return response.json();
      })
      .then((repos) => repos.filter((r) => !r.fork));
  }
  return cachedReposPromise;
};

const LANG_ICONS = {
  'JavaScript': 'fa-brands fa-js',
  'TypeScript': 'fa-brands fa-js',
  'HTML': 'fa-brands fa-html5',
  'CSS': 'fa-brands fa-css3-alt',
  'Python': 'fa-brands fa-python',
  'Java': 'fa-brands fa-java',
  'Dart': 'fa-solid fa-mobile-screen',
  'PHP': 'fa-brands fa-php',
  'Shell': 'fa-solid fa-terminal',
  'C': 'fa-solid fa-c',
  'C++': 'fa-solid fa-code',
  'C#': 'fa-solid fa-code',
  'Kotlin': 'fa-solid fa-k',
  'Swift': 'fa-brands fa-swift',
  'Ruby': 'fa-solid fa-gem',
  'Go': 'fa-solid fa-code',
  'Rust': 'fa-solid fa-cog',
  'default': 'fa-solid fa-code',
};

function getLangIcon(lang) {
  return LANG_ICONS[lang] || LANG_ICONS['default'];
}

function getViewProjectLabel() {
  const lang = document.documentElement.lang || localStorage.getItem('lang') || 'ca';
  if (typeof translations !== 'undefined' && translations[lang] && translations[lang]['projects.view']) {
    return translations[lang]['projects.view'];
  }
  return 'Veure projecte';
}

function openProjectPreview(card) {
  const dialog = document.createElement('dialog');
  dialog.className = 'project-preview-dialog';

  const expandedCard = card.cloneNode(true);
  expandedCard.className = 'project-card project-preview-card';

  const sourceVideo = card.querySelector('video');
  const previewVideo = expandedCard.querySelector('video');
  if (sourceVideo && previewVideo) {
    sourceVideo.pause();
    previewVideo.controls = true;
    previewVideo.preload = 'auto';
    previewVideo.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(sourceVideo.currentTime) && previewVideo.duration) {
        previewVideo.currentTime = Math.min(sourceVideo.currentTime, previewVideo.duration - 0.1);
      }
      previewVideo.play().catch(() => {});
    }, { once: true });
  }

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'project-preview-close';
  closeButton.setAttribute('aria-label', 'Tancar vista ampliada');
  closeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';

  dialog.append(closeButton, expandedCard);
  document.body.appendChild(dialog);

  const closeDialog = () => dialog.close();
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('close', () => {
    previewVideo?.pause();
    if (sourceVideo?.isConnected) sourceVideo.play().catch(() => {});
    dialog.remove();
    card.focus({ preventScroll: true });
  }, { once: true });

  dialog.showModal();
}

function buildSliderCard(repo) {
  const name = repo.name || '—';
  const desc = repo.description || '';
  const language = repo.language || 'Repository';
  const url = repo.html_url;
  const langIcon = getLangIcon(repo.language);

  const article = document.createElement('article');
  article.className =
    'project-card group flex-shrink-0 ' +
    'w-full sm:w-[calc(85%)] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] ' +
    'snap-start flex flex-col gap-4 bg-[#FFFFFF] p-6 rounded-3xl ' +
    'border border-[#DAD3C6] shadow-sm transition-all duration-300 ' +
    'hover:-translate-y-1.5 hover:shadow-md hover:border-[#CFC7B8] relative overflow-hidden cursor-zoom-in';
  article.tabIndex = 0;
  article.setAttribute('aria-haspopup', 'dialog');
  article.setAttribute('aria-label', `Ampliar vista previa de ${name}`);

  const imgLink = document.createElement('a');
  imgLink.href = url;
  imgLink.target = '_blank';
  imgLink.rel = 'noopener noreferrer';
  imgLink.className = 'project-media-link block overflow-hidden rounded-2xl border border-[#DAD3C6] bg-[#E8E2D8]';

  const mediaClass = 'aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]';
  const video = document.createElement('video');
  video.className = mediaClass;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.setAttribute('aria-label', `${name} project preview`);
  video.onerror = () => {
    const img = document.createElement('img');
    img.src = 'img/default.png';
    img.alt = `${name} project preview`;
    img.className = mediaClass;
    img.draggable = false;
    video.replaceWith(img);
  };
  video.src = `img/${encodeURIComponent(name)}.mp4`;
  imgLink.appendChild(video);
  article.appendChild(imgLink);

  // Uniform middle block across all cards
  const textDiv = document.createElement('div');
  textDiv.className = 'flex flex-col gap-1.5 flex-1';
  textDiv.innerHTML = `
    <span class="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8C857B]">
      <i class="${langIcon} mr-1"></i>${language}
    </span>
    <h2 class="text-lg sm:text-xl font-bold font-mono text-[#2C2825] tracking-tight truncate" title="${name}">${name}</h2>
    <p class="text-xs text-[#635E59] leading-relaxed min-h-[2.25rem]" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${desc}</p>`;
  article.appendChild(textDiv);

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'mt-auto pt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2C2825] hover:text-[#635E59] transition-colors';
  link.innerHTML = `<span data-i18n="projects.view">${getViewProjectLabel()}</span> <span class="inline-block transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>`;
  article.appendChild(link);

  return article;
}

async function fetchGitHubRepos() {
  const slider = document.getElementById('projects-slider');
  if (!slider) return;

  try {
    const ownRepos = await window.getGitHubRepos();

    slider.innerHTML = '';

    if (ownRepos.length === 0) {
      slider.innerHTML = `<p class="w-full py-12 text-center text-sm text-[#8C857B] font-mono">No public repositories found.</p>`;
    } else {
      ownRepos.forEach(repo => slider.appendChild(buildSliderCard(repo)));
    }

    if (typeof window.refreshProjectsSlider === 'function') {
      window.refreshProjectsSlider();
    }
  } catch (err) {
    console.warn('fetchGitHubRepos:', err.message);
    slider.innerHTML = `<p class="w-full py-12 text-center text-sm text-[#8C857B] font-mono">Could not load repositories.</p>`;
    if (typeof window.refreshProjectsSlider === 'function') {
      window.refreshProjectsSlider();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('projects-slider');
  if (!slider) return;

  slider.addEventListener('click', (event) => {
    const card = event.target.closest('.project-card');
    if (!card) return;

    const link = event.target.closest('a');
    if (link && !link.classList.contains('project-media-link')) return;
    if (link) event.preventDefault();
    openProjectPreview(card);
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.project-card');
    if (!card || event.target.closest('a')) return;
    event.preventDefault();
    openProjectPreview(card);
  });
});

document.addEventListener('DOMContentLoaded', fetchGitHubRepos);
