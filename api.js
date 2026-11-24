/**
 * api.js — GitHub Repositories API fetch
 *
 * Fetches repos from GitHub and appends them into #projects-slider
 * using exactly the same card style as the hand-crafted project cards.
 * After injection the slider dots are re-rendered by calling the
 * initProjectsSlider re-init function exposed on window.
 */

const GITHUB_USERNAME = 'francesccapllonchPauCasesNoves';
const GITHUB_API_URL  = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

/** FontAwesome icon per programming language */
const LANG_ICONS = {
  'JavaScript': 'fa-brands fa-js',
  'TypeScript': 'fa-brands fa-js',
  'HTML':       'fa-brands fa-html5',
  'CSS':        'fa-brands fa-css3-alt',
  'Python':     'fa-brands fa-python',
  'Java':       'fa-brands fa-java',
  'Dart':       'fa-solid fa-mobile-screen',
  'PHP':        'fa-brands fa-php',
  'Shell':      'fa-solid fa-terminal',
  'C':          'fa-solid fa-c',
  'C++':        'fa-solid fa-code',
  'C#':         'fa-solid fa-code',
  'Kotlin':     'fa-solid fa-k',
  'Swift':      'fa-brands fa-swift',
  'Ruby':       'fa-solid fa-gem',
  'Go':         'fa-solid fa-code',
  'Rust':       'fa-solid fa-cog',
  'default':    'fa-solid fa-code',
};

function getLangIcon(lang) {
  return LANG_ICONS[lang] || LANG_ICONS['default'];
}

/**
 * Builds an article element that matches the existing project-card style.
 * Instead of a screenshot image the top area shows a styled GitHub header
 * with the repo name and language badge — same proportions as the img block.
 */
function buildSliderCard(repo) {
  const name        = repo.name       || '—';
  const description = repo.description || '';
  const language    = repo.language    || null;
  const url         = repo.html_url;
  const langIcon    = getLangIcon(language);

  // Coloured top placeholder (same aspect ratio as project images: 16/10)
  const topBlock = `
    <a href="${url}" target="_blank" rel="noopener noreferrer"
       class="block overflow-hidden rounded-2xl border border-[#DAD3C6] bg-[#E8E2D8]"
       style="aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:0.5rem;">
      <i class="fa-brands fa-github" style="font-size:2.5rem; color:#8C857B;"></i>
      <span style="font-size:0.65rem; font-family:monospace; color:#8C857B; letter-spacing:0.05em; text-transform:uppercase;">
        github.com/${GITHUB_USERNAME}
      </span>
    </a>`;

  const langBadge = language
    ? `<span class="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8C857B]">
         <i class="${langIcon}"></i> ${language}
       </span>`
    : '';

  const desc = description
    ? `<p class="text-xs text-[#635E59] leading-relaxed" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${description}</p>`
    : '';

  const article = document.createElement('article');
  article.className =
    'project-card group flex-shrink-0 ' +
    'w-full sm:w-[calc(85%)] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] ' +
    'snap-start flex flex-col gap-4 bg-[#FFFFFF] p-6 rounded-3xl ' +
    'border border-[#DAD3C6] shadow-sm transition-all duration-300 ' +
    'hover:-translate-y-1.5 hover:shadow-md hover:border-[#CFC7B8] relative overflow-hidden';

  article.innerHTML = `
    ${topBlock}
    <div class="flex flex-col gap-1.5">
      ${langBadge}
      <h2 class="text-lg sm:text-xl font-bold font-mono text-[#2C2825] tracking-tight">${name}</h2>
      ${desc}
    </div>
    <a href="${url}" target="_blank" rel="noopener noreferrer"
       class="mt-auto pt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2C2825] hover:text-[#635E59] transition-colors">
      View on GitHub
      <span class="inline-block transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>
    </a>`;

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

    if (ownRepos.length === 0) return;

    ownRepos.forEach(repo => slider.appendChild(buildSliderCard(repo)));

    // Re-initialise slider controls so dots + arrows cover the new cards
    if (typeof window.reinitProjectsSlider === 'function') {
      window.reinitProjectsSlider();
    }
  } catch (err) {
    console.warn('fetchGitHubRepos:', err.message);
    // Silently fail — the 3 hand-crafted cards are still visible
  }
}

document.addEventListener('DOMContentLoaded', fetchGitHubRepos);
