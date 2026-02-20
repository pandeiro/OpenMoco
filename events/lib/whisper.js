/**
 * Whisper transcription proxy.
 * Forwards audio blob to OpenAI Whisper API.
 */

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

/**
 * Transcribe an audio buffer using OpenAI Whisper.
 * Returns { text } or null if WHISPER_API_KEY is not configured.
 */
export async function transcribe(audioBuffer, mimetype = 'audio/webm') {
    const apiKey = process.env.WHISPER_API_KEY;
    if (!apiKey) {
        return null; // Whisper not configured — caller should use Web Speech transcript
    }

    const ext = mimetype.includes('wav') ? 'wav' : mimetype.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob([audioBuffer], { type: mimetype });

    const form = new FormData();
    form.append('file', blob, `audio.${ext}`);
    form.append('model', 'whisper-1');

    const res = await fetch(WHISPER_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: form,
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Whisper API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    return { text: data.text };
}
