# Frontend-Backend Integration Guide

## Overview

Your monorepo now has:

- **Frontend**: Vite + React at `apps/frontend/` running on port **3000**
- **Backend**: Express.js at `apps/backend/` on a configurable port (default **5000**)

## Step 1: Configure Backend Port & CORS

Edit `apps/backend/app.js` to ensure:

1. **Port is set** (usually in `app.js` or `.env`):

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

2. **CORS is enabled** (should be in `app.js`):

```javascript
const cors = require('cors');
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://yourdomain.com'
        : 'http://localhost:3000',
  }),
);
```

## Step 2: Set Environment Variables

### Frontend: Create `apps/frontend/.env.local`

```env
VITE_API_URL=http://localhost:5000
```

### Backend: Create `apps/backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eshop
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

## Step 3: Update Frontend API Calls

### Example: Fetch data from backend

In `apps/frontend/src/auth/context.tsx` or any API file:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Login failed');
  return response.json();
}

export async function signupUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Signup failed');
  return response.json();
}
```

## Step 4: Run Both Apps Together

From the monorepo root:

```bash
npm run dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000 (or your configured port)
- All other workspaces (docs, web)

**In the Turbo UI**, you'll see:

```
frontend#dev  ✓ Ready in 1710ms
eshop#dev     ✓ Running on port 5000
```

## Step 5: Test the Connection

### From Frontend

Open browser DevTools (F12) → Network tab, then try to login/signup.
You should see requests going to `http://localhost:5000/api/...`

### From Backend

Check the backend logs for incoming requests:

```
POST /api/auth/login 200 5ms
```

## Common Issues & Solutions

### CORS Error: "Access to XMLHttpRequest blocked"

**Problem**: Frontend can't reach backend.
**Solutions**:

1. Check backend CORS is enabled
2. Verify backend port in `.env`
3. Update `VITE_API_URL` in frontend `.env.local`
4. Ensure backend is actually running

### Backend can't connect to MongoDB

```
MongoError: connect ECONNREFUSED
```

**Solution**:

- Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`
- MongoDB shell: `mongod`

### JWT token errors on protected routes

**Problem**: Auth failing despite valid login.
**Solution**:

- Check JWT_SECRET matches between frontend & backend
- Verify token is being sent in request headers:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Port 3000 or 5000 already in use

**Solution**:

- Frontend: Edit `apps/frontend/vite.config.ts`:

```typescript
server: {
  port: 3001;
}
```

- Backend: Edit `apps/backend/.env`:

```env
PORT=5001
```

## File Structure for Reference

```
my-monorepo/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── auth/context.tsx    ← Update API calls here
│   │   │   ├── LoginScreen.tsx
│   │   │   └── HomeScreen.tsx
│   │   ├── .env.local              ← Create this
│   │   └── vite.config.ts
│   │
│   └── backend/
│       ├── app.js                  ← Main server
│       ├── routers/                ← API routes
│       ├── apis/                   ← Controllers
│       ├── .env                    ← Create this
│       └── package.json
│
└── package.json
```

## Next Steps

1. **Configure `.env` files** (both frontend and backend)
2. **Run `npm run dev`** from repo root
3. **Test login flow** in browser
4. **Check Network tab** to confirm API calls working
5. **Check terminal logs** for any errors

Good luck! 🚀
