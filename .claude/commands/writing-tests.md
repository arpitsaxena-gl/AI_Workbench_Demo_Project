# Writing Tests in This Codebase

Quick reference to write unit and component tests easily. For full patterns and anti-patterns, see **`.claude/skills/react-testing/SKILL.md`**.

---

## 1. Where tests live

- **Co-located:** Put the test next to the file under test.
  - `app/components/foo/Bar.tsx` → `app/components/foo/Bar.test.tsx`
  - `app/hooks/foo/useBaz.ts` → `app/hooks/foo/useBaz.test.ts`
  - `app/utils/foo.ts` → `app/utils/foo.test.ts`
- **Run:** `npm run test` (all) or `npm run test -- Bar.test.tsx` (single file).

---

## 2. Quick checklist before you write

**Do:**
- Test **visible behavior** (loading, error, empty, success, user actions).
- Use **factories** from `@test/utils/factories` for API/mock data (no `as Type`).
- Use **TanStack helpers** from `@test/utils/tanStackUtils` for query/mutation mocks.
- Use **ES imports** and **`jest.mocked(importedThing)`** for type-safe mocks.
- Wrap UI with **real `ThemeProvider`** (do not mock theme).
- Use **`screen.getBy*` / `screen.queryBy*`** for assertions; avoid redundant `expect(getBy...).toBeDefined()`.

**Avoid:**
- **Smoke tests** that only assert the component renders.
- **Mocking child components** (mock hooks or native-only libs instead).
- **`require()`** or **`as Type`** in mock data.
- Asserting **hook call args** or **implementation details** (assert UI outcome instead).
- **Conditional logic** inside tests (`if (element) { ... }`); make setup deterministic.

---

## 3. Component test — minimal setup

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/context';
import { MyComponent } from './MyComponent';

jest.mock('@/i18n/translate', () => ({
  translate: (key: string) => key,
}));

const renderComponent = (props: React.ComponentProps<typeof MyComponent>) =>
  render(
    <ThemeProvider>
      <MyComponent {...props} />
    </ThemeProvider>,
  );

describe('MyComponent', () => {
  beforeEach(() => {pl
    jest.clearAllMocks();
  });

  it('renders main content when data is provided', () => {
    renderComponent({ title: 'Hello' });
    screen.getByText('Hello');
  });

  it('does not show optional section when flag is false', () => {
    renderComponent({ title: 'Hi', showOptional: false });
    expect(screen.queryByText('Optional')).not.toBeOnTheScreen();
  });
});
```

---

## 4. Component test — with TanStack Query hooks mocked

```tsx
import { useMyData } from '@/hooks/foo/useMyData';
import { createMockSuccess, createMockPending, createMockError } from '@test/utils/tanStackUtils';
import { createMyEntity } from '@test/utils/factories';

jest.mock('@/hooks/foo/useMyData');

const mockUseMyData = jest.mocked(useMyData);

describe('MyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMyData.mockReturnValue(
      createMockSuccess(createMyEntity({ name: 'Default' })),
    );
  });

  it('shows loading when data is pending', () => {
    mockUseMyData.mockReturnValue(createMockPending());
    renderComponent();
    screen.getByText('common:loading'); // or your loading key
  });

  it('shows content when data is loaded', () => {
    renderComponent();
    screen.getByText('Default');
  });

  it('shows error when query fails', () => {
    mockUseMyData.mockReturnValue(createMockError(new Error('Failed')));
    renderComponent();
    screen.getByText('common:errorLoadingData'); // or your error key
  });
});
```

---

## 5. Hook test — with QueryClient and AuthContext

```tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanupAsync, renderHook, waitFor } from '@testing-library/react-native';

import { AuthContext, type AuthContextType } from '@/context/AuthContext';
import { useMyMutation } from './useMyMutation';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const createWrapper =
  (queryClient: QueryClient, auth: AuthContextType) =>
  ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      AuthContext.Provider,
      { value: auth },
      React.createElement(QueryClientProvider, { client: queryClient }, children),
    );

