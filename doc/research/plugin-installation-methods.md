# OpenCode Plugin Installation Methods

**Date:** 2026-02-27
**Track:** opencode-plugins

## Overview

OpenCode supports multiple methods for installing and configuring plugins. This document outlines the three primary approaches and their trade-offs for the OpenMoko agent container environment.

---

## Method 1: npm Global Install

**Command:**
```bash
npm install -g opencode-notify
```

**How it works:**
- Installs plugin as a global npm package
- OpenCode automatically discovers plugins in global node_modules
- Plugin must export a proper OpenCode plugin interface

**Pros:**
- Simple, one-line installation
- Easy to update via npm
- Standard Node.js ecosystem approach

**Cons:**
- Requires npm registry access during container build
- Version management depends on npm semver
- May install unnecessary dependencies

**Use case:** Well-maintained, published plugins with stable APIs

---

## Method 2: Local File Approach (Current Pattern)

**Command:**
```dockerfile
COPY opencode-plugin/moko-logger.js /root/.config/opencode/plugin/moko-logger.js
```

**How it works:**
- Plugin files are copied directly into the OpenCode plugin directory
- OpenCode loads `.js` or `.ts` files from `~/.config/opencode/plugin/`
- No npm installation required

**Pros:**
- Full control over plugin code
- No external dependencies during build
- Works offline
- Easy to customize for specific needs

**Cons:**
- Manual updates required
- Plugin code must be maintained in repository
- No automatic version management

**Use case:** Custom plugins, offline environments, plugins requiring modification

**Current implementation:** `moko-logger` uses this approach

---

## Method 3: opencode.json Plugin Array

**Configuration:**
```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-notify", "opencode-quota"]
}
```

**How it works:**
- List plugin names in the `plugin` array in `opencode.json`
- OpenCode automatically installs plugins via Bun at startup
- Similar to npm global install but managed by OpenCode

**Pros:**
- Declarative configuration
- Automatic installation and updates
- Easy to enable/disable plugins
- Version control friendly

**Cons:**
- Requires internet access at container startup
- Bun installation may fail in restricted networks
- Less control over installation timing

**Use case:** Published plugins that don't require customization

---

## Recommended Approach for OpenMoko

### For Custom Plugins (moko-logger pattern)
**Use Method 2 (Local File)**

```dockerfile
# In Dockerfile
COPY opencode-plugin/moko-logger.js /root/.config/opencode/plugin/moko-logger.js
```

**Rationale:**
- No external dependencies
- Full control over functionality
- Works in any network environment
- Already proven successful

### For Published Plugins
**Use Method 1 (npm global install) or Method 3 (config.json)**

**Method 1 preferred for:**
- Plugins needed during build time
- Environments with reliable npm access
- Plugins with specific version requirements

**Method 3 preferred for:**
- Development environments
- Plugins that auto-update acceptably
- Simple configuration management

---

## Plugin Directory Structure

```
/root/.config/opencode/
├── plugin/
│   ├── moko-logger.js      # Local plugin
│   └── custom-tool.ts      # TypeScript plugin
├── skills/
│   └── frontend-design/
│       └── SKILL.md        # Agent skill
└── config.json             # OpenCode configuration
```

---

## Plugin Evaluation Criteria

When considering new plugins for OpenMoko:

1. **Container Compatibility**
   - Does it require desktop environment?
   - Does it need GUI libraries?
   - Can it run headless?

2. **Dependencies**
   - Native dependencies (D-Bus, etc.)?
   - Large dependency trees?
   - Security implications?

3. **Overlap with Existing Tools**
   - Does moko-logger already cover this?
   - Is it redundant with other plugins?

4. **Maintenance Status**
   - Is it actively maintained?
   - What version is it? (dev, beta, stable)
   - Community adoption (stars, downloads)

---

## Current Plugins Status

| Plugin | Method | Status | Notes |
|--------|--------|--------|-------|
| moko-logger | Local File | ✅ Active | Custom event logging |
| frontend-design | Local File | ✅ Active | Skill for UI design |

---

## References

- [OpenCode Plugins Documentation](https://opencode.ai/docs/plugins/)
- [skills-tools-spike.md](./skills-tools-spike.md) - Plugin recommendations
- [moko-logger implementation](../../opencode-plugin/moko-logger.js)
