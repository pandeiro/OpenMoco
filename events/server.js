import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env from parent directory
config({ path: join(__dirname, '..', '.env') });
console.log('[server] Loaded .env from:', join(__dirname, '..', '.env'));
console.log('[server] GITHUB_PAT present:', !!process.env.GITHUB_PAT);

import express from 'express';
import { ensureDataDir } from './lib/data.js';

// Route imports
import reposRouter from './routes/repos.js';
import transcribeRouter from './routes/transcribe.js';
import reformRouter from './routes/reform.js';
import sessionRouter from './routes/session.js';
import subscribeRouter from './routes/subscribe.js';
import failuresRouter from './routes/failures.js';
import webhooksRouter from './routes/webhooks.js';
import eventsRouter from './routes/events.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Set default CODE_DIR for local development
if (!process.env.CODE_DIR) {
  // Default to repo root/code when running locally
  process.env.CODE_DIR = join(__dirname, '..', 'code');
}
console.log('[server] CODE_DIR:', process.env.CODE_DIR);

// --- Body parsing ---
// JSON parsing with rawBody capture for webhook HMAC validation
app.use((req, res, next) => {
  if (req.headers['x-github-event']) {
    // Webhook requests: capture raw body for signature verification
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      req.rawBody = Buffer.concat(chunks);
      try {
        req.body = JSON.parse(req.rawBody.toString());
      } catch {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// --- Routes ---
app.use('/api/repos', reposRouter);
app.use('/api', transcribeRouter);
app.use('/api', reformRouter);
app.use('/api/session', sessionRouter);
app.use('/api', subscribeRouter);
app.use('/api/failures', failuresRouter);
app.use('/webhooks', webhooksRouter);
app.use('/events', eventsRouter);

// --- Startup ---
async function start() {
  await ensureDataDir();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`openmoko-events listening on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`\n[${signal}] Starting graceful shutdown...`);
    server.close(() => {
      console.log('[shutdown] HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[shutdown] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start events service:', err);
  process.exit(1);
});
