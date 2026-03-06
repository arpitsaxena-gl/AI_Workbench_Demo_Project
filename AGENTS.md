# Agent Context: Redzone Multi-Platform Client

This document provides context for LLMs working on this codebase. It focuses on patterns, conventions, and architectural decisions.

## Project Context

React Native (Expo 53) application targeting Android. Migrating features from native iOS app while maintaining UX parity. Code is organized into feature modules (currently: Productivity, with more to come).

## Critical Rules

1. **Generated API clients:** NEVER edit these - they are auto-generated and will be overwritten:
   - `app/services/openapi/` - main API (openapi.yml)
   - `app/services/chats/` - chats API (chats.openapi.yml), modern chat feature
   - `app/services/channels/` - channels API (channels.openapi.yml), channels feature
2. **TypeScript:** Strict mode enforced. No `any` types. All code must compile without errors
3. **i18n Keys:** Never hardcode user-facing strings - always use translation keys from `app/i18n/en.ts`
4. **Navigation:** Use typed navigation params, never `any` or unsafe casts

## File Organization

```
app/
├── components/              # Shared components (root = shared across modules)
├── components/{module}/     # Module-specific reusable components
├── screens/{module}/        # Screen components, one per route
├── hooks/{module}/          # TanStack Query hooks for data fetching
├── stores/{module}/         # TanStack Store for global state
├── services/openapi/        # Generated main API client (DO NOT EDIT)
├── services/chats/          # Generated chats API client (DO NOT EDIT)
├── services/channels/       # Generated channels API client (DO NOT EDIT)
├── i18n/                    # Translation files (en is primary)
├── navigators/              # Navigation configuration
├── models/                  # TypeScript types and interfaces
├── utils/                   # Utility functions
└── theme/                   # Colors, spacing, typography constants
```

**Organization guidelines:**
- Root `app/components/` is for shared components used across multiple modules
- `app/components/{module}/` is for module-specific components
- For screens, hooks, and stores: organize by module first, then by type within the module

**Component extraction philosophy:**
- **Extract for Single Responsibility Principle** even before cross-module reuse is needed
- Components should be extracted when they reach 200-300 lines or handle multiple concerns
- Root `app/components/` extraction happens when needed by 2+ modules (the REUSE threshold)
- Module-specific extraction (`app/components/{module}/`) happens earlier for SRP (the CLARITY threshold)
- Large screens (500+ lines) should be decomposed into focused components for maintainability

## Data Fetching Pattern

### TanStack Query for Server State

All API calls use TanStack Query hooks in `app/hooks/{module}/`. Never use `useState`/`useEffect` for server data.

**Hook structure:**
- One hook per API endpoint or logical data unit
- Located in `app/hooks/{module}/{domain}/use{Entity}.ts`
- Returns standard TanStack Query result: `{ data, isPending, error, refetch }`

**When to create a mutation vs query:**
- Query: GET requests, data fetching
- Mutation: POST/PUT/DELETE requests, data modifications

**Query keys:**
- Use array format: `['entity', param1, param2]`
- Include all parameters that affect the result
- Enables automatic cache invalidation

**org/enterprise ID placement (contextual):**
- For collection queries (no other UUIDs): place org/enterprise IDs at END
  - Example: `['widgets', filter, enterpriseUuid, organizationId]`
  - Reason: Enables partial cache invalidation (invalidate by entity type without knowing org)
- For single-item queries with a UUID: ordering less important
  - Example: `['widget', widgetUuid]` - this UUID won't exist in another org
  - Adding org/enterprise is optional for these cases

**Example hook pattern:**
```typescript
export const useItems = (filter: string) => {
  const { organizationId, enterpriseUuid } = useAuth()

  return useQuery({
    queryKey: ['items', filter, enterpriseUuid, organizationId],
    queryFn: filter
      ? async () => {
          const response = await ItemService.getItems({ organizationId, enterpriseUuid, filter })
          return response.items
        }
      : skipToken,
  })
}
```

**Conditional query execution:**

When query parameters are optional/undefined but required by the API:

1. **Preferred: Conditionally render component** - Move query to child component where parameters are guaranteed to exist:
```typescript
// Parent: conditionally render based on parameter existence
if (!locationUuid) return <EmptyState />
return <LocationDetail locationUuid={locationUuid} />  // locationUuid guaranteed non-null here
```

2. **Alternative: Use `skipToken`** - Better type safety than `enabled` flag when parameters might be undefined:
```typescript
import { useQuery, skipToken } from '@tanstack/react-query'

export const useLocation = (locationUuid?: string) => {
  return useQuery({
    queryKey: ['location', locationUuid],
    queryFn: locationUuid ? () => LocationService.get(locationUuid) : skipToken,
  })
}
```

Don't use `skipToken` if you need to manually call `refetch()` - use `enabled` instead.

**Data fetching location:**

Most components receive data via props from their parent screen/container. However, some components DO fetch data directly with TanStack Query hooks when appropriate:

**Acceptable for component-level data fetching:**
- Orchestrating multiple related queries (e.g., `KPIPanel` with 4+ hooks)
- Container/content components with feature-level encapsulation (e.g., `ForumProfileContent`)
- Components managing their own complex state (e.g., `EnterpriseSelectionModal`)
- Framework components that coordinate data display (e.g., reusable dashboard widgets)

**NOT acceptable for component-level data fetching:**
- Simple presentational components (list items, cards, labels)
- Components that receive data in similar contexts elsewhere
- Components designed purely for display without business logic

**General guideline:** If a component orchestrates a feature or manages significant business logic, direct data fetching is acceptable. If it's primarily presentational, receive data via props.

