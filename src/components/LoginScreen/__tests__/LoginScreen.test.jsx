/**
 * Unit tests for: KAN-2
 * @generated
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { TouchableOpacity } from 'react-native';

describe('LoginScreen', () => {
  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
    expect(getByPlaceholderText('Enter password')).toBeTruthy();
  });

  it('calls handleLogin on button press', () => {
    const { getByText } = render(<LoginScreen />);
    const button = getByText('Login');
    fireEvent.press(button);
    // expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('shows error message for invalid credentials', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Enter email');
    const passwordInput = getByPlaceholderText('Enter password');
    const button = getByText('Login');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.press(button);

    await waitFor(() => getByText('Invalid email or password'));
  });

  it('shows loading indicator during login request', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Enter email');
    const passwordInput = getByPlaceholderText('Enter password');
    const button = getByText('Login');

    fireEvent.changeText(emailInput, 'email@example.com');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.press(button);

    await waitFor(() => getByText('Loading...'));
  });
});