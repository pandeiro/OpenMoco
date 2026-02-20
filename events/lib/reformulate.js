/**
 * Reformulation — Groq (default) or Gemini Flash.
 * Single LLM call: raw transcript + project context → clean agent prompt + optional branch slug.
 */

import Groq from 'groq-sdk';

/**
 * Build the system prompt for reformulation.
 */
function buildSystemPrompt(project, enabledRepos) {
    return `You are a prompt reformulation assistant for a coding agent. Your job is to take a raw voice transcript and reformat it into a clear, well-scoped agent prompt.

INSTRUCTIONS:
- Reformat the transcript into a clear, actionable agent prompt
- Preserve ALL technical specifics (variable names, library names, file paths, etc.)
- Fix obvious speech-to-text errors (e.g., "camel case" likely means camelCase)
- If the task implies creating a new branch, suggest a kebab-case branch slug
- Output ONLY a JSON object with two fields: "prompt" (the reformulated prompt) and "slug" (a kebab-case branch slug, or null if not applicable)
- No commentary, no explanation — just the JSON object

ACTIVE PROJECT:
- Name: ${project.name}
- Description: ${project.description || 'No description'}
- Default branch: ${project.defaultBranch || 'main'}
- Last pushed: ${project.lastPushed || 'unknown'}

OTHER ENABLED REPOS: ${enabledRepos.length > 0 ? enabledRepos.map((r) => r.name).join(', ') : 'none'}

If it sounds like the developer might be talking about a different project than the active one, note this in the prompt.`;
}

/**
 * Reformulate a transcript into a clean agent prompt.
 * Uses Groq (Llama 3.3 70B) by default, falls back to Gemini Flash.
 *
 * @param {string} transcript - Raw voice transcript
 * @param {object} project - Active project metadata { name, description, defaultBranch, lastPushed }
 * @param {Array} enabledRepos - List of other enabled repos
 * @returns {{ prompt: string, slug: string|null }}
 */
export async function reformulate(transcript, project, enabledRepos = []) {
    const systemPrompt = buildSystemPrompt(project, enabledRepos);
    const userMessage = `RAW TRANSCRIPT:\n${transcript}`;

    // Try Groq first
    if (process.env.GROQ_API_KEY) {
        return reformulateWithGroq(systemPrompt, userMessage);
    }

    // Fall back to Gemini
    if (process.env.GEMINI_API_KEY) {
        return reformulateWithGemini(systemPrompt, userMessage);
    }

    // No inference provider configured — return raw transcript as-is
    return {
        prompt: transcript,
        slug: null,
    };
}

async function reformulateWithGroq(systemPrompt, userMessage) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '';
    return parseReformulationResponse(raw);
}

async function reformulateWithGemini(systemPrompt, userMessage) {
    // Use Gemini REST API directly (Google AI Studio free tier)
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
                },
            ],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseReformulationResponse(text);
}

function parseReformulationResponse(raw) {
    try {
        const parsed = JSON.parse(raw);
        return {
            prompt: parsed.prompt || raw,
            slug: parsed.slug || null,
        };
    } catch {
        // If parsing fails, treat the whole response as the prompt
        return { prompt: raw.trim(), slug: null };
    }
}