### ListView Component for List Screens

Use `ListView` component (`app/components/productivity/lists/ListView.tsx`) for all list UIs. It handles:
- Pull-to-refresh
- Search
- Selection (single/multiple)
- Swipe actions
- Empty states
- Loading states

**ListView modes:**
- `"selection"` - Picker/lookup screens with checkmarks
- `"add-edit"` - CRUD lists with add button and row tap navigation
- `"view-only"` - Read-only lists with disclosure indicators

**DataSource adapter pattern:**
Create adapter in screen:
```typescript
const dataSource = {
  load: async () => filteredData,
  search: async (text) => filteredData.filter(/* client-side search */),
  delete: async (item) => deleteMutation.mutateAsync(item.id), // optional
}
```

**Important:** Search and filtering are CLIENT-SIDE on already-cached data from TanStack Query. Do not make API calls in DataSource methods.

See `docs/data-fetching-guide.md` for detailed examples.

## Navigation

React Navigation 7.x with TypeScript.

**Adding a new screen:**
1. Add route to navigator's param list type
2. Create screen component in `app/screens/{module}/`
3. Add screen to navigator in `app/navigators/`
4. Use typed navigation hooks: `useNavigation<NavigationProp<ParamList>>()`

**Navigation props:**
- Prefer route params for passing IDs/primitives
- Never pass complex objects without proper typing

**Modal Overlay Pattern:**

Both `ModalOverlayWrapper` and `ModalOverlayLayout` (in `@/components/navigation`) produce the same centered-card-over-backdrop appearance. **Prefer registering screens in the Modal Overlay Group** with `screenLayout` prop — this keeps screens focused on rendering content without knowing whether they're displayed modally. Screens become more reusable and the modal presentation is handled at the navigator level.

`ModalOverlayWrapper` is available as a fallback when you need to wrap content directly in a panel's JSX (e.g., for screens that can't be registered in the group).

**Important:** When using `ModalOverlayLayout` with `screenLayout`, you must pass a function that returns the component, not the component directly:

```typescript
// ✅ CORRECT - screenLayout expects a function
screenLayout={(props) => <ModalOverlayLayout {...props} />}

// ❌ WRONG - passing component directly will fail
screenLayout={ModalOverlayLayout}
```

```typescript
// AppNavigator.tsx - Register in the Modal Overlay Group
<Stack.Group
  screenOptions={{
    presentation: 'transparentModal',
    headerShown: false,
    animation: 'fade',
    contentStyle: { backgroundColor: 'transparent' },
  }}
  screenLayout={(props) => <ModalOverlayLayout {...props} />}
>
  <Stack.Screen name="MyModal" component={MyModalPanel} />
</Stack.Group>
```

```typescript
// MyModalPanel.tsx - Screen only cares about content, not modal presentation
import { ModalHeader } from '@/components/navigation';

export function MyModalPanel(): React.ReactElement {
  const navigation = useNavigation();

  return (
    <>
      <ModalHeader
        title={{ text: 'My Modal' }}
        back={{ text: 'Cancel', onPress: () => navigation.goBack() }}
        action={{ text: 'Done', onPress: handleDone }}
      />
      {/* Modal content */}
    </>
  );
}
```

**Single-screen modals:**

Use `ModalHeader` for Cancel/Done buttons as shown above.

**Multi-step workflow modals:**

Create a `*ModalNavigator.tsx` with `headerShown: true` for native stack headers:

```typescript
export default function MyWorkflowModalNavigator(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="StepA" component={StepAPanel} />
      <Stack.Screen name="StepB" component={StepBPanel} />
    </Stack.Navigator>
  );
}
```

Internal screens use `*Panel.tsx` naming. To dismiss the entire workflow from within:

```typescript
const handleCloseWorkflow = () => {
  navigation.getParent()?.goBack();
};
```

**When to use modal overlays:**
- Multi-step workflows with slide transitions between screens
- Single-screen forms/dialogs that need consistent styling
- Selection/picker screens

**Do NOT use for:**
- Full-screen flows - use regular screen stack navigator
- Native modal presentation - use `presentation: 'modal'` directly

**Communication between modal screens:**

Use `navigationFlowStore` for all screen-to-screen communication across navigation boundaries:
- Centralized store in `app/stores/navigationFlowStore.ts` handles all workflow callbacks
- Calling screen: `createNavigationFlowCallback(callback)` → pass `navigationFlowId` in params
- Modal screen on success: `invokeCompletionCallback(navigationFlowId, ...args)` → `navigation.goBack()`
- Callbacks can accept arguments (e.g., `createNavigationFlowCallback((filter) => { ... })`)
- Keeps params serializable (supports state persistence/deep linking)

For ephemeral state shared between screens within a flow (e.g., draft quantities, selections):
```typescript
const draftKey = `myFlow.draft.${navigationFlowId}`;
const draft = useSessionValue<DraftState>(draftKey);
setSessionValue(draftKey, { ...draft, quantity: newValue });
```

**Legacy patterns to avoid:**
- Single-purpose stores (e.g., `createChannelParticipantsStore`) - use `navigationFlowStore` instead
- Callbacks in route params (`onSelect`) - not serializable, use `navigationFlowStore` instead

**Component navigation patterns:**

Components can use `useNavigation()` directly when appropriate. The pattern is pragmatic, not strict:

**Acceptable for direct navigation in components:**
- Menu/popover components with multiple navigation targets (e.g., `ProfilePopover`)
- Content components that orchestrate features (e.g., `ForumProfileContent`)
- Framework components that coordinate navigation (e.g., `ListView`)
- Components with complex internal state tied to navigation flows

