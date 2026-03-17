import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './theme/context';
import { validateLogin, storeSession } from './services/authService';
import { ApiRequestError } from './services/api';
import styles from './LoginScreen.module.css';

function LoginScreen() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');
    try {
      const response = await validateLogin({ email, password });
      storeSession(response);
      navigate('/');
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setApiError(error.message);
      } else {
        setApiError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login pressed`);
  };

  return (
    <div className={styles.container} style={{ backgroundColor: colors.background }}>
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logoContainer} style={{ backgroundColor: colors.primary }}>
              <span className={styles.logoText}>✦</span>
            </div>
            <h1 className={styles.title} style={{ color: colors.text }}>Welcome Back</h1>
            <p className={styles.subtitle} style={{ color: colors.secondaryText }}>
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSignIn}>
            {apiError && (
              <div className={styles.apiError} role="alert">
                <span className={styles.apiErrorIcon}>⚠</span>
                <span className={styles.apiErrorText}>{apiError}</span>
              </div>
            )}

            {/* Email Input */}
            <div className={styles.inputContainer}>
              <label className={styles.label} style={{ color: colors.text }}>Email</label>
              <input
                type="email"
                className={styles.input}
                style={{
                  backgroundColor: colors.card,
                  borderColor: errors.email ? '#ef4444' : colors.border,
                  color: colors.text,
                }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                aria-label="Email input"
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.inputContainer}>
              <label className={styles.label} style={{ color: colors.text }}>Password</label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.passwordInput}`}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: errors.password ? '#ef4444' : colors.border,
                    color: colors.text,
                  }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  aria-label="Password input"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span style={{ color: colors.secondaryText, fontSize: 16 }}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            {/* Forgot Password */}
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={handleForgotPassword}
            >
              <span className={styles.forgotPasswordText} style={{ color: colors.primary }}>
                Forgot Password?
              </span>
            </button>

            {/* Sign In Button */}
            <button
              type="submit"
              className={`${styles.button} ${isLoading ? styles.buttonDisabled : ''}`}
              style={{ backgroundColor: colors.primary }}
              disabled={isLoading}
              aria-label="Sign In"
            >
              {isLoading ? (
                <span className={styles.spinner} />
              ) : (
                <span className={styles.buttonText}>Sign In</span>
              )}
            </button>

            {/* Divider */}
            <div className={styles.dividerContainer}>
              <div className={styles.divider} style={{ backgroundColor: colors.border }} />
              <span className={styles.dividerText} style={{ color: colors.secondaryText }}>
                or continue with
              </span>
              <div className={styles.divider} style={{ backgroundColor: colors.border }} />
            </div>

            {/* Social Login Buttons */}
            <div className={styles.socialContainer}>
              <button
                type="button"
                className={styles.socialButton}
                style={{ borderColor: colors.border }}
                onClick={() => handleSocialLogin('Google')}
                aria-label="Sign in with Google"
              >
                <span className={styles.socialIcon}>G</span>
                <span className={styles.socialText} style={{ color: colors.text }}>Google</span>
              </button>

              <button
                type="button"
                className={styles.socialButton}
                style={{ borderColor: colors.border }}
                onClick={() => handleSocialLogin('Apple')}
                aria-label="Sign in with Apple"
              >
                <span className={styles.socialIcon}>🍎</span>
                <span className={styles.socialText} style={{ color: colors.text }}>Apple</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className={styles.signUpContainer}>
              <span className={styles.signUpText} style={{ color: colors.secondaryText }}>
                Don't have an account?{' '}
              </span>
              <button type="button" onClick={handleSignUp} className={styles.signUpLink}>
                <span style={{ color: colors.primary }}>Sign Up</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
