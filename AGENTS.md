# AI Workbench Demo Project - AI Agent Instructions

This document provides context and guidelines for AI agents working on this monorepo.

## Project Overview

This is a **Turborepo monorepo** containing a full-stack e-commerce web application:

| App/Package           | Technology                   | Location                      |
| --------------------- | ---------------------------- | ----------------------------- |
| **Frontend**          | React 18, TypeScript, Vite 5 | `apps/frontend/`              |
| **Backend**           | Express.js, MongoDB, JWT     | `apps/backend/`               |
| **UI Library**        | Shared React components      | `packages/ui/`                |
| **ESLint Config**     | Shared ESLint 9 flat configs | `packages/eslint-config/`     |
| **TypeScript Config** | Shared tsconfigs             | `packages/typescript-config/` |

## Monorepo Structure

```
├── apps/
│   ├── frontend/             # React SPA (Vite)
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── auth/context.tsx
│   │   │   ├── services/api.ts
│   │   │   ├── services/authService.ts
│   │   │   ├── theme/context.tsx
│   │   │   └── components/
│   │   ├── App.tsx
│   │   ├── eslint.config.js
│   │   └── vite.config.ts
│   └── backend/              # Express API server
│       ├── app.js            # Entry point
│       ├── env.txt           # Environment variables (local only)
│       ├── routers/
│       │   ├── user.js       # /api/v1/user (login, register, list)
│       │   ├── product.js    # /api/v1/product (CRUD)
│       │   ├── category.js   # /api/v1/category (CRUD)
│       │   └── order.js      # /api/v1/order (CRUD, totals)
│       ├── model/
│       │   ├── user.js       # User schema (userId, passwordHash, isAdmin)
│       │   ├── product.js    # Product schema (name, price, category, stock)
│       │   ├── category.js   # Category schema (name, icon, color)
│       │   ├── order.js      # Order schema (items, shipping, status)
│       │   └── order-item.js # OrderItem schema (quantity, product)
│       ├── helpers/
│       │   ├── jwt.js        # JWT auth middleware (express-jwt)
│       │   └── error-handler.js
│       ├── eslint.config.mjs
│       └── __tests__/
├── packages/
│   ├── eslint-config/        # Shared ESLint flat configs (base, react-internal)
│   ├── typescript-config/    # Shared tsconfig presets
│   └── ui/                   # Shared UI component library
├── .claude/commands/         # AI prompt commands (language-neutral)
├── .cursor/
│   ├── mcp.json              # MCP server config (replace placeholders with your credentials)
│   └── rules/                # Cursor AI rules
├── mcp-server.cjs            # MCP server for API testing
├── turbo.json                # Turborepo task config
└── package.json              # Root workspace config
```

## Commands

```bash
# Root (Turborepo)
npm install              # Install all workspace dependencies
npm run dev              # Start frontend + backend dev servers
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run build            # Build all packages
npm run lint             # Lint all packages via Turbo
npm run check-types      # Type-check all packages

# Frontend (from apps/frontend/)
npm run dev              # Vite dev server
npm run build            # Production build
npm run test             # Unit tests (Vitest)
npm run test:e2e         # E2E tests (Playwright)
npm run lint             # ESLint

# Backend (from apps/backend/)
npm run dev              # Nodemon dev server
npm run start            # Production start
npm run test             # Unit tests (Jest)
npm run test:coverage    # Tests with coverage report
npm run lint             # ESLint
```

---

## Frontend (`apps/frontend/`)

### Tech Stack

- **React 18** with TypeScript
- **Vite 5** — build tool and dev server
- **React Router DOM v6** — client-side routing
- **CSS Modules** — component-scoped styling
- **Vitest** — unit testing
- **Playwright** — E2E testing
- **@testing-library/react** — component testing

### Routing

Routes are defined in `App.tsx`:

- `/` — HomeScreen (dashboard)
- `/login` — LoginScreen
- `/signup` — SignupScreen
- `/profile` — ProfileScreen (protected)

### Key Patterns

**Theming** — Light/dark mode via `ThemeProvider`:

```typescript
import { useTheme } from './theme/context';
const { colors, isDarkMode, toggleTheme } = useTheme();
```

**Styling** — CSS Modules for all component styles:

```typescript
import styles from './MyComponent.module.css';
```

**Authentication** — JWT-based via `AuthProvider`:

- Login stores JWT + session in localStorage
- `ProtectedRoute` guards authenticated pages
- Logout clears localStorage and resets state

**Forms** — Controlled components with validation:

- State per field, error state object, loading state
- Clear error on input change

### Frontend Guidelines

**DO:**

- Use TypeScript with strict typing
- Use CSS Modules for component styles
- Use CSS custom properties for theming
- Use React Router for navigation
- Write tests for new components
- Handle loading and error states
- Make components accessible (labels, ARIA, keyboard nav)

**DON'T:**

- Use `any` types
- Hard-code colors or font sizes
- Leave `console.log` in production code
- Use inline styles for complex styling
- Skip error handling

### Adding a New Page

1. Create `NewPage.tsx` in `src/`
2. Create `NewPage.module.css` for styles
3. Add route in `App.tsx`
4. Create `NewPage.test.tsx` for tests

### Testing (Frontend)

```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/context';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </ThemeProvider>
  );
};
```

---

## Backend (`apps/backend/`)

### Tech Stack

- **Express.js 4** — HTTP framework
- **MongoDB** via Mongoose 7 — database
- **JWT** (jsonwebtoken + express-jwt) — authentication
- **bcryptjs** — password hashing
- **morgan** — request logging
- **dotenv** — environment variables (from `env.txt`)
- **Jest + Supertest** — testing