**NOT acceptable for direct navigation:**
- Simple presentational list items (e.g., `ActionListItem`, `ChatListItem`, `ForumListItem`)
- Pure display components with no business logic
- Components designed to be reusable across different navigation contexts

**General guideline:** Simple presentational components should use callbacks (`onPress` props). Smart components that orchestrate features or have multiple navigation paths can use `useNavigation()` directly. Optional callbacks (like `onClose`) can complement direct navigation for side effects.

## Styling

No CSS-in-JS library. Use React Native's StyleSheet API with the app's theming system.

**Theme System:**
The app has a complete theming system with light and dark mode support:
- Theme context: `app/theme/context.tsx` provides `useAppTheme()` hook
- Light theme: `app/theme/colors.ts`, `app/theme/spacing.ts`
- Dark theme: `app/theme/colorsDark.ts`, `app/theme/spacingDark.ts`
- Shared: `app/theme/typography.ts`, `app/theme/timing.ts`

**Primary Pattern: Dynamic Theming with `useAppTheme()`**

This is the **recommended approach** for all UI components. It ensures full theme support including light/dark mode.

```typescript
import { useAppTheme } from '@/theme/context';
import type { ThemedStyle } from '@/theme/types';
import type { ViewStyle, TextStyle } from 'react-native';

function MyComponent() {
  const { themed, theme } = useAppTheme();

  return (
    <View style={themed($container)}>
      <Text style={themed($text)}>Hello</Text>
    </View>
  );
}

// Define styles as functions that receive the theme
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
  borderRadius: 8,
});

const $text: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: theme.typography.fontSize.sm,
  fontFamily: theme.typography.primary.normal,
});
```

**What `useAppTheme()` provides:**
- `themed()` - Function to resolve `ThemedStyle` functions into actual styles
- `theme` - Complete theme object with colors, spacing, typography (including fontSize), timing, isDark flag
- `colors` - Direct access to current theme colors
- `themeContext` - Current theme mode ('light' or 'dark')
- `setThemeContextOverride()` - Function to override theme mode

**Typography system:**
The `theme.typography` object includes:
- `primary`, `secondary`, `code` - Font family configurations with weights (light, normal, medium, semiBold, bold)
- `fontSize` - Standard font size scale: `{ xxs: 12, xs: 14, sm: 16, md: 18, lg: 20, xl: 24, xxl: 36 }`

Always use `typography.fontSize.*` for font sizes instead of hard-coded pixel values.

**Multiple styles:**
```typescript
// Array of themed styles
const $button: ThemedStyleArray<ViewStyle> = [
  $baseButton,
  (theme) => ({ backgroundColor: theme.colors.primary }),
];

// Apply with themed()
<Pressable style={themed($button)} />
```

**Conditional styling:**
```typescript
<View style={themed([
  $container,
  isActive && $containerActive,
  { marginTop: customMargin }, // Can mix static styles too
])} />
```

**When to use `useAppTheme()`:**
- All screen components
- All reusable UI components
- Any component using colors, spacing, or theme values
- Any user-facing content that should respect theme

**Alternative Pattern: Static Styling (Legacy)**

Direct imports from theme files **do not support theme switching**. Avoid for new components. Only acceptable in test files, test utilities, or pure utility functions that don't render UI.

**General Guidelines:**
- Never use hard-coded colors (e.g., `#007AFF`) - always use theme values
- Never use hard-coded font sizes - always use `theme.typography.fontSize` values
- Never use magic numbers - use `theme.spacing` values
- Font sizes: Use `typography.fontSize.{xxs|xs|sm|md|lg|xl|xxl}` (12, 14, 16, 18, 20, 24, 36)
- Spacing: Use `spacing` for margins/paddings, NOT for font sizes
- Use `Platform.select()` for platform-specific styles when needed
- Define styles at component bottom, after the component function
- Use meaningful style names prefixed with `$` (e.g., `$container`, `$text`)

## Internationalization

i18next with 7 languages. English is primary (`app/i18n/en.ts`).

**Using translations in React components:**

Use the `useTranslation()` hook (preferred):
```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  return <Text>{t('common.save')}</Text>
}
```

Use the `translate()` function only when hooks cannot be used:
- Object literals and constants
- Helper functions outside components
- Class methods (rare)
- Reusable component internal logic (e.g., `Text` component)

```typescript
import { translate } from "@/i18n"

// In non-component code
const config = {
  title: translate("common.save")
}
```

**Adding new keys:**
1. Add English translation to `app/i18n/en.ts`
2. Use via `t()` hook or `translate()` function

**String Interpolation with Variables:**

When you need to display text that combines static text with dynamic variables, always use i18n interpolation instead of mixing JSX with variables:

```typescript
// ❌ BAD - Hardcoded text mixed with variables
<Text>Hello {userName}</Text>
<Text>You have {count} messages</Text>

// ✅ GOOD - Use interpolation in translation keys
// In app/i18n/en.ts:
// greeting: 'Hello {{name}}'
// messageCount: 'You have {{count}} messages'

<Text>{t('common.greeting', { name: userName })}</Text>
<Text>{t('common.messageCount', { count })}</Text>
```

**Multiple variables in one string:**

```typescript
// Translation key: userProgress: '{{name}} completed {{completed}} of {{total}} tasks'
<Text>{t('productivity.userProgress', { name: userName, completed: 5, total: 10 })}</Text>
// Result: "John completed 5 of 10 tasks"
```

**Why use interpolation:**

- Enables proper translation for different languages (word order varies by language)
- Keeps all user-facing text translatable
- Maintains consistency across the app
- Allows translators to adjust phrasing around variables

