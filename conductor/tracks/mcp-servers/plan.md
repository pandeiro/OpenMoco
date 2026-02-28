# Implementation Plan: MCP Servers

## Track ID
`mcp-servers`

## Source
Follow-up from `skills-spike` - Recommended MCP servers

## Priority
P3 (Low) | Effort: ~1 hour

---

## Background

The skills-spike identified several MCP servers that would enhance OpenCode's capabilities. MCP servers provide external tools and context without bloating the agent's context window.

---

## Recommended MCP Servers

### High Priority

| Server | Purpose | Type |
|--------|---------|------|
| **Context7** | Up-to-date docs for libraries | Remote |
| **GitHub** | GitHub API integration | Remote |

### Medium Priority

| Server | Purpose | Type |
|--------|---------|------|
| **Grep.app** | Code search on GitHub | Remote |

---

## Phase 1: Research Configuration

### Task 1: Research MCP Config Format
- [x] Task: Document MCP server configuration
    - [x] How to configure remote MCP servers in opencode.json
    - [x] Required fields (url, type, auth)

### Task 2: Test Context7 MCP
- [x] Task: Configure and test Context7 (Research complete - manual testing required)
    - [x] Add to opencode.json
    - [ ] Verify it works in container (manual)

### Task 3: Test GitHub MCP
- [x] Task: Configure and test GitHub MCP (SKIPPED - requires OAuth browser flow)
    - [x] Determine auth requirements - Requires OAuth, not suitable for headless container
    - [ ] Add to opencode.json (deferred - needs interactive auth)

---

## Phase 2: Implementation

### Task 4: Update Entrypoint for MCP Config
- [x] Task: Add MCP server configuration to entrypoint.sh
    - [x] Conditionally add Context7 (always available)
    - [x] GitHub MCP deferred (requires OAuth browser flow - not suitable for headless container)

---

## Configuration Examples

### Context7 (Remote MCP)

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

### GitHub MCP (Remote with OAuth)

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

---

## Files to Modify

1. `entrypoint.sh` - Add MCP server configuration logic
2. `doc/research/skills-tools-spike.md` - Update with implementation notes
