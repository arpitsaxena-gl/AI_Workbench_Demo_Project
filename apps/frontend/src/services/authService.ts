import { request } from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: string;
  token: string;
  admin: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function validateLogin(credentials: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('POST', '/user/validateLogin', {
    email: credentials.email,
    password: credentials.password,
  });
}

function storeSession(response: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ user: response.user, admin: response.admin }),
  );
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

interface UserSession {
  user: string;
  admin: boolean;
}

function getSession(): UserSession | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

function isLoggedIn(): boolean {
  return getToken() !== null;
}

export {
  validateLogin,
  storeSession,
  clearSession,
  getToken,
  getSession,
  isLoggedIn,
};
export type { LoginRequest, LoginResponse, UserSession };
