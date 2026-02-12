# Terms of Service

**Klever MCP Server**
**Effective Date:** February 2025
**Last Updated:** February 2025

## 1. Acceptance of Terms

By accessing or using the Klever MCP Server ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.

## 2. Description of Service

The Klever MCP Server is an open-source developer tool that provides a knowledge base for Klever blockchain smart contract development via the Model Context Protocol (MCP). The Service is available as:

- A **public hosted server** at `mcp.klever.org`
- An **npm package** (`@klever/mcp-server`) for local use
- **Source code** for self-hosted deployments

## 3. Use of the Service

### 3.1 Permitted Use

You may use the Service for:

- Klever blockchain smart contract development
- Querying the knowledge base for patterns, best practices, and documentation
- Integrating with MCP-compatible clients (Claude, VS Code, Cursor, etc.)
- Self-hosting for personal or commercial development purposes

### 3.2 Prohibited Use

You may not:

- Use the Service to conduct denial-of-service attacks or otherwise disrupt the Service
- Attempt to circumvent rate limits or security measures
- Use the Service for any unlawful purpose
- Redistribute the knowledge base content as a competing service
- Misrepresent the Service or your affiliation with Klever

## 4. Public Hosted Server

### 4.1 Availability

The public server at `mcp.klever.org` is provided on an "as is" and "as available" basis. We strive for high availability but do not guarantee uninterrupted access.

### 4.2 Rate Limiting

The public server enforces rate limits to ensure fair usage. Default limits are:

- MCP endpoint: 60 requests per minute per IP
- API endpoint: 30 requests per minute per IP

Exceeding these limits may result in temporary throttling.

### 4.3 Read-Only Access

The public server operates in read-only mode. Write operations (adding custom context) are not available on the public server.

## 5. Self-Hosted Deployments

When self-hosting the Klever MCP Server:

- You are responsible for your own infrastructure, security, and compliance
- The MIT License governs your use of the source code
- Klever provides no support or warranties for self-hosted deployments

## 6. npm Package

The `@klever/mcp-server` npm package is distributed under the MIT License. When running locally:

- You are responsible for your own environment and data
- The package operates entirely on your machine
- No data is transmitted to Klever

## 7. Intellectual Property

### 7.1 Open Source License

The Klever MCP Server source code is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

### 7.2 Knowledge Base Content

The knowledge base content (patterns, examples, documentation) is provided as part of the open-source project and is included under the same MIT License.

### 7.3 Klever Trademarks

"Klever", the Klever logo, and related marks are trademarks of Klever. Use of these marks must comply with Klever's trademark guidelines.

## 8. Disclaimer of Warranties

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

The knowledge base content is provided for informational and development assistance purposes. It does not constitute professional advice. You are responsible for reviewing, testing, and validating any code or patterns before use in production.

## 9. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, KLEVER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL.

## 10. Indemnification

You agree to indemnify and hold harmless Klever and its affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.

## 11. Modifications

We reserve the right to modify these Terms at any time. Changes will be reflected in the "Last Updated" date above and published in this repository. Continued use of the Service after changes constitutes acceptance of the modified Terms.

## 12. Termination

We reserve the right to suspend or terminate access to the public hosted server for any user who violates these Terms or engages in abusive behavior.

## 13. Governing Law

These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles.

## 14. Contact

For questions about these Terms, contact:

- **GitHub Issues:** <https://github.com/klever-io/mcp-klever-vm/issues>
- **Website:** <https://klever.org>