**Translation priorities:**
- Focus on English translations only for now
- Other language files (ar, es, fr, hi, ja, ko) are not a priority during development
- Professional translation service will handle other languages before launch

**Date and Time Formatting:**

The i18n system includes built-in datetime formatting that automatically uses the user's locale:

```typescript
const { t } = useTranslation()
const date = new Date('2025-01-15T14:30:00')

const time = t('common:intlTime', { value: date })        // "2:30 PM"
const dateStr = t('common:intlDate', { value: date })     // "01/15/2025"
const datetime = t('common:intlDateTime', { value: date }) // "01/15/2025, 2:30 PM"
```

Uses `Intl.DateTimeFormat` with the current i18n language. Always use these keys instead of `toLocaleTimeString()` or `toLocaleDateString()` with hardcoded locales.

**Number Formatting:**

The i18n system includes built-in number formatting that automatically uses the user's locale:

```typescript
const { t } = useTranslation()
const count = 1234567
const formattedCount = t('common:intlNumber', { value: count }) // "1,234,567"

// Interpolation with multiple numbers:
// Translation key: xOfY: '{{actual, number}} of {{target, number}}'
const progress = t('common:xOfY', { actual: 1500, target: 2000 }) // "1,500 of 2,000"
```

Uses `Intl.NumberFormat` with the current i18n language. Always use these keys instead of `toLocaleString()` with hardcoded locales.

Keep non-localized values (like unit names) outside translation keys for flexibility.

Never hardcode user-facing strings.

## Components

**Component organization:**
- Module-specific: `app/components/{module}/` - used only within that module
- Shared: `app/components/` (root level) - reusable across multiple modules
- Start module-specific, extract to root when needed by other modules

**When to extract to root components:**
- Component is needed in 2+ modules
- Component provides generic functionality (buttons, inputs, cards)
- Component has no module-specific business logic

**Reusable component guidelines:**
- Fully typed props with JSDoc comments
- Include accessibility props (`accessibilityLabel`, `accessibilityRole`)
- Keep flexible with props rather than hard-coding behavior
- Let React Compiler handle performance optimizations

**Component patterns:**
- Prefer function components
- Use hooks for logic
- Keep components focused (single responsibility)
- Extract complex logic to custom hooks

## State Management

**Server state:** TanStack Query (in hooks)
**Global client state:** TanStack Store (in stores)
**Component tree state:** TanStack Store (when avoiding deep prop drilling)
**Local UI state:** `useState` in components
**Form state:** `useState` or form library if complex

**When to use TanStack Store:**
- True global state needed across entire app (user preferences, app-wide settings)
- State shared within a component tree to avoid deep prop drilling
- Complex state that benefits from centralized management

**When NOT to use TanStack Store:**
- Server data - always use TanStack Query (it caches globally)
- Simple local UI state - use `useState`
- State only used in one component

Note: Most shared state needs are satisfied by TanStack Query since server state is cached globally. TanStack Store should be used sparingly.

**Persisted UI state with `useMMKVObject`:**

For UI state that persists across sessions (e.g., expanded/collapsed states):
```typescript
// ❌ BAD: Manual load/save with useEffect
const [expanded, setExpanded] = useState<string[]>([]);
useEffect(() => { setExpanded(load(key) ?? []); }, []);
const toggle = (id) => { setExpanded(...); storage.set(key, ...); };

// ✅ GOOD: Reactive hook handles persistence automatically
const [storedExpanded, setStoredExpanded] = useMMKVObject<ExpandedState>(key, storage);
const expandedIds = deriveExpandedIds(storedExpanded, currentIds);
const toggle = (id) => setStoredExpanded({ expanded: [...], savedAt: Date.now() });
```

**Derive state from store instead of syncing:**
```typescript
// ❌ BAD: Local state synced via effects
const [localValue, setLocalValue] = useState(initialValue);
useEffect(() => { /* sync with external source */ }, [externalSource]);

// ✅ GOOD: Derive directly from shared store
const draft = useSessionValue<DraftState>(draftKey);
const value = draft?.fieldValue ?? defaultValue;  // Always in sync
const setValue = (v) => setSessionValue(draftKey, { ...draft, fieldValue: v });
```

## API Integration

Three OpenAPI-generated clients live under `app/services/`:

| Client | Spec | Purpose |
|--------|------|---------|
| `openapi` | openapi.yml | Main Redzone API (shifts, productivity, etc.) |
| `chats` | chats.openapi.yml | Modern chats feature (aligned with iOS) |
| `channels` | channels.openapi.yml | Channels feature (aligned with iOS) |

**Usage:**
```typescript
// Main API
import { ShiftService } from "@/services/openapi"
const result = await ShiftService.getCurrentShift({ orgId, enterpriseId })

// Chats API
import { DefaultService as ChatsService } from "@/services/chats"

// Channels API
import { DefaultService as ChannelsService } from "@/services/channels"
```

**Regenerating clients:** `npm run openapi:gen`, `npm run openapi:gen:chats`, `npm run openapi:gen:channels`

**Configuration:**
- Main API: base URL and auth configured in `app/services/openapi/configure.ts`
- Chats and channels: each has `core/OpenAPI.ts`; set `OpenAPI.BASE` and `OpenAPI.TOKEN` at runtime when wiring up (e.g. from same auth/config as main API)
- Never construct API URLs manually

## Testing

**Test framework:** Jest with React Native Testing Library

**Skill:** When writing or reviewing tests, use the `react-testing` skill (`.claude/skills/react-testing/`) for detailed patterns (factories, TanStack Query mocking, anti-patterns, ThemeProvider, native components, Jest cleanup).

