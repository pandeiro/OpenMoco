/**
 * GitHub webhook handler — HMAC validation and event routing.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { readJSON, writeJSON } from './data.js';
import { getWorkflowFailureLogs } from './github.js';
import { dispatch } from './push.js';

/**
 * Validate the GitHub webhook HMAC-SHA256 signature.
 */
export function validateSignature(payload, signature) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) return false;
    if (!signature) return false;

    const expected = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');

    try {
        return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
        return false;
    }
}

/**
 * Handle a validated GitHub webhook event.
 */
export async function handleWebhookEvent(event, payload) {
    switch (event) {
        case 'push':
            return handlePush(payload);
        case 'workflow_run':
            return handleWorkflowRun(payload);
        case 'pull_request':
            return handlePullRequest(payload);
        default:
            console.log(`Ignoring webhook event: ${event}`);
    }
}

async function handlePush(payload) {
    const branch = payload.ref?.replace('refs/heads/', '');
    const repo = payload.repository?.name;
    console.log(`Push event: ${repo}/${branch} (${payload.commits?.length || 0} commits)`);
}

async function handleWorkflowRun(payload) {
    if (payload.action !== 'completed') return;

    const session = await readJSON('active_session.json');
    if (!session?.sessionId) return;

    const run = payload.workflow_run;
    const repo = payload.repository?.name;
    const branch = run.head_branch;

    // Only process events matching the active session
    if (session.branch && session.branch !== branch) return;
    if (!session.notificationsEnabled) return;

    if (run.conclusion === 'success') {
        // Pass notification
        await dispatch(
            `✓ ${branch} passed`,
            repo,
            { url: `/#/session/${session.sessionId}`, type: 'pass' }
        );
    } else if (run.conclusion === 'failure') {
        // Fetch failure details
        const [owner, repoName] = payload.repository.full_name.split('/');
        let failureInfo = null;

        try {
            failureInfo = await getWorkflowFailureLogs(owner, repoName, run.id);
        } catch (err) {
            console.error('Failed to fetch workflow logs:', err.message);
        }

        // Write failure record
        const failureId = `f-${Date.now()}`;
        const failureRecord = {
            failureId,
            sessionId: session.sessionId,
            repo,
            branch,
            workflowName: run.name,
            failingJob: failureInfo?.failingJob || 'unknown',
            failingStep: failureInfo?.failingStep || 'unknown',
            logTail: failureInfo?.logTail || 'Logs unavailable',
            capturedAt: new Date().toISOString(),
            consumed: false,
        };

        await writeJSON(`failures/${failureId}.json`, failureRecord);

        // Fail notification
        await dispatch(
            `✗ ${branch} failed`,
            `${failureInfo?.failingStep || 'CI'} — ${repo} — tap to send to agent`,
            {
                url: `/init/resume?failureId=${failureId}`,
                failureId,
                type: 'fail',
            }
        );
    }
}

async function handlePullRequest(payload) {
    if (payload.action !== 'closed' || !payload.pull_request?.merged) return;

    const session = await readJSON('active_session.json');
    if (!session?.sessionId) return;

    const mergedBranch = payload.pull_request.head.ref;
    if (session.branch === mergedBranch) {
        console.log(`Active session branch '${mergedBranch}' merged — clearing session`);
        await writeJSON('active_session.json', null);
    }
}
