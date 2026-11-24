/**
 * api.js — GitHub Repositories API fetch
 *
 * Fetches repos from GitHub and renders ONLY API-fetched cards
 * inside #projects-slider with a 100% uniform card layout.
 * After injection, refreshes the slider pagination dots & arrows.
 *
 * IMAGE CONVENTION:
 *   1. img/<repo-name>.jpg
 *   2. img/<repo-name>.png
 *   3. img/default.jpg (default image for projects without a specific one)
 *   4. Fallback to styled GitHub placeholder if none exist yet.
 */

const GITHUB_USERNAME = 'francesccapllonchPauCasesNoves';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

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

function createPlaceholderLink(url) {
  const el = document.createElement('a');
  el.href = url;
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
  el.className = 'block overflow-hidden rounded-2xl border border-[#DAD3C6] bg-[#E8E2D8] aspect-[16/10] w-full flex flex-col items-center justify-center gap-2';
  el.innerHTML = `
    <i class="fa-brands fa-github text-4xl text-[#8C857B]"></i>
    <span class="text-[10px] font-mono text-[#8C857B] tracking-wider uppercase">
      github.com/${GITHUB_USERNAME}
    </span>`;
  return el;
}

function getViewProjectLabel() {
  const lang = document.documentElement.lang || localStorage.getItem('lang') || 'ca';
  if (typeof translations !== 'undefined' && translations[lang] && translations[lang]['projects.view']) {
    return translations[lang]['projects.view'];
  }
  return 'Veure projecte';
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
    'hover:-translate-y-1.5 hover:shadow-md hover:border-[#CFC7B8] relative overflow-hidden';

  const imgLink = document.createElement('a');
  imgLink.href = url;
  imgLink.target = '_blank';
  imgLink.rel = 'noopener noreferrer';
  imgLink.className = 'block overflow-hidden rounded-2xl border border-[#DAD3C6] bg-[#E8E2D8]';

  const img = document.createElement('img');
  img.alt = `${name} screenshot`;
  img.className = 'aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]';
  img.draggable = false;

  const candidates = [
    `img/${name}.jpg`,
    `img/${name}.png`,
    `img/default.jpg`
  ];
  let candidateIdx = 0;

  img.onerror = () => {
    candidateIdx++;
    if (candidateIdx < candidates.length) {
      img.src = candidates[candidateIdx];
    } else {
      img.onerror = null;
      imgLink.replaceWith(createPlaceholderLink(url));
    }
  };

  img.src = candidates[candidateIdx];
  imgLink.appendChild(img);
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
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const repos = await response.json();
    const ownRepos = repos.filter(r => !r.fork);

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

document.addEventListener('DOMContentLoaded', fetchGitHubRepos);
