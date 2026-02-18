# OpenMoco (Mobile Coding)

Simple, secure, mobile-first agentic coding where you can go from idea → agent → production entirely from your phone, without needing your laptop.

**Requirements**: A VPS with Docker installed and git repo access.

## Quick Setup

```bash
# 1. Clone and configure
cp .env.example .env
cp config/repos.txt.example config/repos.txt
nano .env  # Set GIT_USER_NAME and GIT_USER_EMAIL
nano config/repos.txt  # Add your repos

# 2. Add SSH keys
cp ~/.ssh/id_rsa ./ssh/ && chmod 600 ./ssh/id_rsa

# 3. Run
docker compose up -d

# 4. Access
open http://localhost:7777
```

## Configuration

### Environment Variables (.env)
| Variable | Description |
|----------|-------------|
| `GIT_USER_NAME` | Git commit author name |
| `GIT_USER_EMAIL` | Git commit author email |
| `OPENCODE_SERVER_PASSWORD` | Web UI password |
| `OLLAMA_API_KEY` | Ollama Cloud API key (optional) |
| `GOOGLE_AI_STUDIO_API_KEY` | Google AI Studio key (optional) |

### Repositories (config/repos.txt)
One repo URL per line. Lines starting with `#` are comments.
```
git@github.com:user/repo.git
https://github.com/user/repo.git  # with token in URL
```

### Volumes
| Host | Container | Purpose |
|------|-----------|---------|
| `./workspace` | `/workspace` | Cloned repos (read-write) |
| `./ssh` | `/root/.ssh` | SSH keys (read-only) |
| `./config` | `/config` | Config files (read-only) |

## Daily Use

```bash
# Add new repos
echo "git@github.com:user/newrepo.git" >> config/repos.txt
docker compose restart

# Update all repos
docker compose restart

# Access
docker compose logs -f  # View logs
docker compose exec opencode bash  # Shell into container
```

## Access Remotely

**Option A: Tailscale** (recommended)
```bash
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
# Edit docker-compose.yml: change "127.0.0.1:7777:8080" to "7777:8080"
docker compose restart
# Access at http://<tailscale-ip>:7777
```

**Option B: SSH tunnel**
```bash
ssh -L 7777:localhost:7777 user@vps
```

## Troubleshooting

```bash
# Check container status
docker compose logs -f

# Test GitHub auth
docker compose exec opencode ssh -T git@github.com

# Verify repos
docker compose exec opencode ls -la /workspace
```

For more details, see the full documentation in the wiki.

## License

Provided as-is for personal and commercial use.
