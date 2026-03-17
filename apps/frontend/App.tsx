import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './src/theme/context';
import { AuthProvider, useAuth } from './src/auth/context';
import HomeScreen from './src/HomeScreen';
import LoginScreen from './src/LoginScreen';
import SignupScreen from './src/SignupScreen';
import ProfileScreen from './src/ProfileScreen';
import ProtectedRoute from './src/ProtectedRoute';

function AuthAwareLoginRedirect() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <LoginScreen />;
}

function AuthAwareSignupRedirect() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <SignupScreen />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthAwareLoginRedirect />} />
            <Route path="/signup" element={<AuthAwareSignupRedirect />} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="/" element={<HomeScreen />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
