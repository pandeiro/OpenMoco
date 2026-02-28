# OpenMoko Product Definition

## Initial Concept

OpenMoko is a self-hosted, mobile-first development environment that lets you go from idea → agent → production entirely from your phone. It bundles OpenCode with a custom multi-service architecture for repository management, voice entry, and CI/CD awareness.

## Target Users

**Primary:** Solo developers who want to code on-the-go from their phones. These are developers who value mobility and flexibility, enabling them to maintain productivity without being tethered to a traditional workstation.

## Core Goals

1. **Voice-First Interaction:** Enable developers to interact with AI coding agents using natural voice commands, eliminating the need for typing on mobile devices.

2. **Full Development Workflows:** Provide complete development capabilities from mobile devices, from idea conception through to production deployment.

3. **CI/CD Awareness:** Keep developers informed of build statuses and failures through real-time push notifications.

## Key Features

### Voice and Audio Communications
- AI-powered voice prompt reformulation that transforms spoken ideas into precise agent instructions
- Voice and audio push/pull communications throughout the entire development implementation cycle
- Natural language interaction for all development tasks

### Repository Management
- Automatic repository cloning and management directly from GitHub
- Seamless integration with existing Git workflows
- Support for both public and private repositories

### Failure Recovery
- Real-time CI/CD failure notifications
- One-tap access to view failing logs
- Quick fix submission back to the agent without manual intervention

## Platform Strategy

**Mobile-First PWA (Primary):** The Progressive Web App is designed primarily for mobile use, providing a native-like experience through the browser with offline capabilities and home screen installation.

**Desktop (Secondary):** Full desktop access is available for when developers have access to a workstation, providing a consistent experience across devices.

## Deployment Model

**Self-Hosted on Personal VPS:** OpenMoko is designed to be self-hosted, giving developers full control over their development environment, data, and credentials. This approach prioritizes:
- Privacy and data ownership
- Full customization capability
- No dependency on external SaaS providers
- Direct control over infrastructure and scaling
