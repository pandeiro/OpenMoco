# Skills/Tools Spike Report

**Date:** 2026-02-27
**Status:** Complete
**Source:** Task 10 from v0.4 Improvements Plan

## Executive Summary

OpenCode has a rich ecosystem of extensibility options: **Plugins**, **MCP Servers**, **Skills**, and **Custom Tools**. For OpenMoko's use case (a voice-first agent wrapper), the most relevant integrations are:

1. **MCP Servers** - For enhanced context (Context7) and code search (Grep.app)
2. **Notification Plugins** - For alerting when tasks complete
3. **Quota Tracking** - For monitoring API usage

## Extensibility Mechanisms

### 1. Plugins (Recommended for local customization)

**Location:** `~/.config/opencode/plugins/*.ts` or `~/.config/opencode/plugins/*.js`

**Capabilities:**
- Hook into all OpenCode events (messages, tools, sessions, files)
- Add custom tools
- Modify behavior (e.g., env injection, .env protection)
- Send notifications

**Installation:**
- Local: Place `.ts` or `.js` files in plugins directory
- npm: Add to `opencode.json` under `plugin` array

**Key Events:**
- `event` - Raw event stream (token counts, message updates)
- `tool.execute.before/after` - Tool call interception
- `session.idle` - Session completion
- `file.edited` - File changes

### 2. MCP Servers (Recommended for external integrations)

**Configuration:** `opencode.json` under `mcp` object

**Types:**
- **Local** - Run via `npx` or `bun x`
- **Remote** - HTTP-based with OAuth support

**Caveat:** MCP servers add to context. Use sparingly to avoid token bloat.

### 3. Agent Skills

**Location:** `.opencode/skills/<name>/SKILL.md`

**Purpose:** Reusable instructions loaded on-demand via `skill` tool

**Format:** YAML frontmatter + markdown content

### 4. Custom Tools

**Via Plugins:** Use `tool()` helper to define custom tools with Zod schemas

---

## Recommended Integrations for OpenMoko

### High Priority

| Name | Type | Purpose | Stars | Notes |
|------|------|---------|-------|-------|
| **Context7** | MCP (remote) | Up-to-date docs for LLMs | 47k | Essential for current library docs |
| **GitHub MCP** | MCP (remote) | GitHub API integration | 27k | For PR/issue operations |
| **opencode-notify** | Plugin | Native OS notifications | 78 | Alert when tasks complete |
| **opencode-quota** | Plugin | Token usage tracking | 46 | Monitor API costs |

### Medium Priority

| Name | Type | Purpose | Stars | Notes |
|------|------|---------|-------|-------|
| **opencode-pty** | Plugin | Background process management | 246 | Run long-running commands |
| **opencode-worktree** | Plugin | Git worktree automation | 229 | Parallel branch work |
| **Grep.app** | MCP (remote) | Code search on GitHub | - | Find code examples |
| **opencode-wakatime** | Plugin | Usage tracking | 80 | Time tracking |

### Low Priority / Research

| Name | Type | Purpose | Stars | Notes |
|------|------|---------|-------|-------|
| **opencode-workspace** | Plugin | Multi-agent orchestration | 167 | Complex workflows |
| **opencode-background-agents** | Plugin | Async agent delegation | 89 | Overnight coding |
| **flow-next-opencode** | Plugin | Plan-first workflows | 33 | Ralph autonomous mode |

### Agent Skills (SKILL.md)

| Name | Purpose | Source |
|------|---------|--------|
| **frontend-design** | Create distinctive, production-grade UI with high design quality | [pandeiro/claude-skill-forks](https://github.com/pandeiro/claude-skill-forks/tree/main/skills/frontend-design) |

**frontend-design skill** - Guides AI to create distinctive frontend interfaces that avoid generic "AI slop" aesthetics:
- Bold aesthetic direction (minimalist, maximalist, brutalist, etc.)
- Typography guidance (avoid Inter, Roboto, Arial)
- Color commitment and cohesive palettes
- Motion/animation patterns
- Spatial composition techniques
- Background/visual detail patterns

**Installation:** Place in `~/.config/opencode/skills/frontend-design/SKILL.md`

---

## MCP Server Configuration Examples

### Context7 (Docs Search)

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

### GitHub MCP

```json
{
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp",
      "oauth": {}
    }
  }
}
```

### Grep.app (Code Search)

```json
{
  "mcp": {
    "gh_grep": {
      "type": "remote",
      "url": "https://mcp.grep.app"
    }
  }
}
```

---

## Plugin Recommendations for OpenMoko Agent Container

### Already Implemented
- **moko-logger** - Custom plugin for event logging (tokens, tools)
- **frontend-design** - Skill for high-quality UI design (SKILL.md)

### Recommended Additions

1. **opencode-notify** - Desktop notifications when sessions complete
   ```bash
   npm install -g opencode-notify
   ```

2. **opencode-quota** - Track API usage across providers
   ```bash
   npm install -g opencode-quota
   ```

---

## Security Considerations

1. **OAuth MCP servers** - Use `oauth: false` for API key-based auth
2. **Local MCP servers** - Audit command arguments
3. **Plugins** - Can access file system and execute commands
4. **Permissions** - Use `permission.skill` patterns to control skill access

---

## Implementation Notes

### For Docker Agent Container

1. **Plugins** - Install via npm globally or copy to `/root/.config/opencode/plugins/`
2. **MCP Servers** - Configure in `/root/.config/opencode/opencode.json`
3. **Skills** - Place in `/root/.config/opencode/skills/<name>/SKILL.md`

### MCP Servers Implemented (2026-02-27)

**Context7** - Added to `entrypoint.sh` for automatic configuration:
- Type: Remote MCP (no auth required for free tier)
- URL: `https://mcp.context7.com/mcp`
- Purpose: Up-to-date documentation lookup for libraries
- Note: Optional `CONTEXT7_API_KEY` for higher rate limits

**GitHub MCP** - Deferred:
- Requires OAuth browser flow for authentication
- Not suitable for headless container environment
- Could be added later with manual `opencode mcp auth github` after container start

### For Init PWA (Future Enhancement)

- Display plugin/MCP status in settings
- Show token usage from moko-logger events
- Real-time activity feed from plugin events

---

## Resources

- [OpenCode Plugins Docs](https://opencode.ai/docs/plugins/)
- [OpenCode MCP Servers Docs](https://opencode.ai/docs/mcp-servers/)
- [OpenCode Ecosystem](https://opencode.ai/docs/ecosystem/)
- [awesome-opencode](https://github.com/awesome-opencode/awesome-opencode)
- [opencode.cafe](https://opencode.cafe)

---

## Conclusion

For OpenMoko's immediate needs:
1. **Keep moko-logger** for event capture (already implemented)
2. **Add Context7 MCP** for enhanced documentation lookup
3. **Consider opencode-notify** for task completion alerts
4. **Defer** complex orchestration plugins (workspace, background-agents) until use cases emerge
