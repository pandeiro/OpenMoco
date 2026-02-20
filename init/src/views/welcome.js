import { fetchRepos } from '../lib/api.js';

export async function render() {
  const container = document.createElement('div');
  container.className = 'container animate-fade-in';

  container.innerHTML = `
    <div style="text-align: center; margin-top: 4rem;">
      <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Welcome</h1>
      <p style="color: var(--fg-dim); margin-bottom: 2rem;">
        Start by selecting a GitHub repository to work on.
      </p>
      <div class="card" style="margin-bottom: 2rem;">
        <button class="primary" onclick="navigate('/init/repos')">
          Select Project
        </button>
      </div>
      <p style="font-size: 0.8rem; color: var(--fg-dim);">
        Or <a href="#" style="color: var(--primary);">start a new project</a> from scratch.
      </p>
    </div>
  `;

  // Check if we already have repos
  try {
    const repos = await fetchRepos();
    if (repos.some(r => r.enabled)) {
      setTimeout(() => navigate('/init/'), 0);
    }
  } catch (err) {
    console.warn('Silent repo check failed');
  }

  return container;
}
