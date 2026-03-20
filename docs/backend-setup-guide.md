# Node.js Backend Setup Guide for Cursor AI

> Step-by-step guide to set up a Node.js backend project from scratch — showing how Cursor AI supports each step, where human input is required, and the efficiency gain of Human + AI vs Human alone.

---

## How to Read This Guide

Each step is marked with who does what:

| Icon | Meaning |
|---|---|
| **Human** | Requires manual action — AI cannot do this for you |
| **AI** | Cursor AI handles this autonomously |
| **AI + Human** | AI generates/executes, human reviews and approves |

---

## 1. Install Prerequisites

> **Human** — Manual setup required. AI cannot install software on your machine.

Install the required tools on your machine before starting.

### Node.js

- Download and install **Node.js LTS** from [nodejs.org](https://nodejs.org/)
- Verify installation:

```bash
node --version
npm --version
```

### MongoDB

- **Option A (Cloud):** Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Option B (Local):** Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- You will need the connection string later

### Cursor IDE

- Download from [cursor.com](https://www.cursor.com/)
- Cursor is a fork of VS Code with built-in AI capabilities

**Cursor AI support:** None — these are one-time system-level installations.

| Approach | Estimated Time |
|---|---|
| Human alone | ~20 min |
| Human + AI | ~20 min (no difference — manual installation) |

---

## 2. Initialize the Backend Project

> **AI + Human** — AI can run terminal commands and suggest packages. Human decides project name and confirms.

Open a terminal in Cursor and create your project.

```bash
mkdir my-backend
cd my-backend
npm init -y
```

### Install Dependencies

**Core packages:**

```bash
npm install express mongoose dotenv cors morgan bcryptjs jsonwebtoken express-jwt response-time
```

| Package | Purpose |
|---|---|
| `express` | Web framework for building APIs |
| `mongoose` | MongoDB object modeling (schemas, queries) |
| `dotenv` | Load environment variables from a file |
| `cors` | Enable Cross-Origin Resource Sharing |
| `morgan` | HTTP request logger |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | Create and verify JWT tokens |
| `express-jwt` | Middleware to protect routes with JWT |
| `response-time` | Track API response times in headers |

**Dev tools:**

```bash
npm install --save-dev nodemon eslint jest supertest
```

| Package | Purpose |
|---|---|
| `nodemon` | Auto-restart server on file changes |
| `eslint` | Code linting and quality checks |
| `jest` | Testing framework |
| `supertest` | HTTP assertions for API testing |

### Add Scripts to `package.json`

Open `package.json` and add these scripts:

```json
{
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js",
    "lint": "eslint .",
    "test": "jest --passWithNoTests",
    "test:coverage": "jest --coverage --passWithNoTests"
  }
}
```

| Script | Purpose |
|---|---|
| `dev` | Start server with auto-reload on file changes |
| `start` | Start server for production |
| `lint` | Check code quality |
| `test` | Run unit tests |
| `test:coverage` | Run tests with code coverage report |

**Cursor AI support:** Ask AI _"Initialize a Node.js backend project with Express and MongoDB"_ — AI runs `npm init`, installs packages, and configures `package.json` scripts automatically.

| Approach | Estimated Time |
|---|---|
| Human alone | ~15 min (research packages, type commands, configure scripts) |
| Human + AI | ~2 min (one prompt, AI handles everything, human confirms) |

---

## 3. Project Structure

> **AI + Human** — AI scaffolds the folder structure. Human decides which resources/entities the project needs.

Organize your backend following the MVC pattern.

```
my-backend/
├── app.js              # Entry point — server setup, middleware, routes
├── env.txt             # Environment variables (local only, never commit secrets)
├── package.json
│
├── model/              # Mongoose schemas (data structure)
│   ├── user.js
│   ├── product.js
│   └── ...
│
├── routers/            # Express route handlers (API endpoints)
│   ├── user.js
│   ├── product.js
│   └── ...
│
├── helpers/            # Middleware and utilities
│   ├── jwt.js          # JWT authentication middleware
│   └── error-handler.js
│
└── __tests__/          # Jest test files
    └── ...
```

| Folder | Responsibility |
|---|---|
| `model/` | Define data schemas — what fields exist, types, validation |
| `routers/` | Handle HTTP requests — GET, POST, PUT, DELETE endpoints |
| `helpers/` | Cross-cutting concerns — auth, error handling, utilities |
| `__tests__/` | Automated test files |

**Cursor AI support:** Ask AI _"Create the project folder structure with model, routers, and helpers directories"_ — AI creates all folders and empty starter files in seconds.

| Approach | Estimated Time |
|---|---|
| Human alone | ~10 min (create folders, decide structure, create files) |
| Human + AI | ~1 min (one prompt, AI scaffolds everything) |

---

## 4. Set Up Environment Variables

> **Human** — You must provide your own credentials. AI cannot know your database passwords or secrets.

Create an `env.txt` file (or `.env`) in your project root.

```
API_URL = /api/v1
secret = <your-jwt-secret>
connectionString = <your-mongodb-connection-string>
PORT = 3000
```

| Variable | Purpose |
|---|---|
| `API_URL` | Base path prefix for all routes |
| `secret` | Secret key for signing JWT tokens |
| `connectionString` | MongoDB connection URI |
| `PORT` | Server port (defaults to 3000) |

> **Security:** Never commit real credentials. Add `env.txt` to `.gitignore`.

**Cursor AI support:** AI can create the env file template with placeholder values and add it to `.gitignore`. But the actual credentials must come from you.

| Approach | Estimated Time |
|---|---|
| Human alone | ~5 min (create file, look up connection string, configure) |
| Human + AI | ~3 min (AI creates template, human fills in credentials) |

---

## 5. Build the Backend — Layer by Layer

> **AI + Human** — This is where AI delivers the biggest efficiency gain. AI generates all four layers. Human reviews and adjusts.

The backend has four layers. Build them in this order:

### Layer 1: Entry Point (`app.js`)

This is where everything connects — environment config, middleware stack, route registration, and database connection.

**Middleware execution order:**

```
Request → responseTime → cors → JSON parser → logger → JWT auth → error handler → route handler
```

**Cursor AI support:** Ask AI _"Create the app.js entry point with middleware stack and database connection"_ — AI generates the complete file with proper middleware ordering.

### Layer 2: Models (`model/`)

Each model defines a Mongoose schema — the shape of data in MongoDB.

- Define field names, types, defaults, and validation rules
- Export the model so routers can use it

**Cursor AI support:** Describe your data in plain English — _"Create a user model with name, email, password hash, and admin flag"_ — AI generates the full Mongoose schema.

### Layer 3: Routes (`routers/`)

Each router handles CRUD operations for one resource.

- **GET** — retrieve data
- **POST** — create new records
- **PUT** — update existing records
- **DELETE** — remove records

Routes are registered in `app.js` under the API prefix (e.g. `/api/v1/user`).

**Cursor AI support:** Ask AI _"Create CRUD routes for users with login and registration"_ — AI generates the complete router with error handling, validation, and password hashing.

### Layer 4: Middleware (`helpers/`)

- **JWT middleware** — protects routes, allows public routes to bypass auth
- **Error handler** — catches errors globally and returns consistent error responses

**Cursor AI support:** Ask AI _"Add JWT authentication middleware with public route exceptions"_ — AI generates the auth middleware and error handler, and wires them into `app.js`.

### Efficiency Comparison — Building All 4 Layers

| Approach | Estimated Time | Notes |
|---|---|---|
| Human alone | ~4–6 hours | Write every file manually, debug syntax errors, configure middleware order, handle edge cases |
| Human + AI | ~30–45 min | AI generates all layers from prompts, human reviews and adjusts logic |
| **Time saved** | **~80%** | AI handles boilerplate; human focuses on business logic decisions |

---

## 6. Run the Server

> **Human** — Start the server and verify it connects to the database.

Start the backend in development mode:

```bash
npm run dev
```

You should see:

```
Server is running on port 3000
Database connected successfully
```

The server is now live at `http://localhost:3000`.

- **nodemon** watches for file changes and auto-restarts
- Type `rs` + Enter in the terminal to force a manual restart

**Cursor AI support:** If the server fails to start, paste the error into the AI chat — it will diagnose and fix the issue immediately.

| Approach | Estimated Time |
|---|---|
| Human alone | ~5 min (start, verify, troubleshoot if needed) |
| Human + AI | ~2 min (AI fixes startup errors instantly) |

---

## 7. Develop with AI Commands

> **AI + Human** — AI executes, human guides and reviews. This is the core collaboration loop.

Use the built-in AI commands in `.claude/commands/` to accelerate development:

### Analyze a ticket before coding

```
/start-ticket

<paste your ticket or requirement here>
```

AI scans the codebase for overlap, identifies affected files, and produces a scoped plan.

**Human's role:** Review the plan. Approve, adjust, or clarify before implementation.

| Approach | Estimated Time |
|---|---|
| Human alone | ~30–60 min (read codebase, trace dependencies, identify conflicts) |
| Human + AI | ~5 min (AI scans entire codebase in seconds, human reviews summary) |

### Implement the feature

```
/implement-feature

<describe what to build — endpoints, fields, business logic>
```

AI generates production-ready code — models, routes, middleware — following existing project patterns.

**Human's role:** Review generated code. Request adjustments if needed.

| Approach | Estimated Time |
|---|---|
| Human alone | ~2–4 hours per feature (model + routes + middleware + wiring) |
| Human + AI | ~15–30 min (AI generates, human reviews and tweaks) |

### Fix bugs

```
/fix-bug

<paste the error message and describe what you expected>
```

AI traces the root cause and applies a minimal, safe fix.

**Human's role:** Verify the fix works.

| Approach | Estimated Time |
|---|---|
| Human alone | ~30 min – 2 hours (trace error, read stack trace, search codebase) |
| Human + AI | ~5–10 min (AI pinpoints root cause from error message) |

### Write tests

```
/write-tests

<describe what to test — endpoints, scenarios, edge cases>
```

AI generates test files using the project's test framework.

**Human's role:** Run tests and review coverage.

| Approach | Estimated Time |
|---|---|
| Human alone | ~1–2 hours per endpoint (write test setup, assertions, edge cases) |
| Human + AI | ~10–15 min (AI generates comprehensive tests, human runs and validates) |

---

## 8. Create a Pull Request

> **AI + Human** — AI handles PR creation and description. Human triggers and approves.

When the feature is complete and tested:

### Generate PR description

```
/prepare-pr
```

AI reads all commits on the branch and generates a structured PR description.

**Human's role:** Review the description for accuracy.

### Open the PR

```
/create-pr

Target branch: main
```

AI automatically handles:

- **Branch validation** — warns if branch name doesn't follow conventions (e.g. `feature/`, `bugfix/`, `hotfix/`)
- **Labels** — auto-detects and applies labels based on branch prefix, PR title, and changed files (e.g. `feature`, `backend`, `dependencies`)
- **Reviewers** — auto-assigns reviewers from `CODEOWNERS` file or recent contributors to the changed files
- **Logging** — produces a structured creation log with timestamp, branch, labels, reviewers, and PR URL

AI pushes the branch and opens a PR on GitHub with all metadata attached.

**Human's role:** Verify labels and reviewers are correct. Merge when approved.

### Health check after CI runs

```
/pr-health-check
```

AI checks CI status, identifies failures, and suggests fixes.

**Human's role:** Review fixes if CI fails.

### Peer review

```
/pr-review
```

AI reviews the PR diff for correctness, security, and code standards.

**Human's role:** Final approval before merge.

| Approach | Estimated Time |
|---|---|
| Human alone | ~30–45 min (write PR description, check CI, review diff manually) |
| Human + AI | ~5–10 min (AI generates description, reviews diff, diagnoses CI) |

---

## 9. Complete Workflow Summary

```
Step  Action                  Who             Cursor AI Support
────  ──────                  ───             ─────────────────
 1    Install Node.js         Human           None (system install)
 2    Initialize project      AI + Human      AI runs commands, human confirms
 3    Create folder structure  AI + Human      AI scaffolds, human decides entities
 4    Set up env variables    Human           AI creates template, human fills secrets
 5    Build app.js            AI + Human      AI generates, human reviews middleware order
 6    Build models            AI + Human      AI generates schemas from description
 7    Build routes            AI + Human      AI generates CRUD, human reviews logic
 8    Build middleware         AI + Human      AI generates JWT + error handler
 9    Start server            Human           AI fixes errors if startup fails
10    Analyze ticket          AI + Human      /start-ticket — AI scans, human approves plan
11    Implement feature       AI + Human      /implement-feature — AI codes, human reviews
12    Debug issues            AI + Human      /fix-bug — AI traces root cause
13    Write tests             AI + Human      /write-tests — AI generates, human runs
14    Run test coverage       Human           AI fixes failing tests if needed
15    Prepare PR              AI              /prepare-pr — AI generates PR description
16    Create PR               AI              /create-pr — AI pushes and opens PR
17    Review PR               AI + Human      /pr-review — AI reviews, human approves
18    Check CI health         AI              /pr-health-check — AI diagnoses failures
19    Merge                   Human           Human clicks merge on GitHub
```

---

## 10. Overall Efficiency Comparison

### Full Project Setup (Steps 1–8: From zero to running server)

| Approach | Estimated Time | Effort |
|---|---|---|
| Human alone | ~6–8 hours | Write every file, debug syntax, configure middleware, handle edge cases |
| Human + AI | ~1–1.5 hours | AI generates code from prompts, human reviews and fills credentials |
| **Time saved** | **~80%** | |

### Feature Development Cycle (Steps 10–18: Ticket to merged PR)

| Approach | Estimated Time | Effort |
|---|---|---|
| Human alone | ~5–8 hours | Analyze requirements, write code, write tests, debug, create PR, review |
| Human + AI | ~1–2 hours | AI handles analysis, code generation, testing, PR creation |
| **Time saved** | **~75%** | |

### Where AI Adds the Most Value

| Task | AI Efficiency Gain | Why |
|---|---|---|
| Code generation (models, routes) | **~85%** | AI follows patterns instantly, no boilerplate typing |
| Bug fixing | **~80%** | AI traces errors across files faster than manual searching |
| Test writing | **~80%** | AI generates comprehensive test suites from a single prompt |
| Codebase analysis | **~90%** | AI scans entire codebase in seconds vs. human reading files one by one |
| PR description writing | **~90%** | AI reads all commits and summarizes automatically |
| CI/CD debugging | **~70%** | AI reads logs and identifies root cause quickly |

### Where Human Input Is Essential

| Task | Why AI Can't Do This Alone |
|---|---|
| Installing prerequisites | System-level software installation requires manual action |
| Providing credentials | Passwords, API keys, connection strings are human-owned secrets |
| Business logic decisions | AI proposes, but human decides what the product should do |
| Final code review | Human validates correctness, edge cases, and business intent |
| Merge approval | Human makes the final ship/no-ship decision |

---

## 11. Best Practices

| Area | Practice |
|---|---|
| **Architecture** | Follow MVC pattern — models, routes (controllers), helpers (middleware) |
| **Security** | Never commit secrets. Use `env.txt` / `.env` + `.gitignore` |
| **Passwords** | Always hash passwords before storing |
| **Auth** | Use JWT with expiry. Define public vs protected routes |
| **Errors** | Global error handler middleware. Return consistent error format |
| **Logging** | Use `console.info` / `console.error` (not `console.log`) |
| **Linting** | Run `npm run lint` before committing |
| **AI workflow** | Be specific in prompts — include endpoint paths, field names, expected behavior |
| **Commits** | Small, focused commits. Let AI generate PR descriptions |
