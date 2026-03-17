# MyProject

A modern React 19 web application with TypeScript, Vite, and React Router.

## Features

- React 19 with TypeScript
- Vite for fast development and builds
- React Router DOM v7 for client-side routing
- CSS Modules for component-scoped styling
- Dark/Light mode support
- Responsive design
- Vitest for testing

## Prerequisites

- Node.js 20 or higher
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Vitest |

## Project Structure

```
MyProject/
├── public/              # Static assets
├── src/
│   ├── main.tsx         # App entry point
│   ├── index.css        # Global styles
│   ├── theme/
│   │   └── context.tsx  # Theme provider
│   ├── HomeScreen.tsx   # Home/Dashboard page
│   ├── LoginScreen.tsx  # Login page
│   ├── SignupScreen.tsx # Signup page
│   └── *.module.css     # Component styles
├── App.tsx              # Root component with routes
├── index.html           # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Routes

| Path | Page |
|------|------|
| `/` | Home Dashboard |
| `/login` | Login |
| `/signup` | Sign Up |

## Theming

The app supports automatic dark/light mode based on system preferences. Theme can also be toggled programmatically using the `useTheme` hook:

```typescript
import { useTheme } from './theme/context';

function MyComponent() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router DOM](https://reactrouter.com/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

## License

MIT