**Test organization:**
- Test files should be co-located with their components/subjects
- Component test: `app/components/Foo.tsx` → `app/components/Foo.test.tsx`
- Hook test: `app/hooks/useFoo.ts` → `app/hooks/useFoo.test.ts`
- Always place test next to the file it tests, never in separate `__tests__/` directories
- Follow existing patterns in codebase for consistency

**What to test:**
- Component rendering and interactions
- Custom hooks logic
- Utility functions
- Critical user flows
- Correct data transformations

**What not to test:**
- Implementation details (internal state, function names)
- Third-party libraries (TanStack Query, React Navigation)
- Trivial code (simple getters, direct pass-throughs)

**Running tests:**
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode for development
```

**For AI agents:**
- ONLY run specific test files when editing that code: `npm run test -- ComponentName.test.tsx`
- DO NOT run `npm run compile` after every change - the user will run it
- DO NOT run the full test suite - the user will run it
- Use VS Code diagnostics (mcp__ide__getDiagnostics) to check TypeScript errors in specific files you've edited

**Writing tests:**
- Test behavior, not implementation
- Use descriptive test names explaining what is being tested
- Arrange-Act-Assert pattern
- Mock API calls and external dependencies
- Keep tests focused and isolated
- Group common tests of the same UI portion under describe blocks
- Test for edge cases: no data, large numbers, small numbers, empty arrays, nullish values
- Optional helpers and provider setup (i18n, AuthContext, ThemeProvider, storage, native components, Jest warnings): see the `react-testing` skill

**Test anti-patterns to avoid:**
- ❌ **Smoke tests**: Only check `UNSAFE_root.toBeTruthy()` without asserting behavior
- ❌ **Coverage chasing**: Execute code but don't validate behavior (comments like "ensures line X is covered")
- ❌ **Mock-testing-mock**: Verify mocked components render instead of testing actual logic
- ❌ **Redundant tests**: Multiple tests for same code path with trivial variations
- ❌ **Memoization tests**: RTL can't effectively test `React.memo` - these just rerender and assert nothing
- ❌ **Redundant assertions on getBy queries**: `getBy*` queries already throw if the element is not found, so `expect(getByText('foo')).toBeDefined()` is redundant. Just call `screen.getByText('foo')` without an expect wrapper. Use `expect(screen.queryByText('foo')).not.toBeOnTheScreen()` for absence checks.
- ❌ **Generic API mock data in test files**: Do not define factory functions for API types in test files. All mock data factories belong in `test/utils/factories.ts` for reuse across tests.
- ✅ **Good tests**: Assert on visible output, user interactions, accessibility, state changes, error conditions

**Query patterns:**
```typescript
// ❌ BAD - redundant assertion, getByText already throws if not found
const { getByText } = render(<MyComponent />);
expect(getByText('Hello')).toBeDefined();

// ✅ GOOD - use screen.getBy* directly (throws if not found)
render(<MyComponent />);
screen.getByText('Hello');

// ✅ GOOD - use queryBy* with not.toBeOnTheScreen() for absence
render(<MyComponent />);
expect(screen.queryByText('Hello')).not.toBeOnTheScreen();
```

**Type-safe hook mocking:**
```typescript
// ❌ BAD: Type assertions lose type safety
jest.mock('@/hooks/useMyHook');
const mockUseMyHook = useMyHook as jest.Mock;
mockUseMyHook.mockReturnValue({ data: partial }); // No type checking on return value

// ✅ GOOD: jest.mocked() preserves types
jest.mock('@/hooks/useMyHook');
const mockUseMyHook = jest.mocked(useMyHook);
mockUseMyHook.mockReturnValue(createMockSuccess(completeData)); // Type-checked

// Create inline mock helpers for complex hook return types
function createMockMyHookSuccess(data: MyData[]): ReturnType<typeof useMyHook> {
  return {
    data,
    isPending: false,
    error: null,
    refetch: jest.fn(),
  };
}
```

Use factories from `@test/utils/factories` for complete mock data instead of partial objects.

## Common Patterns

### Selection Screens

Screens that let users pick items from a list:
1. Use ListView with `mode="selection"`
2. Accept `onSelect` callback via route params
3. Call callback with selected item(s)
4. Navigate back after selection

### Form Screens

Screens with input fields:
1. Use controlled components with `useState`
2. Validate on submit, not on every keystroke
3. Show validation errors clearly
4. Disable submit button while submitting
5. Use mutations for API calls

### Detail Screens

Screens showing single item details:
1. Accept item ID via route params
2. Fetch data with TanStack Query hook
3. Handle loading and error states
4. Provide refresh mechanism

### Polling/Real-time Updates

For screens needing frequent updates:
1. Use TanStack Query's `refetchInterval` option
2. Consider `refetchOnFocus` for background updates
3. Use `enabled` to control when polling happens

### Multi-Screen Modal Workflows

For modals with multiple content views (list, detail, picker, etc.), prefer navigator-based flows:

```typescript
// ❌ BAD: Single modal managing multiple views with state
const [currentView, setCurrentView] = useState<'list' | 'detail' | 'picker'>('list');
const [contentReady, setContentReady] = useState(false);
// ...complex refs and state to track which view to show

