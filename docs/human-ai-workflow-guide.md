# Human + AI Collaborative Backend Development Guide

> A practical walkthrough of building Node.js backend APIs from scratch to GitHub PR — using Cursor AI and the project's built-in AI commands.

---

## The Workflow at a Glance

```
  HUMAN                          AI (Cursor)                     COMMAND
  ─────                          ───────────                     ───────
  Shares ticket/requirement  →   Analyzes codebase overlap   →   /start-ticket
  Approves approach          →   Generates production code   →   /implement-feature
  Reviews & tests            →   Fixes issues found          →   /fix-bug
  Requests test coverage     →   Writes automated tests      →   /write-tests
  Ready to ship              →   Creates PR with description →   /create-pr
  Wants peer review          →   Reviews PR for quality      →   /pr-review
  CI fails                   →   Diagnoses & fixes pipeline  →   /pr-health-check
```

---

## Phase 1: Analyze the Ticket

**Human:** Has a Jira ticket, GitHub issue, or feature idea.

**AI Command:** `/start-ticket`

**What happens:**
- AI scans the entire codebase for existing code that overlaps with the ticket
- Identifies files, routes, and models that will be affected
- Flags potential conflicts or duplicate functionality
- Produces a scoped plan before any code is written

**Example prompt:**
```
/start-ticket

Ticket: Add a "wishlist" feature — users can save products they want to buy later.
API: POST /api/v1/wishlist, GET /api/v1/wishlist, DELETE /api/v1/wishlist/:id
```

**Human's role:** Review the analysis. Approve, adjust scope, or clarify requirements before implementation begins.

---

## Phase 2: Implement the Feature

**Human:** Approves the plan from Phase 1.

**AI Command:** `/implement-feature`

**What happens:**
- AI generates production-ready code following the project's patterns:
  - **Model** — Mongoose schema in `model/`
  - **Router** — Express routes in `routers/`
  - **Middleware** — Auth/validation in `helpers/`
  - **Registration** — Wires the new router into `app.js`
- Follows existing conventions (dotenv config, JWT auth, error handling)
- Uses `console.info`/`console.error` (not `console.log`)
- Prefixes unused params with `_`

**Example prompt:**
```
/implement-feature

Create CRUD APIs for user wishlists:
- POST /api/v1/wishlist — add product to wishlist (auth required)
- GET /api/v1/wishlist — get user's wishlist (auth required)
- DELETE /api/v1/wishlist/:id — remove item (auth required)
```

**Human's role:** Review generated code. Test endpoints manually. Request adjustments.

---

## Phase 3: Test the APIs

### Manual Testing — `.http` files

**Human:** Creates or asks AI to generate a `.http` file for quick manual testing.

```http
### Get wishlist
GET http://localhost:3000/api/v1/wishlist
Authorization: Bearer {{token}}

### Add to wishlist
POST http://localhost:3000/api/v1/wishlist
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productId": "abc123"
}

### Remove from wishlist
DELETE http://localhost:3000/api/v1/wishlist/item456
Authorization: Bearer {{token}}
```

Use the **REST Client** extension in Cursor to send requests directly from the file.

### MCP-Powered Testing

The project has built-in MCP servers for testing without leaving the chat:

**API Tester MCP** — Send HTTP requests through AI:
```
Use api_request to POST to /api/v1/wishlist with body {"productId": "abc123"}
and bearer token eyJhbG...
```

**MongoDB MCP** — Verify data was stored:
```
Use mongo_find on the wishlists collection to check if the product was added
```

**Multi-DB MCP** — Test caching patterns:
```
Use smart_fetch to check Redis cache for wishlist data, falling back to MongoDB
```

### Automated Testing

**AI Command:** `/write-tests`

**What happens:**
- AI detects the test framework (Jest + Supertest for backend, Vitest for frontend)
- Generates test files in `__tests__/`
- Covers happy path, error cases, auth checks, and edge cases

