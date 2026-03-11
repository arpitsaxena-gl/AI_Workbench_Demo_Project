import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemeProvider, useTheme } from './theme/context';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

function SignupScreenContent() {
  const { colors } = useTheme();
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
      newErrors.password = 'Password must contain at least one uppercase letter';
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

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      console.log('Sign up successful', { fullName, email, password });
    } catch (error) {
      console.error('Sign up failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    console.log('Sign in pressed');
  };

  const handleSocialSignup = (provider: string) => {
    console.log(`${provider} signup pressed`);
  };

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>✦</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Sign up to get started with your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.fullName ? '#ef4444' : colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.secondaryText}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  clearFieldError('fullName');
                }}
                autoCapitalize="words"
                autoCorrect={false}
                accessibilityLabel="Full name input"
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.email ? '#ef4444' : colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.secondaryText}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearFieldError('email');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email input"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.password ? '#ef4444' : colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor={colors.secondaryText}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearFieldError('password');
                  }}
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Text style={{ color: colors.secondaryText, fontSize: 16 }}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Text style={[styles.hintText, { color: colors.secondaryText }]}>
                Min 8 characters with uppercase and number
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.confirmPassword ? '#ef4444' : colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.secondaryText}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearFieldError('confirmPassword');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  accessibilityLabel="Confirm password input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <Text style={{ color: colors.secondaryText, fontSize: 16 }}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    borderColor: errors.terms ? '#ef4444' : colors.border,
                    backgroundColor: acceptedTerms ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => {
                  setAcceptedTerms(!acceptedTerms);
                  clearFieldError('terms');
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
                accessibilityLabel="Accept terms and conditions"
              >
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.termsTextContainer}>
                <Text style={[styles.termsText, { color: colors.secondaryText }]}>
                  I agree to the{' '}
                </Text>
                <TouchableOpacity onPress={handleTermsPress}>
                  <Text style={[styles.termsLink, { color: colors.primary }]}>
                    Terms of Service
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.termsText, { color: colors.secondaryText }]}>
                  {' '}and{' '}
                </Text>
                <TouchableOpacity onPress={handlePrivacyPress}>
                  <Text style={[styles.termsLink, { color: colors.primary }]}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {errors.terms && (
              <Text style={[styles.errorText, { marginTop: -8, marginBottom: 16 }]}>
                {errors.terms}
              </Text>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.secondaryText }]}>
                or sign up with
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Signup Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={[styles.socialButton, { borderColor: colors.border }]}
                onPress={() => handleSocialSignup('Google')}
                accessibilityRole="button"
                accessibilityLabel="Sign up with Google"
              >
                <Text style={styles.socialIcon}>G</Text>
                <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, { borderColor: colors.border }]}
                onPress={() => handleSocialSignup('Apple')}
                accessibilityRole="button"
                accessibilityLabel="Sign up with Apple"
              >
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={[styles.signInText, { color: colors.secondaryText }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignIn} accessibilityRole="link">
                <Text style={[styles.signInLink, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function SignupScreen() {
  return (
    <ThemeProvider>
      <SignupScreenContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  termsLink: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  socialIcon: {
    fontSize: 18,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
