![OpenMoko Screenshot](screenshot.png)

# OpenMoko v0.4

> Code, debug, and deploy from anywhere using AI agents.

OpenMoko is a self-hosted, mobile-first development environment that lets you go from idea → agent → production entirely from your phone.

It bundles [OpenCode](https://opencode.ai/) with a custom multi-service architecture for repository management, voice entry, and CI/CD awareness.

## What's New in v0.4
- **Gemini 2.5 Flash** is now the primary reformulation provider (faster, more capable)
- **Docker health checks** for all services
- **Graceful shutdown** handling for smoother deployments
- **Dynamic default branch** detection (works with `master` or `main`)
- **Multi-arch builds** (optional ARM64 support)

---

## Quick Setup

### Prerequisites
- Docker and Docker Compose
- SSH key for private repo access

### Deploy

```bash
# 1. Clone and configure
git clone https://github.com/pandeiro/OpenMoko.git
cd OpenMoko
cp .env.example .env
nano .env  # Set GITHUB_PAT, SSH key, optional AI keys

# 2. Add SSH key for private repos
cp ~/.ssh/id_rsa ./ssh/ && chmod 600 ./ssh/id_rsa

# 3. Build and run
docker compose up --build -d

# 4. Access
# Mobile PWA: http://your-vps-ip:7777/init/
# OpenCode: http://your-vps-ip:7777/
```

---

## Architecture

| Service | Port | Purpose |
|---------|------|---------|
| `agent` | 8080 | OpenCode development environment |
| `init` | 3000 | Mobile PWA for voice entry |
| `events` | 3001 | API, GitHub webhooks, push notifications |
| `gateway` | 80 → 7777 | Nginx reverse proxy |

All traffic routes through port 7777 via the gateway.

---

## Configuration

### Required Credentials

| Credential | Purpose |
|------------|---------|
| `SSH Key` | Clone private repositories |
| `GITHUB_PAT` | List and manage GitHub repos |

### Optional Credentials

| Credential | Purpose |
|------------|---------|
| `OPENCODE_API_KEY` | OpenCode Zen/Go provider for agent sessions |
| `GEMINI_API_KEY` | Primary AI for voice prompt reformulation |
| `OLLAMA_API_KEY` | Fallback AI for reformulation |
| `WHISPER_API_KEY` | Improved voice-to-text (OpenAI) |
| VAPID keys | CI/CD push notifications |

### Environment Variables

See `.env.example` for the full list. Key groups:

```bash
# Git Identity
GIT_USER_NAME=Your Name
GIT_USER_EMAIL=you@example.com

# Security
OPENMOKO_USER=admin
OPENMOKO_PASSWORD=secret

# GitHub
GITHUB_PAT=ghp_xxx
GITHUB_WEBHOOK_SECRET=your-secret

# AI Inference
GEMINI_API_KEY=xxx        # Primary reformulation
WHISPER_API_KEY=xxx       # Optional, better transcription

# Web Push (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
VAPID_CONTACT=mailto:you@example.com
```

### GitHub Webhook Setup

For CI/CD awareness, add a webhook to your repositories:

1. **Payload URL**: `https://your-domain.com/webhooks/github`
2. **Content type**: `application/json`
3. **Secret**: Your `GITHUB_WEBHOOK_SECRET`
4. **Events**: `push`, `workflow_run`, `pull_request`

---

## Deployment

### Local Development & Testing

#### 1. Direct Process (Debugging)
Run services separately for granular debugging:

```bash
# Terminal 1: Events backend
cd events && DATA_DIR=../events_data CODE_DIR=../code npm run dev

# Terminal 2: Init frontend
cd init && npm run dev
```

The Vite dev server proxies `/api/*` to `localhost:3001`.

#### 2. Local Docker Build (Multi-arch / Integration)
To build all images locally (e.g., for ARM64/Apple Silicon) and test the full multi-service environment:

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

**Verify the setup:**
- **Check health:** `docker compose -f docker-compose.dev.yml ps` (wait for "healthy" status)
- **Access UI:** Open `http://localhost:7777/init/` in your browser
- **Check Gateway:** `curl http://localhost:7777/health` should return "OK"

This starts containers with the `-dev` suffix (e.g., `openmoko-gateway-dev`) and maps port 7777 to your host.

### Production VPS

For HTTPS with a domain:

1. **Set up a reverse proxy** (Caddy recommended):

```bash
# Install Caddy
sudo apt install caddy

# Caddyfile
your-domain.com {
    reverse_proxy localhost:7777
}
```

2. **Caddy handles SSL automatically** via Let's Encrypt.

3. **Update webhook URL** in GitHub to use `https://your-domain.com/webhooks/github`

### Multi-architecture Builds

For ARM64 support (Apple Silicon, Raspberry Pi):

1. Go to [GitHub Actions](https://github.com/pandeiro/OpenMoko/actions/workflows/deploy.yml)
2. Click "Run workflow"
3. Check "Build multi-architecture images"
4. Run the workflow

---

## Usage

### Managing Repositories
Open the Init PWA → tap ⚙️ → search and enable repos. OpenMoko clones them automatically.

### Starting a Task
1. Select a repo
2. Tap 🎙️ and speak your task
3. Review the reformulated prompt
4. Tap "Branch & Start"

### Resuming Failures
When CI fails, you'll get a push notification. Tap it to see logs and send a fix to the agent.

---

## Troubleshooting

### Clone Failed
**Symptom:** "Clone failed" error when enabling a repo.

**Solution:** Check SSH key permissions:
```bash
ls -la ./ssh/
# Should show: -rw------- (600)
chmod 600 ./ssh/id_rsa
```

### Push Notifications Not Working
**Symptom:** No notifications on phone.

**Solution:** Verify VAPID keys are set:
```bash
# Generate new keys
npx web-push generate-vapid-keys

# Add to .env
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
VAPID_CONTACT=mailto:you@example.com

# Restart events service
docker compose restart events
```

### Transcription Failed
**Symptom:** "Transcription failed" or poor quality.

**Solution:** 
- Without `WHISPER_API_KEY`, the app uses Web Speech API (browser-dependent quality)
- Add `WHISPER_API_KEY` for OpenAI Whisper (better accuracy)

### Disk Full on Server
**Symptom:** Container fails to start or writes fail.

**Solution:**
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Check large files
du -sh /var/lib/docker/*
```

### Health Check Failing
**Symptom:** `docker ps` shows unhealthy container.

**Solution:**
```bash
# Check container logs
docker logs <container_name>

# Common causes:
# - events: missing .env or API keys
# - agent: slow startup (increase start_period)
```

---

## Persistence

| Path | Contents |
|------|----------|
| `/code` | Cloned projects |
| `events_data` | Repo state, sessions, failure records |
| `mise_data` | Language/toolchain installations |
| `agent_data` | OpenCode state and config |

---

## License

Provided as-is for personal and commercial use.
