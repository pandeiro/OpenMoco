FROM node:bookworm-slim

# Install git, ssh, build tools, and other essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    openssh-client \
    bash \
    jq \
    tree \
    curl \
    ca-certificates \
    build-essential \
    libssl-dev \
    pkg-config \
    gnupg



# Install mise (replaces asdf) for language and tool version management
RUN curl https://mise.run | sh

# Install OpenCode globally
RUN npm i -g opencode-ai@latest

# Install Playwright for browser automation
RUN npm i -g playwright
RUN npx playwright install chromium --with-deps --only-shell

# Clean up apt cache to minimize image size
RUN rm -rf /var/lib/apt/lists/*

# Install Conductor plugin for OpenCode
RUN CI=true npx create-conductor-flow --agent opencode --scope global --git-ignore none

# Install Moko Logger plugin for OpenCode
COPY opencode-plugin/moko-logger.js /root/.config/opencode/plugin/moko-logger.js

# Install frontend-design skill for OpenCode
COPY skills/frontend-design/SKILL.md /root/.config/opencode/skills/frontend-design/SKILL.md

# Create workspace directory
RUN mkdir -p /workspace

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set NODE_PATH to include global npm modules
ENV NODE_PATH=/usr/local/lib/node_modules

WORKDIR /workspace

# Expose OpenCode default port (adjust if different)
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
