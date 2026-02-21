/**
 * Reformulation — Gemini 3 Flash (default) or Ollama Cloud.
 * Single LLM call: raw transcript + project context → clean agent prompt + optional branch slug.
 */

import { GoogleGenAI } from '@google/genai';

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
 * Uses Gemini 3 Flash (Thinking: Medium) by default, falls back to Ollama Cloud.
 *
 * @param {string} transcript - Raw voice transcript
 * @param {object} project - Active project metadata { name, description, defaultBranch, lastPushed }
 * @param {Array} enabledRepos - List of other enabled repos
 * @returns {{ prompt: string, slug: string|null }}
 */
export async function reformulate(transcript, project, enabledRepos = []) {
    const systemPrompt = buildSystemPrompt(project, enabledRepos);
    const userMessage = `RAW TRANSCRIPT:\n${transcript}`;

    // 1. Try Gemini 3 Flash First (Generous free tier, high quality)
    if (process.env.GEMINI_API_KEY) {
        try {
            return await reformulateWithGemini(systemPrompt, userMessage);
        } catch (err) {
            console.error('Gemini reformulation failed, falling back to Ollama Cloud:', err.message);
        }
    }

    // 2. Fall back to Ollama Cloud Inference API
    if (process.env.OLLAMA_API_KEY) {
        try {
            return await reformulateWithOllama(systemPrompt, userMessage);
        } catch (err) {
            console.error('Ollama Cloud reformulation failed:', err.message);
        }
    }

    // No inference provider configured or all failed — return raw transcript as-is
    return {
        prompt: transcript,
        slug: null,
    };
}

async function reformulateWithGemini(systemPrompt, userMessage) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${systemPrompt}\n\n${userMessage}`,
        config: {
            thinkingConfig: {
                thinkingLevel: 'medium',
            },
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 1024,
        },
    });

    const raw = response.text || '';
    return parseReformulationResponse(raw);
}

async function reformulateWithOllama(systemPrompt, userMessage) {
    const ollamaApiKey = process.env.OLLAMA_API_KEY;
    const model = 'gpt-oss:120b'; 
    const url = 'https://ollama.com/api/chat'; 

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ollamaApiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: false,
            format: 'json',
            options: {
                temperature: 0.3,
                num_predict: 1024,
            }
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Ollama API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    const raw = data.message?.content || '';
    return parseReformulationResponse(raw);
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
