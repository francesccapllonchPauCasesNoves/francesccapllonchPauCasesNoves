/**
 * api.js — GitHub Repositories API fetch
 * Fetches repos from the user's GitHub account and renders
 * a card for each one inside #github-repos-grid.
 */

const GITHUB_USERNAME = 'francesccapllonchPauCasesNoves';
const GITHUB_API_URL  = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

/** Map of language names to FontAwesome icons */
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

function buildRepoCard(repo) {
  const name        = repo.name || '—';
  const description = repo.description || '';
  const language    = repo.language || null;
  const url         = repo.html_url;
  const langIcon    = getLangIcon(language);

  return `
    <article class="group bg-[#FFFFFF] p-5 rounded-3xl border border-[#DAD3C6] shadow-sm
                    flex flex-col gap-3 transition-all duration-300
                    hover:-translate-y-1.5 hover:shadow-md hover:border-[#CFC7B8]">
      <!-- Repo name -->
      <div class="flex items-start gap-2.5">
        <span class="w-8 h-8 rounded-xl bg-[#F4F1EC] border border-[#DAD3C6]
                     flex items-center justify-center text-[#635E59] flex-shrink-0 mt-0.5">
          <i class="fa-brands fa-github text-sm"></i>
        </span>
        <h3 class="font-bold text-sm text-[#2C2825] font-mono leading-snug break-all">${name}</h3>
      </div>

      <!-- Description -->
      ${description ? `
      <p class="text-xs text-[#635E59] leading-relaxed line-clamp-3">${description}</p>
      ` : ''}

      <!-- Language badge -->
      ${language ? `
      <span class="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold
                   text-[#635E59] bg-[#F4F1EC] border border-[#DAD3C6] rounded-lg px-2.5 py-1 w-fit">
        <i class="${langIcon} text-[10px]"></i>
        ${language}
      </span>
      ` : ''}

      <!-- Link -->
      <a href="${url}" target="_blank" rel="noopener noreferrer"
         class="mt-auto pt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#2C2825]
                hover:text-[#635E59] transition-colors">
        View on GitHub
        <span class="inline-block transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>
      </a>
    </article>`;
}

async function fetchGitHubRepos() {
  const grid = document.getElementById('github-repos-grid');
  if (!grid) return;

  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

    const repos = await response.json();

    // Filter out forks, sort by updated_at (already done by API, but keep it clean)
    const ownRepos = repos.filter(r => !r.fork);

    if (ownRepos.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center text-sm text-[#8C857B] font-mono py-8">
                          No public repositories found.
                        </p>`;
      return;
    }

    grid.innerHTML = ownRepos.map(buildRepoCard).join('');
  } catch (err) {
    console.error('fetchGitHubRepos:', err);
    grid.innerHTML = `<p class="col-span-full text-center text-sm text-[#8C857B] font-mono py-8">
                        <i class="fa-solid fa-circle-exclamation mr-1"></i>
                        Could not load repositories. ${err.message}
                      </p>`;
  }
}

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', fetchGitHubRepos);
