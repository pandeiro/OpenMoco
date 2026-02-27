/**
 * API client for events service.
 */

const API_BASE = '/api';

export async function fetchRepos() {
    const res = await fetch(`${API_BASE}/repos`);
    if (!res.ok) throw new Error('Failed to fetch repos');
    return res.json();
}

export async function enableRepo(name) {
    const res = await fetch(`${API_BASE}/repos/${name}/enable`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to enable repo');
    return res.json();
}

export async function disableRepo(name) {
    const res = await fetch(`${API_BASE}/repos/${name}/disable`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to disable repo');
    return res.json();
}

export async function transcribeAudio(blob) {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    const res = await fetch(`${API_BASE}/transcribe`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Transcription failed');
    return res.json();
}

export async function reformulatePrompt(transcript, project) {
    console.log('[api.js] reformulatePrompt called with transcript:', transcript?.substring(0, 50) + '...');
    console.log('[api.js] Project:', JSON.stringify(project, null, 2));
    const res = await fetch(`${API_BASE}/reform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, project }),
    });
    console.log('[api.js] Reformulation response status:', res.status);
    if (!res.ok) {
        const errorText = await res.text();
        console.error('[api.js] Reformulation error response:', errorText);
        throw new Error('Reformulation failed');
    }
    return res.json();
}

export async function createSession(params) {
    const res = await fetch(`${API_BASE}/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Session creation failed');
    return res.json();
}

export async function fetchActiveSession() {
    const res = await fetch(`${API_BASE}/session/active`);
    if (!res.ok) return null;
    return res.json();
}

export async function fetchFailure(id) {
    const res = await fetch(`${API_BASE}/failures/${id}`);
    if (!res.ok) throw new Error('Failure record not found');
    return res.json();
}
