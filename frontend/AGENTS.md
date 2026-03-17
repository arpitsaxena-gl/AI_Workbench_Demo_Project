# MyProject - AI Agent Instructions

This document provides context and guidelines for AI agents working on this codebase.

## Project Overview

MyProject is a **React 19 web application** built with:

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM v7** - Client-side routing
- **CSS Modules** - Component-scoped styling
- **Vitest** - Testing framework
- **@testing-library/react** - Component testing utilities

## Project Structure

```
MyProject/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── index.css             # Global styles and CSS variables
│   ├── theme/
│   │   └── context.tsx       # Theme provider with dark mode support
│   ├── HomeScreen.tsx        # Dashboard/home page
│   ├── HomeScreen.module.css
│   ├── LoginScreen.tsx       # Login page
│   ├── LoginScreen.module.css
│   ├── LoginScreen.test.tsx  # Login tests
│   ├── SignupScreen.tsx      # Signup page
│   ├── SignupScreen.module.css
│   ├── setupTests.ts         # Test configuration
│   └── vite-env.d.ts         # Vite type declarations
├── App.tsx                   # Root component with routing
├── index.html                # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── .cursor/rules/            # Cursor AI rules
```

## Key Patterns

### Routing

Routes are defined in `App.tsx` using React Router:
- `/` - HomeScreen (dashboard)
- `/login` - LoginScreen
- `/signup` - SignupScreen

### Theming

The app supports light/dark mode via `ThemeProvider`:
```typescript
import { useTheme } from './theme/context';

function MyComponent() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  return <div style={{ backgroundColor: colors.background }}>...</div>;
}
```

### Styling

Use CSS Modules for component styles:
```typescript
import styles from './MyComponent.module.css';

function MyComponent() {
  return <div className={styles.container}>...</div>;
}
```

### Form Handling

Forms use controlled components with validation:
- State for each field
- Error state object for validation messages
- Loading state for async submission
- Clear error on input change

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
npm test         # Run tests
npm run lint     # Lint code
```

## Development Guidelines

### DO

- Use TypeScript with strict typing
- Use CSS Modules for component styles
- Use CSS custom properties for theming
- Use React Router for navigation
- Write tests for new components
- Handle loading and error states
- Make components accessible (labels, ARIA, keyboard nav)
- Keep components focused (single responsibility)

### DON'T

- Use `any` types
- Hard-code colors or font sizes
- Leave console.log in production code
- Use inline styles for complex styling (use CSS Modules)
- Skip error handling
- Create components without considering accessibility

## Testing

Tests use Vitest and Testing Library:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
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

## Common Tasks

### Adding a New Page

1. Create `NewPage.tsx` in `src/`
2. Create `NewPage.module.css` for styles
3. Add route in `App.tsx`
4. Create `NewPage.test.tsx` for tests

### Adding a New Component

1. Create component file with proper typing
2. Use CSS Modules for styling
3. Use theme context for colors
4. Add aria-labels for accessibility
5. Write tests

### Modifying Theme

Edit `src/theme/context.tsx` to modify theme colors:
- `lightColors` - Light mode colors
- `darkColors` - Dark mode colors

## AI Agent Rules

See `.cursor/rules/` for detailed guidelines:
- `react-patterns.mdc` - React component patterns
- `styling.mdc` - Styling guidelines
- `typescript-patterns.mdc` - TypeScript conventions
- `data-fetching.mdc` - API and data fetching
- `code-review.mdc` - Code quality checklist
- `critical-rules.mdc` - Must-follow rules
- `start-ticket.mdc` - Starting new work
- `review-branch.mdc` - Code review process
- `writing-tests.mdc` - Testing guidelines
