import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';

const AUTH_STORAGE_KEY = 'myproject_auth_user';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (parsed?.email && parsed?.fullName) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveUserToStorage(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// In-memory "database" for demo: map email -> { fullName, password }
// In production you would call an API instead.
function getStoredUsers(): Map<string, { fullName: string; password: string }> {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem('myproject_demo_users');
    if (!raw) return new Map();
    const arr = JSON.parse(raw) as Array<
      [string, { fullName: string; password: string }]
    >;
    return new Map(arr);
  } catch {
    return new Map();
  }
}

function setStoredUsers(
  map: Map<string, { fullName: string; password: string }>,
) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    'myproject_demo_users',
    JSON.stringify([...map.entries()]),
  );
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadUserFromStorage();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const users = getStoredUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const record = users.get(normalizedEmail);
      if (!record || record.password !== password) {
        return { success: false, error: 'Invalid email or password' };
      }
      const userData: User = {
        id: normalizedEmail,
        email: normalizedEmail,
        fullName: record.fullName,
      };
      setUser(userData);
      saveUserToStorage(userData);
      return { success: true };
    },
    [],
  );

  const signup = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const users = getStoredUsers();
      const normalizedEmail = email.trim().toLowerCase();
      if (users.has(normalizedEmail)) {
        return {
          success: false,
          error: 'An account with this email already exists',
        };
      }
      users.set(normalizedEmail, { fullName: fullName.trim(), password });
      setStoredUsers(users);
      const userData: User = {
        id: normalizedEmail,
        email: normalizedEmail,
        fullName: fullName.trim(),
      };
      setUser(userData);
      saveUserToStorage(userData);
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    saveUserToStorage(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