// ✅ GOOD: Each view is its own screen in a navigator
export function MyWorkflowModalNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="List" component={ListPanel} />
      <Stack.Screen name="Detail" component={DetailPanel} />
    </Stack.Navigator>
  );
}
```

## Performance Considerations

**Lists:**
- Use `getItemLayout` on FlatList for fixed-height items
- Add `keyExtractor` for stable keys
- Use `removeClippedSubviews` for long lists
- Consider `windowSize` for very long lists

**Images:**
- Use appropriate image sizes (don't load huge images)
- Consider lazy loading for off-screen images

**API calls:**
- Debounce or throttle API calls triggered by user input (e.g., search-as-you-type)
- Use `lodash.debounce` or custom debounce hook for input-driven API calls
- Typical debounce delay: 300-500ms for search inputs
- Remember: TanStack Query caching already prevents redundant identical requests
- Example: Debounce search input before updating query key that triggers refetch

## Accessibility

All interactive elements must have:
- `accessibilityLabel` - descriptive label
- `accessibilityRole` - button, link, checkbox, etc.
- `accessibilityHint` - what happens when activated (optional)

Minimum touch target: 44x44 points

## Error Handling

**API errors:**
- TanStack Query handles automatically via `error` in result
- Display user-friendly messages
- Provide retry mechanism for transient errors

**Validation errors:**
- Validate before API submission
- Show inline errors near relevant fields
- Prevent submission until valid

**Runtime errors:**
- Use error boundaries for component crashes
- Log errors appropriately
- Fail gracefully with user feedback

## Code Style

**Formatting:**
- Prettier check: `npm run format` or `npm run format:check` (use `npm run format:fix` to auto-format)
- Lint: `npm run lint` (Oxlint with GTS-derived config; use `npm run lint:fix` to auto-fix)
- Optional full GTS via ESLint: `npm run lint:gts` / `npm run lint:gts:fix`
- Regenerate GTS-derived Oxc config after gts upgrade: `npm run generate:oxlint-gts`
- Run before committing
- **Note**: Issues caught by Oxlint/Prettier (formatting, import ordering, etc.) should not be flagged in code reviews - automated tooling handles these

**Naming:**
- Components: PascalCase
- Files: PascalCase for components, camelCase for utilities
- Hooks: camelCase starting with "use"
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

**File naming conventions:**
- `*Screen.tsx` - Fullscreen components/navigators rendered as routes
- `*Panel.tsx` - Components rendered inside modal navigators (not fullscreen)
- `*ModalNavigator.tsx` - Stack navigators that render as modal overlays with internal navigation
- `*Modal.tsx` - Components using `CustomModal` wrapper (acceptable for single-use, but prefer ModalNavigator for multi-step flows)
- `*Form.tsx` - Components containing form inputs

**Imports:**
- Strongly prefer path aliases (e.g., `@/`) over relative imports
- If navigating more than one level away (`../../`), use path alias instead
- Group imports: external, internal, relative
- Remove unused imports

**Examples:**
```typescript
// Prefer this (path alias)
import { Button } from "@/components/shared/Button"

// Over this (relative, when more than one level)
import { Button } from "../../../components/shared/Button"

