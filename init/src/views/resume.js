import { fetchFailure, createSession } from '../lib/api.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'container animate-fade-in';

    const params = new URLSearchParams(window.location.search);
    const failureId = params.get('failureId');

    if (!failureId) {
        container.innerHTML = '<p class="error">No failure ID provided.</p>';
        return container;
    }

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '2rem';
    header.innerHTML = `
    <h1 style="margin: 0; color: var(--error);">CI Failure</h1>
    <button class="icon-btn" onclick="navigate('/init/')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  `;
    container.appendChild(header);

    const content = document.createElement('div');
    container.appendChild(content);

    async function loadFailure() {
        content.innerHTML = '<p style="text-align: center; opacity: 0.5;">Loading failure details...</p>';
        try {
            const failure = await fetchFailure(failureId);
            renderFailure(failure);
        } catch (err) {
            content.innerHTML = `<p class="error">Error: ${err.message}</p>`;
        }
    }

    function renderFailure(failure) {
        content.innerHTML = `
      <div class="card" style="border-color: var(--error); margin-bottom: 1.5rem;">
        <div style="font-weight: 800; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--fg-dim);">FAILING STEP</div>
        <div style="font-family: monospace; font-size: 1.1rem; margin-bottom: 1rem;">${failure.failingStep}</div>
        
        <div style="font-weight: 800; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--fg-dim);">LOGS</div>
        <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; font-size: 0.8rem; overflow-x: auto; white-space: pre-wrap;">${failure.logTail}</pre>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">How should the agent fix this?</label>
        <textarea id="fix-note" class="card" style="width: 100%; min-height: 100px; padding: 1rem; font-family: inherit; font-size: 1rem;" placeholder="Add a note for the agent (optional)..."></textarea>
      </div>
      
      <button id="send-btn" class="primary" style="width: 100%; background: var(--error);">
        Send fix to agent
      </button>
    `;

        content.querySelector('#send-btn').onclick = async () => {
            const btn = content.querySelector('#send-btn');
            btn.disabled = true;
            btn.innerText = 'Sending...';

            const note = content.querySelector('#fix-note').value;
            const prompt = `CI failed at step "${failure.failingStep}". Here are the logs:\n\n${failure.logTail}\n\n${note ? `Instructions: ${note}` : 'Please investigate and fix the failure.'}`;

            try {
                const res = await createSession({
                    projectPath: `/code/${failure.repo}`,
                    prompt,
                    repo: failure.repo,
                    notificationsEnabled: true
                });
                window.location.href = res.redirectUrl;
            } catch (err) {
                alert('Failed to send fix: ' + err.message);
                btn.disabled = false;
                btn.innerText = 'Send fix to agent';
            }
        };
    }

    loadFailure();
    return container;
}
