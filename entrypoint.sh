#!/bin/bash
set -e

# Check for required password
if [ -z "$OPENCODE_SERVER_PASSWORD" ]; then
    echo "ERROR: OPENCODE_SERVER_PASSWORD environment variable is not set!"
    echo "Please set OPENCODE_SERVER_PASSWORD in your .env file"
    exit 1
fi

# Configure git from environment variables
if [ -n "$GIT_USER_NAME" ]; then
    git config --global user.name "$GIT_USER_NAME"
fi

if [ -n "$GIT_USER_EMAIL" ]; then
    git config --global user.email "$GIT_USER_EMAIL"
fi

# Configure Ollama provider if API key is present
if [ -n "$OLLAMA_API_KEY" ]; then
    echo "Ollama API key detected, configuring OpenCode provider..."
    
    CONFIG_DIR="$HOME/.config/opencode"
    CONFIG_FILE="$CONFIG_DIR/opencode.json"
    
    # Create config directory if it doesn't exist
    mkdir -p "$CONFIG_DIR"
    
    # Check if config file exists
    if [ -f "$CONFIG_FILE" ]; then
        # Config exists, check if ollama provider already configured
        if grep -q '"ollama"' "$CONFIG_FILE"; then
            echo "Ollama provider already configured in opencode.json"
        else
            # Add ollama provider to existing config
            echo "Adding Ollama provider to existing config..."
            # Use jq to merge the ollama provider
            TEMP_FILE=$(mktemp)
            jq '.provider.ollama = {
              "npm": "@ai-sdk/openai-compatible",
              "name": "Ollama Cloud",
              "options": {
                "baseURL": "https://ollama.com/v1"
              },
              "models": {
                "glm-5:cloud": {
                  "_launch": true,
                  "name": "glm-5:cloud"
                },
                "qwen3-coder:480b-cloud": {
                  "name": "qwen3-coder:480b-cloud"
                }
              }
            }' "$CONFIG_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$CONFIG_FILE"
        fi
    else
        # Config doesn't exist, create it with ollama provider
        echo "Creating opencode.json with Ollama provider..."
        cat > "$CONFIG_FILE" <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama Cloud",
      "options": {
        "baseURL": "https://ollama.com/v1"
      },
      "models": {
        "glm-5:cloud": {
          "_launch": true,
          "name": "glm-5:cloud"
        },
        "qwen3-coder:480b-cloud": {
          "name": "qwen3-coder:480b-cloud"
        }
      }
    }
  }
}
EOF
    fi
fi

# Set up SSH for git (if SSH keys are mounted)
if [ -d "/root/.ssh" ]; then
    chmod 700 /root/.ssh
    if [ -f "/root/.ssh/id_rsa" ]; then
        chmod 600 /root/.ssh/id_rsa
    fi
    if [ -f "/root/.ssh/id_ed25519" ]; then
        chmod 600 /root/.ssh/id_ed25519
    fi
    
    # Add GitHub to known_hosts to avoid prompt
    ssh-keyscan github.com >> /root/.ssh/known_hosts 2>/dev/null
    ssh-keyscan gitlab.com >> /root/.ssh/known_hosts 2>/dev/null
fi

# Clone repositories from repos.txt if it exists
REPOS_FILE="/config/repos.txt"
if [ -f "$REPOS_FILE" ]; then
    echo "Found repos.txt, checking repositories..."
    
    while IFS= read -r repo || [ -n "$repo" ]; do
        # Skip empty lines and comments
        [[ -z "$repo" || "$repo" =~ ^[[:space:]]*# ]] && continue
        
        # Extract repo name from URL (last part without .git)
        repo_name=$(basename "$repo" .git)
        repo_path="/workspace/$repo_name"
        
        if [ -d "$repo_path" ]; then
            echo "Repository $repo_name already exists, pulling latest..."
            cd "$repo_path"
            git pull || echo "Warning: Failed to pull $repo_name"
            cd /workspace
        else
            echo "Cloning $repo_name..."
            git clone "$repo" "$repo_path" || echo "Warning: Failed to clone $repo"
        fi
    done < "$REPOS_FILE"
    
    echo "Repository synchronization complete."
else
    echo "No repos.txt found at $REPOS_FILE, skipping auto-clone."
fi

# Launch OpenCode
echo "Starting OpenCode..."
exec opencode --host 0.0.0.0 --port 8080 --password "$OPENCODE_SERVER_PASSWORD" /workspace
