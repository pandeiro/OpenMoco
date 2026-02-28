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

# Keep package list for now, easier to install needed packages
#   gnupg \
#   && rm -rf /var/lib/apt/lists/*

# Install mise (replaces asdf) for language and tool version management
RUN curl https://mise.run | sh

# Install OpenCode globally
RUN npm i -g opencode-ai@latest

# Install Conductor plugin for OpenCode
RUN CI=true npx create-conductor-flow --agent opencode --scope global --git-ignore none

# Install Moko Logger plugin for OpenCode
COPY opencode-plugin/moko-logger.js /root/.config/opencode/plugin/moko-logger.js

# Install frontend-design skill for OpenCode
COPY skills/frontend-design/SKILL.md /root/.config/opencode/skills/frontend-design/SKILL.md

# Create workspace directory
RUN mkdir -p /workspace

# Copy entrypoint script
COPY agent/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /workspace

# Expose OpenCode default port (adjust if different)
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