### API Endpoints

Base path: `/api/v1` (configured via `API_URL` in `env.txt`)

| Route                          | Methods          | Auth   | Description                            |
| ------------------------------ | ---------------- | ------ | -------------------------------------- |
| `/api/v1/user/validateLogin`   | POST             | Public | Login, returns JWT                     |
| `/api/v1/user/register`        | POST             | Public | Register new user                      |
| `/api/v1/user/`                | GET              | Admin  | List all users                         |
| `/api/v1/user/:id`             | GET              | Admin  | Get user by ID                         |
| `/api/v1/user/get/count`       | GET              | Admin  | User count                             |
| `/api/v1/product/`             | GET              | Public | List products (filterable by category) |
| `/api/v1/product/:id`          | GET              | Public | Get product                            |
| `/api/v1/product/`             | POST             | Admin  | Create product                         |
| `/api/v1/product/:id`          | PUT              | Admin  | Update product                         |
| `/api/v1/product/:id`          | DELETE           | Admin  | Delete product                         |
| `/api/v1/category/`            | GET              | Public | List categories                        |
| `/api/v1/category/`            | POST             | Admin  | Create category                        |
| `/api/v1/category/:id`         | PUT, DELETE      | Admin  | Update/delete category                 |
| `/api/v1/order/`               | GET, POST        | Auth   | List/create orders                     |
| `/api/v1/order/:id`            | GET, PUT, DELETE | Auth   | Order by ID                            |
| `/api/v1/order/get/totalSales` | GET              | Auth   | Total sales aggregate                  |

### Data Models

**User** — `userId` (email, unique), `passwordHash`, `name`, `isAdmin`, `Address1/2`, `PinCode`, `phNumber`

**Product** — `name`, `description`, `image`, `brand`, `price`, `category` (ref), `countInStock`, `rating`, `numReviews`, `isFeatured`

**Category** — `name`, `icon`, `color`

**Order** — `orderItems` (ref[]), `shippingAddress1/2`, `city`, `zip`, `country`, `phone`, `status`, `totalPrice`, `user` (ref)

### Auth Flow

1. JWT middleware (`helpers/jwt.js`) protects all routes except login, register, and public GETs
2. `isRevoked` checks `isAdmin` in the JWT payload — non-admin tokens are revoked for admin routes
3. Passwords hashed with bcrypt (salt rounds: 11)
4. JWT expires after 1 day

### Environment Variables (`env.txt`)

```
API_URL = /api/v1
secret = <your-jwt-secret>
connectionString = <your-mongodb-connection-string>
```

### Backend Guidelines

**DO:**

- Use `console.info` / `console.error` for server logs (not `console.log`)
- Prefix unused callback params with `_` (e.g. `_err`, `_req`)
- Return early from error conditions
- Use async/await with try-catch for DB operations

**DON'T:**

- Commit credentials in `env.txt`
- Use `console.log` for debug output
- Leave unused variables or parameters

### Testing (Backend)

Tests use Jest + Supertest in `__tests__/`:

```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/v1/user/validateLogin', () => {
  it('should return token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/user/validateLogin')
      .send({ email: 'test@example.com', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

---

## MCP Servers

Five MCP servers are configured in `.cursor/mcp.json`:

- **github** — GitHub API (PRs, issues, code search)
- **mongodb** — Direct MongoDB access (official MongoDB MCP)
- **api-tester** — Custom API testing (`mcp-server.cjs`), supports runtime `baseUrl` override
- **multi-db** — Multi-database MCP (`multi-db-mcp-server.cjs`) with MongoDB, Redis, and Neo4j
- **filesystem** — File system access via `@modelcontextprotocol/server-filesystem`

### Multi-DB MCP Tools (`multi-db-mcp-server.cjs`)

| Tool | DB | Description |
|---|---|---|
| `mongo_find` | MongoDB | Query documents with filter, sort, limit |
| `mongo_insert` | MongoDB | Insert one or many documents |
| `mongo_update` | MongoDB | Update documents (single or bulk) |
| `mongo_delete` | MongoDB | Delete documents (single or bulk) |
| `mongo_aggregate` | MongoDB | Run aggregation pipelines |
| `mongo_list_collections` | MongoDB | List all collections |
| `redis_get` | Redis | Get value by key |
| `redis_set` | Redis | Set key-value with optional TTL |
| `redis_delete` | Redis | Delete keys |
| `redis_keys` | Redis | List keys by pattern |
| `redis_hash_get` | Redis | Get hash fields |
| `redis_hash_set` | Redis | Set hash fields |
| `neo4j_query` | Neo4j | Run read-only Cypher queries |
| `neo4j_write` | Neo4j | Run write Cypher queries (CREATE, MERGE, etc.) |
| `neo4j_schema` | Neo4j | Get labels, relationship types, property keys |
| `smart_fetch` | Redis+MongoDB | Cache-first pattern: check Redis, fallback to MongoDB, cache result |

**Environment variables** (set in `.cursor/mcp.json` `env` block):

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGO_DB` | `mydb` | Database name |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j Bolt URI |
| `NEO4J_USER` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | `password` | Neo4j password |

Replace `<your-...>` placeholders in `.cursor/mcp.json` with your credentials.

## AI Prompt Commands

All commands in `.claude/commands/` are **language and framework neutral**:

- `/implement-feature` — Implement a feature from a ticket
- `/fix-bug` — Debug and fix issues
- `/write-tests` — Generate or improve tests
- `/create-pr` — Create a pull request
- `/prepare-pr` — Generate PR description
- `/pr-review` — Review a PR
- `/pr-health-check` — CI/CD health check report
- `/start-ticket` — Analyze a ticket against existing code
