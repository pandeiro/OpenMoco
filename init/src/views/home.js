import { fetchRepos, fetchActiveSession, transcribeAudio, reformulatePrompt, createSession } from '../lib/api.js';
import { SpeechManager } from '../lib/speech.js';

export async function render() {
    console.log('[home.js] Render started. Browser info:', navigator.userAgent);
    console.log('[home.js] Platform:', navigator.platform);
    console.log('[home.js] Language:', navigator.language);
    
    const container = document.createElement('div');
    container.className = 'animate-fade-in';

    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
    <div style="font-weight: 800; font-size: 1.2rem; letter-spacing: -0.5px;">OPEN<span style="color:var(--primary)">MOKO</span></div>
    <button class="icon-btn" onclick="navigate('/init/repos')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
  `;
    container.appendChild(header);

    const main = document.createElement('div');
    main.className = 'container';
    container.appendChild(main);

    let repos = [];
    let selectedRepo = null;
    let activeSession = null;
    let currentTranscript = '';
    let reformulatedData = null;
    let reformulationError = null; // New variable to store reformulation error
    let notificationsEnabled = true;

    const speech = new SpeechManager(
        (text, isFinal) => handleTranscription(text, isFinal),
        (state) => updateUI(state)
    );

    async function init() {
        console.log('[home.js] init() starting - loading context...');
        main.innerHTML = '<p style="text-align: center; opacity: 0.5; margin-top: 4rem;">Loading context...</p>';
        try {
            console.log('[home.js] Fetching repos and active session...');
            const [reposRes, sessionRes] = await Promise.all([
                fetchRepos(),
                fetchActiveSession()
            ]);
            console.log('[home.js] Repos loaded:', reposRes.length, 'total,', reposRes.filter(r => r.enabled).length, 'enabled');
            console.log('[home.js] Active session:', sessionRes);
            console.log('[home.js] First repo data:', JSON.stringify(reposRes[0], null, 2));
            repos = reposRes.filter(r => r.enabled);
            activeSession = sessionRes;

            const params = new URLSearchParams(window.location.search);
            const isNew = params.get('new') === 'true';

            if (isNew) {
                selectedRepo = { name: 'New Project', isNew: true };
            } else if (repos.length === 0) {
                navigate('/init/welcome');
                return;
            } else {
                console.log('[home.js] BEFORE SORT - repos count:', repos.length);
                console.log('[home.js] All enabled repos:', repos.map(r => ({name: r.name, cloneStatus: r.cloneStatus, enabledAt: r.enabledAt})));
                repos.sort((a, b) => new Date(b.enabledAt || 0) - new Date(a.enabledAt || 0));
                console.log('[home.js] AFTER SORT - first repo:', repos[0]?.name, 'cloneStatus:', repos[0]?.cloneStatus);
                selectedRepo = activeSession ? repos.find(r => r.name === activeSession.repo) || repos[0] : repos[0];
                console.log('[home.js] Selected repo:', selectedRepo?.name, 'cloneStatus:', selectedRepo?.cloneStatus);
                
                // Check if selected repo has clone error - redirect to repos if so
                console.log('[home.js] Checking cloneStatus === error:', selectedRepo?.cloneStatus === 'error');
                if (selectedRepo.cloneStatus === 'error') {
                    console.log('[home.js] >>> REDIRECTING to repos because cloneStatus is error');
                    navigate('/init/repos');
                    return;
                }
            }

            renderHome();
        } catch (err) {
            main.innerHTML = `<p class="error">Failed to load: ${err.message}</p>`;
        }
    }

    function handleTranscription(text, isFinal) {
        console.log('[home.js] handleTranscription called:', text.substring(0, 50) + '...', 'isFinal:', isFinal);
        currentTranscript = text;
        const transcriptEl = document.getElementById('live-transcript');
        if (transcriptEl) {
            transcriptEl.innerText = text;
        } else {
            console.warn('[home.js] live-transcript element not found in DOM');
        }
    }

    async function updateUI(state) {
        console.log('[home.js] updateUI called with state:', state);
        if (state === 'TRANSCRIBING') {
            renderProcessing('Improving transcript...');
            try {
                const audioBlob = speech.getAudioBlob();
                if (audioBlob) {
                    const result = await transcribeAudio(audioBlob);
                    if (result && result.text) {
                        currentTranscript = result.text;
                    }
                }
                speech.setState('REFORMULATING');
            } catch (err) {
                console.warn('Whisper failed, sticking to Web Speech:', err);
                speech.setState('REFORMULATING');
            }
        } else if (state === 'REFORMULATING') {
            renderProcessing('Reformulating...');
            reformulationError = null; // Reset error before new attempt
            console.log('[home.js] REFORMULATING state. selectedRepo:', JSON.stringify(selectedRepo, null, 2));
            console.log('[home.js] currentTranscript:', currentTranscript);
            try {
                const project = selectedRepo.isNew ? { name: "New Project", isNew: true } : {
                    name: selectedRepo.name,
                    description: selectedRepo.description,
                    defaultBranch: selectedRepo.defaultBranch,
                    lastPushed: selectedRepo.lastPushed
                };
                console.log('[home.js] Sending project to reformulate:', JSON.stringify(project, null, 2));
                reformulatedData = await reformulatePrompt(currentTranscript, project);
                speech.setState('REVIEWING');
            } catch (err) {
                console.error('Reformulation failed:', err);
                reformulationError = 'Failed to reformulate prompt. Using raw transcript.';
                reformulatedData = { prompt: currentTranscript, slug: null };
                speech.setState('REVIEWING');
            }
        } else if (state === 'REVIEWING') {
            renderReview();
        } else {
            renderHome();
        }
    }

    function renderHome() {
        main.innerHTML = '';

        // Active Project Display
        const projectDisplay = document.createElement('div');
        projectDisplay.className = 'card glass';
        projectDisplay.style.display = 'flex';
        projectDisplay.style.flexDirection = 'column';
        projectDisplay.style.padding = '1rem 1.5rem';
        projectDisplay.style.marginBottom = '2rem';
        
        const hasCloneError = selectedRepo.enabled && selectedRepo.cloneStatus === 'error';
        
        projectDisplay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 0.8rem; color: var(--fg-dim); margin-bottom: 0.25rem;">CURRENT PROJECT</div>
                    <div style="font-weight: 600; font-size: 1.1rem;">${selectedRepo.name}</div>
                </div>
                <button class="icon-btn" onclick="navigate('/init/repos')" style="background: rgba(255,255,255,0.05);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </button>
            </div>
            ${hasCloneError ? `
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 0.5rem;">
                    <div style="color: var(--error); font-size: 0.9rem; font-weight: 500;">⚠️ Workspace not ready</div>
                    <div style="color: var(--fg-dim); font-size: 0.8rem; margin-top: 0.25rem;">This project needs to be cloned. Go to project selection to retry.</div>
                </div>
            ` : ''}
        `;
        main.appendChild(projectDisplay);

        // Voice Center
        const voiceCenter = document.createElement('div');
        voiceCenter.style.display = 'flex';
        voiceCenter.style.flexDirection = 'column';
        voiceCenter.style.alignItems = 'center';
        voiceCenter.style.justifyContent = 'center';
        voiceCenter.style.minHeight = '50vh';
        voiceCenter.style.gap = '2rem';

        const isActiveContext = speech.state === 'RECORDING' || speech.state === 'PAUSED';

        const statusText = document.createElement('p');
        statusText.style.color = 'var(--fg-dim)';
        if (speech.state === 'RECORDING') statusText.innerText = 'Listening...';
        else if (speech.state === 'PAUSED') statusText.innerText = 'Waiting...';
        else statusText.innerText = 'Tap to start recording';
        voiceCenter.appendChild(statusText);

        const micBtn = document.createElement('button');
        micBtn.style.width = '120px';
        micBtn.style.height = '120px';
        micBtn.style.borderRadius = '50%';
        micBtn.style.background = isActiveContext ? 'var(--error)' : 'var(--primary)';
        micBtn.style.boxShadow = `0 0 30px ${isActiveContext ? 'rgba(239, 68, 68, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`;
        micBtn.style.display = 'flex';
        micBtn.style.alignItems = 'center';
        micBtn.style.justifyContent = 'center';
        micBtn.innerHTML = isActiveContext ?
            '<svg width="48" height="48" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>' :
            '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>';

        micBtn.onclick = () => {
            console.log('[home.js] Mic button clicked. Current speech state:', speech.state);
            if (speech.state === 'IDLE') {
                speech.start();
            } else if (isActiveContext) {
                speech.stop();
            }
        };

        voiceCenter.appendChild(micBtn);

        if (isActiveContext) {
            const liveTranscript = document.createElement('div');
            liveTranscript.id = 'live-transcript';
            liveTranscript.style.textAlign = 'center';
            liveTranscript.style.maxWidth = '80%';
            liveTranscript.style.fontSize = '1.2rem';
            liveTranscript.style.fontWeight = '500';
            liveTranscript.innerText = currentTranscript;
            voiceCenter.appendChild(liveTranscript);
        }

        if (speech.state === 'PAUSED') {
            const contBtn = document.createElement('button');
            contBtn.className = 'primary animate-fade-in';
            contBtn.innerText = 'Continue Talking';
            contBtn.style.background = 'var(--fg-dim)';
            contBtn.style.marginTop = '-1rem';
            contBtn.onclick = () => speech.continueListening();
            voiceCenter.appendChild(contBtn);
        }

        main.appendChild(voiceCenter);
    }

    function renderProcessing(text) {
        main.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh;">
        <div class="card" style="padding: 2rem; text-align: center;">
          <div style="margin-bottom: 1rem; color: var(--primary);">
            <svg class="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
          </div>
          <p>${text}</p>
        </div>
      </div>
    `;
    }

    function renderReview() {
        main.innerHTML = '';

        const reviewContainer = document.createElement('div');
        reviewContainer.className = 'animate-fade-in';

        reviewContainer.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--fg-dim);">AGENT PROMPT</label>
        ${reformulationError ? `<p style="color: var(--error); font-size: 0.85rem; margin-top: -0.5rem; margin-bottom: 1rem;">${reformulationError}</p>` : ''}
        <textarea id="prompt-edit" class="card" style="width: 100%; min-height: 150px; padding: 1rem; border: none; font-family: inherit; font-size: 1rem; background: transparent;">${reformulatedData.prompt}</textarea>
        ${reformulatedData.slug ? `<div style="margin-top: 1rem; font-size: 0.8rem; color: var(--accent);">Branch: ${reformulatedData.slug}</div>` : ''}
      </div>
      
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; opacity: 0.8;">
        <input type="checkbox" id="notify-check" ${notificationsEnabled ? 'checked' : ''} style="width: 20px; height: 20px;">
        <label for="notify-check" style="cursor: pointer;">Notify me when CI completes</label>
      </div>
      
      
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${selectedRepo.isNew ? `
            <button id="main-start" class="primary" style="height: 60px; font-size: 1.1rem; border-radius: 1rem;">
              Setup Project →
            </button>
        ` : `
            <button id="branch-start" class="primary" style="height: 60px; font-size: 1.1rem; border-radius: 1rem;">
              Branch & Init →
            </button>
            <button id="main-start" style="background: rgba(255,255,255,0.05); color: var(--fg-dim); font-size: 0.9rem;">
              Init →
            </button>
        `}
        <button id="reset-btn" class="icon-btn" style="align-self: center; margin-top: 1rem;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          Start over
        </button>
      </div>
    `;

        reviewContainer.querySelector('#notify-check').onchange = (e) => {
            notificationsEnabled = e.target.checked;
        };

        if (!selectedRepo.isNew) {
            reviewContainer.querySelector('#branch-start').onclick = () => submitSession(true);
        }
        reviewContainer.querySelector('#main-start').onclick = () => submitSession(false);
        reviewContainer.querySelector('#reset-btn').onclick = () => {
            currentTranscript = '';
            reformulatedData = null;
            reformulationError = null; // Clear error on reset
            speech.setState('IDLE');
        };

        main.appendChild(reviewContainer);
    }

    async function submitSession(useBranch) {
        const prompt = document.getElementById('prompt-edit').value;
        renderProcessing('Creating session...');

        try {
            const projectPath = selectedRepo.isNew ? `/code/${reformulatedData.slug || 'new-project'}` : `/code/${selectedRepo.name}`;

            const res = await createSession({
                projectPath,
                isNewProject: selectedRepo.isNew,
                prompt,
                branch: useBranch ? selectedRepo.defaultBranch : null,
                slug: useBranch ? reformulatedData.slug : null,
                repo: selectedRepo.isNew ? (reformulatedData.slug || 'new-project') : selectedRepo.name,
                notificationsEnabled
            });
            window.location.href = res.redirectUrl;
        } catch (err) {
            alert('Failed to start session: ' + err.message);
            speech.setState('REVIEWING');
        }
    }

    init();
    return container;
}