**Example prompt:**
```
/write-tests

Write tests for the wishlist API endpoints.
Cover: auth required, add product, duplicate prevention, list items, delete item.
```

**Human's role:** Run tests (`npm run test:coverage`), review coverage, add edge cases.

---

## Phase 4: Debug Issues

**Human:** Encounters a bug — 400 error, wrong response, crash.

**AI Command:** `/fix-bug`

**What happens:**
- AI locates the root cause by tracing the error through routes, controllers, middleware
- Applies a minimal, safe fix
- Explains what went wrong and why the fix works

**Example prompt:**
```
/fix-bug

Getting 500 error on POST /api/v1/wishlist.
Error: "Cannot read properties of undefined (reading '_id')"
The user object seems to be missing from the request.
```

**Human's role:** Verify the fix. Test again. Confirm the issue is resolved.

---

## Phase 5: Prepare & Create the Pull Request

### Step 1 — Generate PR Description

**AI Command:** `/prepare-pr`

**What happens:**
- AI reads all commits on the current branch
- Generates a structured PR description using the repo's template
- Links to Jira ticket if available
- Lists all files changed with a summary of each

### Step 2 — Create the PR

**AI Command:** `/create-pr`

**What happens:**
- Detects the Git provider (GitHub)
- Pushes the branch if not already pushed
- Opens a PR with the generated description
- Sets appropriate labels and reviewers

**Example prompt:**
```
/create-pr

Target branch: main
Link to ticket: JIRA-1234
```

**Human's role:** Review the PR description. Add reviewers. Merge when approved.

---

## Phase 6: Review & Health Check

### Peer Review

**AI Command:** `/pr-review`

**What happens:**
- Reviews the PR diff for correctness, security, and code standards
- Checks alignment with the original ticket requirements
- Flags potential issues: missing validation, security gaps, performance concerns

### CI/CD Health Check

**AI Command:** `/pr-health-check`

**What happens:**
- Checks CI pipeline status (lint, tests, build, deploy)
- Identifies failing checks and their root cause
- Provides fix plans for each failure
- Reports on code coverage changes

---

## Available MCP Servers

These extend AI capabilities beyond code generation:

| MCP Server | Purpose | Example Use |
|---|---|---|
| **api-tester** | Send HTTP requests to your backend | "Test the login endpoint with these credentials" |
| **mongodb** | Query/modify MongoDB directly | "Show me all users in the database" |
| **multi-db** | MongoDB + Redis + Neo4j tools | "Cache this query result in Redis" |
| **github** | GitHub API access | "List open PRs on this repo" |
| **filesystem** | Read/write files on the system | "List files in C:/projects" |

---

## Quick Reference — AI Commands

| Phase | Command | Who Triggers | What AI Does |
|---|---|---|---|
| Plan | `/start-ticket` | Human shares ticket | Analyzes overlap, produces plan |
| Build | `/implement-feature` | Human approves plan | Generates production code |
| Test | `/write-tests` | Human requests tests | Creates test files |
| Debug | `/fix-bug` | Human reports bug | Finds root cause, applies fix |
| Ship | `/create-pr` | Human says "ready" | Pushes branch, opens PR |
| Ship | `/prepare-pr` | Human wants PR description | Generates structured description |
| Review | `/pr-review` | Human or reviewer | Reviews diff for quality |
| Monitor | `/pr-health-check` | Human or CI fails | Diagnoses pipeline issues |

---

## Best Practices for Human + AI Collaboration

1. **Be specific in prompts** — Include endpoint paths, field names, and expected behavior
2. **Review before approving** — AI generates, human validates
3. **Test incrementally** — Don't implement everything before testing anything
4. **Use `.http` files** — Fastest way to verify endpoints without leaving the editor
5. **Let AI debug** — Paste the exact error message, AI traces it faster than manual searching
6. **Commit often** — Small commits make PR reviews and rollbacks easier
7. **Use MCP for data verification** — Query the database directly through AI to confirm behavior