// Relative is OK for same directory or one level
import { helper } from "./utils"
import { SiblingComponent } from "../SiblingComponent"
```

## When Modifying Code

**Before making changes:**
1. Check if pattern already exists elsewhere in codebase
2. Follow existing patterns for consistency
3. Consider if change affects multiple modules

**When adding features:**
1. Start with types/interfaces
2. Create TanStack Query hooks for data
3. Build UI components
4. Wire up navigation
5. Add i18n keys
6. Test on Android emulator

**When fixing bugs:**
1. Understand root cause before changing code
2. Check if issue exists in multiple places
3. Consider if fix should be in shared component/hook
4. Verify fix doesn't break existing functionality

## Code Review Checklist

When reviewing code (especially for `/review-branch` or PR reviews), perform a **systematic, line-by-line analysis**. Do not rely on summaries or pattern recognition alone.

### Critical Security & Data Issues (Check FIRST)

**Hard-coded Secrets & IDs:**
- [ ] Search for hard-coded UUIDs, org/tenant IDs, API keys, tokens, passwords, URLs
- [ ] All must come from Config, AuthContext, or route params - NEVER hard-coded

**Type Safety Violations:**
- [ ] Search for `as any` type assertions
- [ ] Verify no `any` types used
- [ ] No `as unknown as <Type>` assertions - prefer object picking (`Pick<T, 'field'>`) when only partial information is needed

### Design System Compliance

**Typography:**
- [ ] Check every `fontSize:` uses `typography.fontSize.*` - NEVER `spacing.*`, hard-coded numbers, or math operations

**Colors:**
- [ ] Search for ALL hard-coded colors (hex codes, rgba values)
- [ ] Verify colors use theme values: `colors.palette.*` or `colors.*`
- [ ] Check semantic correctness:
  - `angry*`/`error` = errors, destructive actions (NOT general red)
  - `success*` = success states (NOT general green)
  - `warning*` = warnings (NOT general yellow)
  - `neutral*` = backgrounds, text, borders
- [ ] Verify semi-transparent colors use theme + opacity, not hard-coded rgba
- [ ] Check dark mode: Does this color work in both themes?

**Spacing:**
- [ ] All margins/padding use `spacing.*` values
- [ ] No magic numbers for layout

### Variable & Naming Conventions

**Underscore Prefix Rules:**
- [ ] Variables with `_` prefix must be unused - if used anywhere, remove underscore

### Hook Usage Patterns

**TanStack Query:**
- [ ] All API calls use TanStack Query hooks (no fetch/axios in components)
- [ ] Query keys include ALL parameters that affect the result
- [ ] No unnecessary try-catch blocks (TanStack Query handles errors)
- [ ] Check for intermediate variables that just return the API call directly
- [ ] Conditional queries: Prefer conditional rendering over `enabled` flag; use `skipToken` for type safety when conditional rendering isn't feasible

**Hook Parameters:**
- [ ] Verify all hook parameters are actually used in the hook
- [ ] Check if hook could be calling wrong API (different params than expected)

### File-by-File Analysis

When reviewing MODIFIED files (not just new files):

1. **Read the full diff** - Don't skip large files
2. **Check every added line** - Especially:
   - Style definitions
   - Hook calls
   - Hard-coded values
   - Variable assignments
3. **Look for patterns, then check EACH instance**:
   - Found one hard-coded UUID? Search for ALL UUIDs
   - Found one fontSize using spacing? Check ALL fontSize usages
   - Found one type assertion? Check ALL type assertions
4. **Verify consistency across the file**:
   - Same variable used differently in different places? Flag it.
   - Same hook called with different hard-coded values? Bug.

### Common Mistakes to Check

- [ ] `fontSize: spacing.md` → Should be `fontSize: typography.fontSize.md`
- [ ] `locationUuid: 'hard-coded-uuid'` → Should be `locationUuid: locationId` (from variable)
- [ ] `data: _variable` that's actually used → Remove underscore
- [ ] Unnecessary `try { return await api() } catch (e) { throw e }` → Remove try-catch
- [ ] Intermediate variable: `const result = api(); return result;` → Simplify to `return api();`

### When to Fail the Review

Automatic rejection for:
- ANY hard-coded UUIDs, API keys, credentials, tokens
- ANY `fontSize: spacing.*` usage
- ANY `as any` type assertions
- ANY hard-coded hex colors (except in theme files)
- Variables prefixed with `_` that are actually used

## Dependencies

**Key dependencies and their purposes:**
- `@tanstack/react-query` - Server state, caching
- `@tanstack/react-store` - Global client state
- `@react-navigation/*` - Navigation
- `victory-native` - Charts/visualizations
- `react-native-svg` - SVG support for charts
- `i18next` / `react-i18next` - Internationalization
- `date-fns` - Date formatting/manipulation
- `expo-*` - Expo SDK modules

**Adding dependencies:**
- Use `npx expo install package-name` for Expo compatibility
- Update this document if adding significant new dependency
- Consider bundle size impact

## Utilities and Common Transformations

**Using third-party libraries:**
- Import and use library functions directly wherever needed (e.g., `date-fns`, `lodash`)
- Centralize complex, reusable transformations in `app/utils/`

## Module Structure (Productivity Example)

The Productivity module demonstrates the organizational pattern for feature modules:

```
app/
├── components/productivity/
│   ├── lists/          # ListView, ListItem, SearchBar
│   ├── panels/         # UI panels (LocationStatus, Shift, Run, KPI)
│   ├── charts/         # Visualization components
│   └── forms/          # Form inputs (NumberInput, TimeInput)
├── screens/productivity/
│   ├── operations/     # Operations dashboard screens
│   ├── shift/          # Shift management screens
│   ├── run/            # Run management screens
│   ├── problems/       # Problem tracking screens
│   ├── reports/        # Reporting screens
│   └── shared/         # Shared utility screens
├── hooks/productivity/
│   ├── operations/     # Operations-related queries
│   ├── shift/          # Shift-related queries/mutations
│   └── shared/         # Shared queries (locations, users, etc.)
└── stores/productivity/
    ├── operationsStore.ts
    └── stationStore.ts
```

Follow this structure when adding new modules.

## Getting Help

- **Data fetching:** See `docs/data-fetching-guide.md`
- **Blitzy generation details:** See `blitzy/documentation/Project Guide.md`
- **Expo docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **TanStack Query:** https://tanstack.com/query/latest

## React Best Practices

### Component Design

**Functional components only:**
- Use function components with hooks
- No class components
- Keep components small and focused

**Props:**
- Destructure props in function signature
- Provide TypeScript types for all props
- Use optional props with `?` and defaults where appropriate
- Avoid prop drilling - use context or state management for deep data

**Hooks rules:**
- Only call hooks at top level (not in loops/conditions/nested functions)
- Call hooks in same order every render
- Custom hooks must start with "use"

**State:**
- Keep state as local as possible
- Lift state up only when needed by multiple components
- Don't sync props to state unless necessary
- Use reducers for complex state logic

**Effects:**
- Avoid `useEffect` when possible - prefer derived state
- Always include dependencies in dependency array
- Clean up effects that create subscriptions/listeners
- Don't use `useEffect` for data fetching - use TanStack Query
- Don't use `useEffect` to set initial state from props/data - this is derived state

**Wrapper/Content pattern to eliminate `useEffect` initialization:**

Split components to guarantee data availability without effects:
```typescript
// Wrapper handles loading, content assumes data ready
function MyPanel() {
  const { data, isPending } = useMyQuery();
  if (isPending || !data?.requiredField) return <ActivityIndicator />;
  return <MyPanelContent data={data} requiredField={data.requiredField} />;
}

function MyPanelContent({ data, requiredField }: MyPanelContentProps) {
  // Props guaranteed non-null - initialize state directly (no useEffect)
  const [value, setValue] = useState(requiredField.defaultValue);
}
```

**Derived state with user override:**
When you need a "smart default" that users can override, don't use `useEffect` to set initial state:
```typescript
// BAD: useEffect to set initial state (causes extra render, may need setTimeout hack)
const [value, setValue] = useState(DefaultValue);
useEffect(() => {
  if (!hasSetInitial.current && data) {
    hasSetInitial.current = true;
    setValue(computeFromData(data));
  }
}, [data]);

// GOOD: Derived default with explicit user selection
const computedDefault = computeFromData(data);
const [userSelection, setUserSelection] = useState<Value | null>(null);
const value = userSelection ?? computedDefault;
```

**Keys:**
- Always provide stable keys for list items
- Never use array index as key if list can change
- Keys should be unique among siblings

### Performance

**When to optimize:**
- Optimize after measuring, not before
- Focus on slow screens/interactions first
- Use React DevTools Profiler to identify issues

**Memoization:**
- React Compiler automatically optimizes memoization at build time
- Do NOT manually use `useCallback` or `useMemo` - let the compiler handle it

## TypeScript Best Practices

### Types vs Interfaces

**Use `interface` for:**
- Object shapes
- Component props
- Extending/composing types (more performant than intersections)
- Public API definitions

**Use `type` for:**
- Unions: `type Status = 'active' | 'inactive'`
- Primitives and tuples: `type ID = string | number`
- Mapped types and complex type operations

**Extending:**
```typescript
// Prefer interface extension (more performant)
interface Base {
  id: string
}

interface Extended extends Base {
  name: string
}

// Over type intersection
type Extended = Base & { name: string }  // avoid when interface works
```

### Typing Patterns

**Component props:**
```typescript
interface MyComponentProps {
  title: string
  count?: number  // optional
  onPress: () => void
  children: React.ReactNode
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0, onPress, children }) => {
  // implementation
}
```

**Hooks:**
```typescript
// Explicit return type helps catch errors
export const useItems = (id: string): UseQueryResult<Item[]> => {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => fetchItems(id),
  })
}
```

**Event handlers:**
```typescript
// React Native events
const handlePress: () => void = () => {}
const handleChangeText: (text: string) => void = (text) => {}

// Use React types for web-specific events
import type { ChangeEvent } from 'react'
const handleChange: (e: ChangeEvent<HTMLInputElement>) => void = (e) => {}
```

### Type Safety

**Avoid `any`:**
- Use `unknown` if type truly unknown
- Use generic constraints: `<T extends BaseType>`
- Use type guards to narrow types
- Use union types for known variants

**Type assertions:**
- Avoid `as` assertions when possible
- Use type guards instead: `if (typeof x === 'string')`
- Only use `as` when you know more than TypeScript does
- Never use `as any` - this defeats purpose of TypeScript
- Never use `as unknown as <Type>` - prefer object picking (`Pick<T, 'field'>`) when only partial information is needed
- Prefer the usage of `satisfies` in cases where type narrowing is necessary, instead of `as`
**Nullability:**
```typescript
// Handle null/undefined explicitly
const value: string | undefined = getValue()
if (value) {
  // TypeScript knows value is string here
  useValue(value)
}

// Optional chaining
const name = user?.profile?.name

// Prefer nullish coalescing (??) over || for default values (preserves 0, '', false)
const count = value ?? 0      // ✓ Good - preserves 0 if passed
const count = value || 0      // ✗ Bad - replaces 0 with 0
const name = value || 'None'  // ✓ OK if you want '' to become 'None'
```

**Generics:**
```typescript
// Make components/functions flexible with generics
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  // TypeScript knows T throughout component
}
```

### OpenAPI Types

The generated API clients provide types. Use them:
```typescript
import type { Shift, ShiftStatus } from "@/services/openapi"
import type { ChatResponse, MessageResponse } from "@/services/chats"
import type { ChannelResponse } from "@/services/channels"

// Don't recreate types that exist in OpenAPI schema
// Do extend them if needed for UI-specific fields
interface ShiftWithUI extends Shift {
  isSelected: boolean  // UI-only field
}
```

**IMPORTANT:** The OpenAPI-generated clients include interfaces for Redzone domain models. Only create new interfaces for implementation details, not for domain entities that already exist in the generated code.

### Type Organization

**Location:**
- Component-specific types: same file as component (including component props)
- Hook-specific types: same file as hook
- Only extract types/interfaces to `app/models/` if shared by multiple components/hooks
- API types: auto-generated in `app/services/openapi/models/`, `app/services/chats/models/`, `app/services/channels/models/`

**Component props exports:**
- Export props interfaces directly from component files
- Parent components can import child component props when needed
- Example: `import type { ButtonProps } from './Button'`
- No need to extract to shared location just because a parent uses them

**Exports:**
```typescript
// Export types from same file
export interface MyComponentProps { }
export type MyStatus = 'active' | 'inactive'

// Re-export common types from index
// app/models/index.ts
export type { User, Organization } from './user'
export type { Status } from './common'
```

### Common TypeScript Patterns

**Discriminated unions:**
```typescript
type Result =
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error }
  | { status: 'loading' }

// TypeScript narrows type based on discriminant
if (result.status === 'success') {
  console.log(result.data)  // TypeScript knows data exists
}
```

**Type guards:**
```typescript
function isError(result: Result): result is ErrorResult {
  return result.status === 'error'
}

if (isError(result)) {
  // TypeScript knows result is ErrorResult
  console.error(result.error)
}
```

## Common Questions

**Q: Should I create a new component or use an existing one?**
A: Check `app/components/{module}/` first. Reuse if possible, extend if needed, create new only if truly unique.

**Q: Where do I put business logic?**
A: In custom hooks if reusable, in screen component if screen-specific, in utility functions if pure logic.

**Q: How do I share data between screens?**
A: Use TanStack Query (it caches globally), route params for navigation, or TanStack Store for global state or to avoid deep prop drilling within a component tree.

**Q: Do I need to handle loading/error states?**
A: Yes, always. TanStack Query provides `isPending` and `error`. Show appropriate UI for each state.

**Q: Should I use inline styles or StyleSheet?**
A: Always use `StyleSheet.create()` for better performance and organization.

**Q: Can I use a third-party component library?**
A: Check with team first. Prefer building with primitives to maintain consistency and reduce bundle size.