describe('useMyMutation', () => {
  let queryClient: QueryClient;
  const baseAuth = { organizationId: 'org-1', enterpriseUuid: 'ent-1', /* ... */ };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
  });

  afterEach(async () => {
    queryClient.clear();
    await cleanupAsync();
  });

  it('calls API and updates cache', async () => {
    const { result } = renderHook(() => useMyMutation(), {
      wrapper: createWrapper(queryClient, baseAuth),
    });

    await act(async () => {
      await result.current.mutateAsync({ id: '123' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

---

## 6. Key imports and utilities

| Need | Import / use |
|------|----------------|
| Render with theme | `ThemeProvider` from `@/theme/context` (real, not mocked) |
| Mock data for API types | `create*` from `@test/utils/factories` (e.g. `createLocationExSmall`, `createActionEx`) |
| Query state | `createMockSuccess`, `createMockPending`, `createMockError` from `@test/utils/tanStackUtils` |
| Mutation state | `createMockMutationIdle`, `createMockMutationSuccess`, etc. from `@test/utils/tanStackUtils` |
| render, screen, fireEvent | `@testing-library/react-native` or `@test/utils/testUtils` (re-exports + custom render) |
| i18n in tests | `jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }))` or `@test/mocks/react-i18next` |
| Navigation in tests | Mock `@react-navigation/native` or use `createTestStackNavigator` from `@test/utils/navigation` where available |

---

## 7. Querying and asserting

- **Presence:** `screen.getByText('...')` (throws if missing). Do not wrap in `expect(...).toBeDefined()`.
- **Absence:** `expect(screen.queryByText('...')).not.toBeOnTheScreen()` (or `.toBeNull()` if not using RTL matchers).
- **Async:** Use `findBy*` or `waitFor(() => { ... })` when content appears after effects or async work.
- **Roles/labels:** Prefer `getByRole`, `getByLabelText`, `getByTestId` when it matches how users find the element.

---

## 8. Common mocks (snippets)

**Navigation:**
```ts
const mockNavigate = jest.fn<void, [string, object?]>();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));
```

**Alert:**
```ts
const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
// ... trigger code that calls Alert.alert
expect(alertSpy).toHaveBeenCalledWith('Title', 'Message', expect.any(Array));
alertSpy.mockRestore();
```

**Victory / native-only charts:** Mock the library and assert on props passed to the mock (see `.claude/skills/react-testing/SKILL.md`).

---

## 9. Jest not exiting / open handles

- Use a **QueryClient** with `retry: false` and `gcTime: Infinity` in tests.
- Prefer **mocking TanStack Query hooks** in component tests so no real queries run.
- If using real QueryClient, use **fake timers** and **`cleanupAsync`** in `afterEach`; see `.claude/skills/react-testing/SKILL.md` and `jest-open-handles-playbook.md`.

---

## 10. Full reference

- **React testing skill (patterns, anti-patterns, type safety):** `.claude/skills/react-testing/SKILL.md`
- **Jest open handles:** `.claude/skills/react-testing/jest-open-handles-playbook.md`
- **AGENTS.md:** Test organization, anti-patterns, and “what to test” summary

Use this doc to start a new test quickly; use the skill and AGENTS.md for edge cases and deeper patterns.

---

## 11. Coverage and quality rules

All test files must follow these quality standards:

### Coverage requirement
- **Minimum coverage for every test file: 80%**
- This applies to:
  - **Statements**
  - **Branches**
  - **Functions**
  - **Lines**

If coverage drops below **80%**, add meaningful tests that cover **real logic paths**, not artificial assertions.

### Do not add test pollution
Avoid writing tests that exist **only to increase coverage numbers**. Examples of test pollution:

- Calling functions without assertions
- Testing private helpers that are already covered through public behavior
- Adding meaningless expectations like:
  ```ts
  expect(true).toBe(true)