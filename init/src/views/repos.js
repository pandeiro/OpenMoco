import { fetchRepos, enableRepo, disableRepo } from '../lib/api.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'container animate-fade-in';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '2rem';
    header.innerHTML = `
        <h1 style="margin: 0;">Select Project</h1>
    `;
    container.appendChild(header);

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search repositories...';
    searchInput.className = 'card';
    searchInput.style.width = '100%';
    searchInput.style.marginBottom = '1.5rem';
    searchInput.style.padding = '0.75rem 1rem';
    searchInput.style.fontSize = '1rem';
    container.appendChild(searchInput);

    const repoList = document.createElement('div');
    repoList.style.display = 'flex';
    repoList.style.flexDirection = 'column';
    repoList.style.gap = '1rem';
    container.appendChild(repoList);

    function createRepoCard(repo, isNewProject = false) {
        const card = document.createElement('div');
        card.className = 'card animate-fade-in';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.2s';

        const hasCloneError = repo.enabled && repo.cloneStatus === 'error';
        
        // Red border for clone errors
        if (hasCloneError) {
            card.style.borderColor = 'var(--error)';
            card.style.borderWidth = '2px';
        }

        card.onmouseover = () => card.style.borderColor = hasCloneError ? 'var(--error)' : 'var(--primary)';
        card.onmouseout = () => card.style.borderColor = hasCloneError ? 'var(--error)' : 'var(--border)';

        const info = document.createElement('div');
        info.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem; font-size: 1.1rem;">${repo.name}</div>
            <div style="font-size: 0.85rem; color: var(--fg-dim);">${repo.description || (isNewProject ? 'Setup a new blank project' : 'No description')}</div>
            ${repo.enabled && !isNewProject ? 
                hasCloneError ? 
                    `<div style="font-size: 0.75rem; color: var(--error); margin-top: 0.5rem; font-weight: 600;">⚠️ Clone failed - click to retry</div>` :
                    `<div style="font-size: 0.75rem; color: var(--accent); margin-top: 0.5rem;">Downloaded in workspace</div>` 
                : ''}
        `;
        card.appendChild(info);

        const action = document.createElement('div');
        action.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
        card.appendChild(action);

        card.onclick = async () => {
            if (isNewProject) {
                navigate('/init/?new=true');
                return;
            }

            info.innerHTML += `<div style="font-size: 0.75rem; color: var(--primary); margin-top: 0.5rem;">Preparing workspace...</div>`;
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.7';
            try {
                await enableRepo(repo.name);
                navigate('/init/');
            } catch (err) {
                alert('Failed to set up project: ' + err.message);
                card.style.pointerEvents = 'auto';
                card.style.opacity = '1';
                loadRepos(); // Refresh state
            }
        };
        return card;
    }

    function renderRepos(repos) {
        const filter = searchInput.value.toLowerCase();
        repoList.innerHTML = ''; // fully rebuild

        // 1. New Project Button (always at top)
        if (!filter) {
            const newProjectCard = createRepoCard({ name: '✨ New Project', description: '' }, true);
            newProjectCard.style.borderColor = 'var(--primary)';
            repoList.appendChild(newProjectCard);
        }

        // 2. Recent Projects - sort by clone error first, then by date
        const recentRepos = repos
            .filter(r => r.enabled && r.enabledAt)
            .sort((a, b) => {
                // Show repos with clone errors first
                if (a.cloneStatus === 'error' && b.cloneStatus !== 'error') return -1;
                if (b.cloneStatus === 'error' && a.cloneStatus !== 'error') return 1;
                // Then sort by date
                return new Date(b.enabledAt) - new Date(a.enabledAt);
            })
            .slice(0, 5)
            .filter(r => r.name.toLowerCase().includes(filter));

        if (recentRepos.length > 0) {
            const recentHeader = document.createElement('div');
            recentHeader.style.fontSize = '0.8rem';
            recentHeader.style.fontWeight = '800';
            recentHeader.style.color = 'var(--fg-dim)';
            recentHeader.style.paddingTop = '1rem';
            recentHeader.innerText = 'RECENT PROJECTS';
            repoList.appendChild(recentHeader);

            recentRepos.forEach(repo => {
                repoList.appendChild(createRepoCard(repo));
            });
        }

        // 3. All GitHub List
        const filteredAll = repos.filter(r => r.name.toLowerCase().includes(filter));

        if (filteredAll.length > 0) {
            const allHeader = document.createElement('div');
            allHeader.style.fontSize = '0.8rem';
            allHeader.style.fontWeight = '800';
            allHeader.style.color = 'var(--fg-dim)';
            allHeader.style.paddingTop = '1rem';
            allHeader.innerText = 'ALL GITHUB REPOSITORIES';
            repoList.appendChild(allHeader);

            filteredAll.forEach(repo => {
                repoList.appendChild(createRepoCard(repo));
            });
        } else if (recentRepos.length === 0 && !filter) {
            // Empty state but not filtering
            repoList.innerHTML += '<p style="text-align: center; opacity: 0.5; padding: 2rem 0;">No repositories found.</p>';
        } else if (filteredAll.length === 0 && filter) {
            repoList.innerHTML += '<p style="text-align: center; opacity: 0.5; padding: 2rem 0;">No matching repositories.</p>';
        }
    }

    searchInput.oninput = () => {
        // We need a reference to the loaded repos array
        // Since it's trapped in loadRepos, we should elevate it.
        // I will do this in the next edit.
    };

    let allLoadedRepos = []; // state reference
    async function loadRepos() {
        repoList.innerHTML = '<p style="text-align: center; opacity: 0.5;">Loading repositories...</p>';
        try {
            allLoadedRepos = await fetchRepos();
            renderRepos(allLoadedRepos);
        } catch (err) {
            repoList.innerHTML = `<p class="error">Error: ${err.message}</p>`;
        }
    }

    searchInput.oninput = () => renderRepos(allLoadedRepos);

    loadRepos();
    return container;
}
