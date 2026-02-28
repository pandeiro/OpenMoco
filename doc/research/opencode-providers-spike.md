# OpenCode Go/Zen API Key Integration Spike

**Date:** 2026-02-27
**Status:** Complete
**Source:** Task 11 from v0.4 Improvements Plan

## Executive Summary

OpenCode Zen and OpenCode Go are built-in providers that use OpenCode's authentication system. The recommended approach is using the `/connect` command, which stores credentials in `~/.local/share/opencode/auth.json`.

For Docker/container deployments, API keys can be injected via environment variables and the `opencode.json` config file.

## Research Findings

### OpenCode Zen

**Provider ID:** `opencode`
**Auth Endpoint:** `https://opencode.ai/auth`
**API Base URL:** `https://opencode.ai/zen/v1/`

**Models Available:**
- GPT 5.x series (5, 5.1, 5.2, 5.3, Codex variants)
- Claude 4.x series (Opus, Sonnet, Haiku)
- Gemini 3.x series (Pro, Flash)
- Qwen3 Coder 480B
- GLM 4.6, 4.7, 5
- Kimi K2, K2.5
- MiniMax M2.1, M2.5

**Model ID Format:** `opencode/<model-id>` (e.g., `opencode/gpt-5.2-codex`)

### OpenCode Go

**Provider ID:** `opencode-go`
**Auth Endpoint:** Same as Zen (`https://opencode.ai/auth`)
**Purpose:** Low-cost subscription plan for open coding models

**Configuration:** Similar to Zen, uses `/connect` command

### Configuration Format

For programmatic configuration (Docker/container), use `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "opencode": {
      "options": {
        "apiKey": "{env:OPENCODE_API_KEY}"
      }
    }
  }
}
```

**Note:** The `{env:VARIABLE_NAME}` syntax is supported by OpenCode for environment variable substitution.

## Implementation for OpenMoko

### Approach 1: Environment Variable (Recommended)

OpenCode supports environment variable substitution in config using `{env:VAR_NAME}` syntax.

**In entrypoint.sh:**
```bash
# OpenCode Zen provider is configured via /connect or auth.json
# For containerized use, we can set the API key in opencode.json
# OpenCode automatically picks up OPENCODE_API_KEY env var

if [ -n "$OPENCODE_API_KEY" ]; then
    echo "OpenCode API key detected..."
    # OpenCode will use OPENCODE_API_KEY env var automatically
fi
```

**In opencode.json (pre-configured):**
```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "opencode": {
      "options": {
        "apiKey": "{env:OPENCODE_API_KEY}"
      }
    }
  }
}
```

### Approach 2: Auth File Injection

Create `~/.local/share/opencode/auth.json`:

```json
{
  "opencode": {
    "type": "api-key",
    "api_key": "your-api-key"
  }
}
```

## Recommendations

1. **Use Approach 1** - Pre-configure `opencode.json` with `{env:OPENCODE_API_KEY}` placeholder
2. **Update .env.example** - Add `OPENCODE_API_KEY` as optional
3. **Update entrypoint.sh** - No changes needed if using env var approach

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENCODE_API_KEY` | OpenCode Zen/Go API key | Optional |

## Files to Update

1. **`.env.example`** - Add `OPENCODE_API_KEY=`
2. **`entrypoint.sh`** - No changes needed (env var approach)
3. **`opencode.json`** - Pre-configure with provider settings (optional)

## Conclusion

The simplest approach is to:
1. Add `OPENCODE_API_KEY` to `.env.example`
2. Let users set it in their `.env` file
3. OpenCode will automatically pick it up via the `{env:OPENCODE_API_KEY}` syntax in config

No changes to `entrypoint.sh` are necessary if using the environment variable approach.
