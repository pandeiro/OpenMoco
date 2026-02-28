# OpenMoko Tech Stack

## Frontend

### Framework & Build
- **Vite** - Fast build tool and dev server
- **Vanilla JavaScript** - ES modules, no frontend framework
- **Native CSS** - CSS variables for theming

### Key Libraries
- **Web Speech API** - Browser-native speech recognition
- **Service Worker** - PWA offline capabilities

## Backend

### Runtime & Framework
- **Node.js** - JavaScript runtime
- **Express 5.x** - Web framework (ES modules)

### Key Dependencies
- **@google/genai** - Google Gemini AI integration
- **multer** - Multipart form handling (audio uploads)
- **web-push** - Push notification delivery (VAPID protocol)
- **dotenv** - Environment configuration

## AI & Voice Services

### Primary AI
- **Google Gemini** (via @google/genai) - Voice prompt reformulation

### Voice Transcription
- **OpenAI Whisper API** - Improved voice-to-text accuracy (optional)
- **Web Speech API** - Browser-native fallback

### Fallback AI
- **Ollama Cloud** - Alternative reformulation backend

## Infrastructure

### Containerization
- **Docker Compose** - Multi-container orchestration
- **4 Services:** agent, gateway, init, events

### Networking
- **Nginx** - Reverse proxy routing all traffic through port 7777

### Toolchain
- **mise** - Dynamic language/tool installation (Node, Python, Rust, Go, etc.)

## Version Control

- **Git** - Source control with SSH key authentication

## Data Storage

**No Database:** State is stored as flat JSON files in Docker volumes:
- `active_session.json` - Current agent session
- `repos.json` - Enabled repositories
- `push_subscriptions.json` - Web push subscriptions
- `failures/` - CI/CD failure records

## External Integrations

### MCP Servers
- **Context7** - Up-to-date library documentation lookup (remote MCP)

### GitHub
- **GitHub PAT** - Repository listing and cloning
- **GitHub Webhooks** - CI/CD event notifications (push, workflow_run, pull_request)

### Web Push
- **VAPID Protocol** - Authenticated push notifications to mobile devices
