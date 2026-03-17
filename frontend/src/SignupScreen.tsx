import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './theme/context';
import { useAuth } from './auth/context';
import styles from './SignupScreen.module.css';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  submit?: string;
}

function SignupScreen() {
  const { colors } = useTheme();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFieldError('submit');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await signup(fullName.trim(), email.trim(), password);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setErrors(prev => ({
          ...prev,
          submit: result.error ?? 'Sign up failed',
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Something went wrong. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSocialSignup = (provider: string) => {
    console.log(`${provider} signup pressed`);
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleTermsPress = () => {
    console.log('Terms and conditions pressed');
  };

  const handlePrivacyPress = () => {
    console.log('Privacy policy pressed');
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background }}
    >
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div
              className={styles.logoContainer}
              style={{ backgroundColor: colors.primary }}
            >
              <span className={styles.logoText}>✦</span>
            </div>
            <h1 className={styles.title} style={{ color: colors.text }}>
              Create Account
            </h1>
            <p
              className={styles.subtitle}
              style={{ color: colors.secondaryText }}
            >
              Sign up to get started with your account
            </p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSignUp}>
            {/* Full Name Input */}
            <div className={styles.inputContainer}>
              <label className={styles.label} style={{ color: colors.text }}>
                Full Name
              </label>
              <input
                type="text"
                className={styles.input}
                style={{
                  backgroundColor: colors.card,
                  borderColor: errors.fullName ? '#ef4444' : colors.border,
                  color: colors.text,
                }}
                placeholder="Enter your full name"
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  clearFieldError('fullName');
                }}
                aria-label="Full name input"
              />
              {errors.fullName && (
                <span className={styles.errorText}>{errors.fullName}</span>
              )}
            </div>

            {/* Email Input */}
            <div className={styles.inputContainer}>
              <label className={styles.label} style={{ color: colors.text }}>
                Email
              </label>
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
                onChange={e => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                aria-label="Email input"
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.inputContainer}>
              <label className={styles.label} style={{ color: colors.text }}>
                Password
              </label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.passwordInput}`}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: errors.password ? '#ef4444' : colors.border,
                    color: colors.text,
                  }}
                  placeholder="Create a password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    clearFieldError('password');
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
              <span
                className={styles.hintText}
                style={{ color: colors.secondaryText }}
              >
                Min 8 characters with uppercase and number
              </span>
            </div>

            {/* Confirm Password Input */}
            <div className={styles.inputContainer}>
              <label className={styles.label} style={{ color: colors.text }}>
                Confirm Password
              </label>
              <div className={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.passwordInput}`}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: errors.confirmPassword
                      ? '#ef4444'
                      : colors.border,
                    color: colors.text,
                  }}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  aria-label="Confirm password input"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  <span style={{ color: colors.secondaryText, fontSize: 16 }}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorText}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className={styles.termsContainer}>
              <button
                type="button"
                className={styles.checkbox}
                style={{
                  borderColor: errors.terms ? '#ef4444' : colors.border,
                  backgroundColor: acceptedTerms ? colors.primary : colors.card,
                }}
                onClick={() => {
                  setAcceptedTerms(!acceptedTerms);
                  clearFieldError('terms');
                }}
                role="checkbox"
                aria-checked={acceptedTerms}
                aria-label="Accept terms and conditions"
              >
                {acceptedTerms && <span className={styles.checkmark}>✓</span>}
              </button>
              <div className={styles.termsTextContainer}>
                <span
                  className={styles.termsText}
                  style={{ color: colors.secondaryText }}
                >
                  I agree to the{' '}
                </span>
                <button
                  type="button"
                  onClick={handleTermsPress}
                  className={styles.termsLink}
                >
                  <span style={{ color: colors.primary }}>
                    Terms of Service
                  </span>
                </button>
                <span
                  className={styles.termsText}
                  style={{ color: colors.secondaryText }}
                >
                  {' '}
                  and{' '}
                </span>
                <button
                  type="button"
                  onClick={handlePrivacyPress}
                  className={styles.termsLink}
                >
                  <span style={{ color: colors.primary }}>Privacy Policy</span>
                </button>
              </div>
            </div>
            {errors.terms && (
              <span className={`${styles.errorText} ${styles.termsError}`}>
                {errors.terms}
              </span>
            )}

            {errors.submit && (
              <div className={styles.inputContainer}>
                <span className={styles.errorText}>{errors.submit}</span>
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              className={`${styles.button} ${isLoading ? styles.buttonDisabled : ''}`}
              style={{ backgroundColor: colors.primary }}
              disabled={isLoading || authLoading}
              aria-label="Sign Up"
            >
              {isLoading ? (
                <span className={styles.spinner} />
              ) : (
                <span className={styles.buttonText}>Create Account</span>
              )}
            </button>

            {/* Divider */}
            <div className={styles.dividerContainer}>
              <div
                className={styles.divider}
                style={{ backgroundColor: colors.border }}
              />
              <span
                className={styles.dividerText}
                style={{ color: colors.secondaryText }}
              >
                or sign up with
              </span>
              <div
                className={styles.divider}
                style={{ backgroundColor: colors.border }}
              />
            </div>

            {/* Social Signup Buttons */}
            <div className={styles.socialContainer}>
              <button
                type="button"
                className={styles.socialButton}
                style={{ borderColor: colors.border }}
                onClick={() => handleSocialSignup('Google')}
                aria-label="Sign up with Google"
              >
                <span className={styles.socialIcon}>G</span>
                <span
                  className={styles.socialText}
                  style={{ color: colors.text }}
                >
                  Google
                </span>
              </button>

              <button
                type="button"
                className={styles.socialButton}
                style={{ borderColor: colors.border }}
                onClick={() => handleSocialSignup('Apple')}
                aria-label="Sign up with Apple"
              >
                <span className={styles.socialIcon}>🍎</span>
                <span
                  className={styles.socialText}
                  style={{ color: colors.text }}
                >
                  Apple
                </span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className={styles.signInContainer}>
              <span
                className={styles.signInText}
                style={{ color: colors.secondaryText }}
              >
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={handleSignIn}
                className={styles.signInLink}
              >
                <span style={{ color: colors.primary }}>Sign In</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupScreen;
