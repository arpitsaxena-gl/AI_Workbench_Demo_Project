# JIRA–Cursor Integration (MCP)

Connect JIRA to Cursor via **MCP** (Model Context Protocol) for Chat, and use the terminal CLI for list/get/transitions.

## One-time setup

1. **API token:** [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens) — create one; do not commit it.
2. **Terminal CLI:** Copy `.env.example` → `.env` and set `JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN`.
3. **Cursor Chat (MCP):** Copy `.cursor/mcp.json.example` → `.cursor/mcp.json` and fill in the same values (or run `npm run jira:connect` to generate it from `.env`). Restart Cursor; enable the JIRA server under **Settings → Tools & MCP**. Docker must be running (MCP server uses `ghcr.io/sooperset/mcp-atlassian`).

## Commands

| Action          | Terminal                               | Chat (MCP)             |
| --------------- | -------------------------------------- | ---------------------- |
| List my tickets | `npm run jira:list`                    | “List my JIRA tickets” |
| Get issue       | `npm run jira -- get PROJ-123`         | “Show ticket PROJ-123” |
| Transitions     | `npm run jira -- transitions PROJ-123` | —                      |
| Help            | `npm run jira -- --help`               | —                      |

## Security

- Do not commit `.env` or `.cursor/mcp.json` (both are in `.gitignore`).
- Use `.env.example` and `.cursor/mcp.json.example` as templates only.

[Cursor MCP docs](https://cursor.com/help/customization/mcp)
