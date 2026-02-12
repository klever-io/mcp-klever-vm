# Privacy Policy

**Klever MCP Server**
**Effective Date:** February 2026
**Last Updated:** February 2026

## Overview

This Privacy Policy describes how the Klever MCP Server ("Service"), operated by Klever (<https://klever.org>), handles information when you use our Model Context Protocol (MCP) server.

## What the Service Does

The Klever MCP Server is a developer tool that provides contextual knowledge for Klever blockchain smart contract development. It serves a pre-loaded, read-only knowledge base containing code patterns, best practices, deployment scripts, and documentation.

## Data We Collect

### Public Hosted Server (mcp.klever.org)

The public hosted server at `mcp.klever.org` operates in **read-only mode**. We collect:

- **Server access logs:** IP addresses, timestamps, and request metadata for operational and security purposes (e.g., rate limiting, abuse prevention). These logs are retained for up to 30 days.
- **No user content is stored:** Queries sent to the server are processed in real-time and are not logged, stored, or used for any purpose beyond returning the response.
- **No authentication data:** The public server does not require authentication and does not collect credentials, tokens, or account information.
- **No cookies or tracking:** The server does not use cookies, browser fingerprinting, analytics tools, or any form of user tracking.

### Self-Hosted Deployments

When you run the Klever MCP Server locally or on your own infrastructure:

- **No telemetry is sent to Klever.** The core server does not automatically send usage analytics, logs, or any other data to Klever.
- **You control all data.** Any context you add via the API is stored only in your chosen backend (in-memory or Redis).
- **No automatic "phone home" behavior.** The server does not automatically contact Klever or any third-party service during normal operation.
- **Optional tools may perform outbound downloads.** If you invoke helper commands (e.g., SDK installation tools), they may download resources from external hosts, which will receive standard network metadata (IP address, timestamps) as part of handling those requests.

### npm Package (npx @klever/mcp-server)

When installed via npm and run locally in MCP stdio mode:

- The server runs entirely on your machine.
- The core server does not send telemetry, analytics, or usage data to Klever or any external service.
- All knowledge base queries are processed locally.
- Optional tools you invoke (e.g., SDK installers) may contact external hosts to fetch resources.

## How We Use Information

Server access logs from the public hosted server are used solely for:

- Ensuring service availability and performance
- Rate limiting and abuse prevention
- Security monitoring and incident response

We do **not** use any collected information for:

- Advertising or marketing
- User profiling or behavioral analysis
- Training machine learning models
- Selling or sharing with third parties

## Data Sharing

We do not sell, rent, or share any information with third parties, except:

- When required by law or legal process
- To protect the security and integrity of the Service

## Data Retention

- **Server access logs:** Retained for up to 30 days, then automatically deleted.
- **Self-hosted data:** Controlled entirely by you. In-memory storage is cleared when the server stops. Redis storage persists until you delete it.

## Security

We implement reasonable security measures to protect the Service, including:

- TLS encryption for all connections to the public server
- Rate limiting to prevent abuse
- Read-only mode for the public server (no write operations)
- Regular security updates and dependency management

## Your Rights

Depending on your jurisdiction, you may have rights regarding your personal data, including the right to access, correct, or delete it. Since we collect minimal data (only server access logs for the public server), you can contact us to exercise these rights.

## Children's Privacy

The Service is a developer tool not directed at children under 13. We do not knowingly collect information from children.

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected in the "Last Updated" date above and published in this repository.

## Contact

For questions about this Privacy Policy, contact:

- **GitHub Issues:** <https://github.com/klever-io/mcp-klever-vm/issues>
- **Website:** <https://klever.org>

## Open Source

This project is open source under the MIT License. You can review the complete source code at <https://github.com/klever-io/mcp-klever-vm>.
