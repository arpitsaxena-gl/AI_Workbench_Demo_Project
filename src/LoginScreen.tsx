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

function LoginScreenContent() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      console.log('Sign in successful', { email, password });
    } catch (error) {
      console.error('Sign in failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const handleSignUp = () => {
    console.log('Sign up pressed');
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login pressed`);
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
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Sign in to continue to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                  if (errors.email) setErrors({ ...errors, email: undefined });
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
                  placeholder="Enter your password"
                  placeholderTextColor={colors.secondaryText}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
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
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              accessibilityRole="link"
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.secondaryText }]}>
                or continue with
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={[styles.socialButton, { borderColor: colors.border }]}
                onPress={() => handleSocialLogin('Google')}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                <Text style={styles.socialIcon}>G</Text>
                <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, { borderColor: colors.border }]}
                onPress={() => handleSocialLogin('Apple')}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Apple"
              >
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: colors.secondaryText }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp} accessibilityRole="link">
                <Text style={[styles.signUpLink, { color: colors.primary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function LoginScreen() {
  return (
    <ThemeProvider>
      <LoginScreenContent />
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
    marginBottom: 40,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
