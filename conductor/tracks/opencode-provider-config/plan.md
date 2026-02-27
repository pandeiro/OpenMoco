# Implementation Plan: OpenCode Provider Config

## Track ID
`opencode-provider-config`

## Source
Follow-up from `providers-spike` - Implementation gap identified

## Priority
P2 (Medium) | Effort: ~30 min

---

## Problem

The providers-spike documented how to configure OpenCode Zen/Go providers, but the implementation is incomplete. Users can set `OPENCODE_API_KEY` in `.env.example`, but OpenCode won't actually use it because:

1. No `opencode.json` config exists in the container
2. `entrypoint.sh` doesn't inject the API key into OpenCode's config

---

## Phase 1: Implementation

### Task 1: Update Entrypoint Script
- [x] Task: Add OPENCODE_API_KEY handling to entrypoint.sh
    - [x] Check if OPENCODE_API_KEY is set
    - [x] Create/update opencode.json with provider config
    - [x] Use jq to merge with existing config if present

### Task 2: Verify Configuration
- [x] Task: Test the configuration works
    - [x] Build Docker image
    - [x] Verify opencode.json is created with API key
    - [x] Confirm OpenCode can use the provider

---

## Implementation Details

### entrypoint.sh Addition

```bash
# Configure OpenCode Zen provider if API key is present
if [ -n "$OPENCODE_API_KEY" ]; then
    echo "Configuring OpenCode Zen provider..."
    
    CONFIG_DIR="$HOME/.config/opencode"
    CONFIG_FILE="$CONFIG_DIR/opencode.json"
    
    mkdir -p "$CONFIG_DIR"
    
    if [ -f "$CONFIG_FILE" ]; then
        # Merge with existing config
        TEMP_FILE=$(mktemp)
        jq '.provider.opencode.options.apiKey = "'"$OPENCODE_API_KEY"'"' "$CONFIG_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$CONFIG_FILE"
    else
        # Create new config
        cat > "$CONFIG_FILE" <<EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "provider": {
    "opencode": {
      "options": {
        "apiKey": "${OPENCODE_API_KEY}"
      }
    }
  }
}
EOF
    fi
fi
```

---

## Files to Modify

1. `entrypoint.sh` - Add OPENCODE_API_KEY configuration logic
