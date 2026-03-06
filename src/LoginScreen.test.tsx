import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import LoginScreen from './LoginScreen';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates email and password fields when user types', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByLabelText('Email input');
    const passwordInput = screen.getByLabelText('Password input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 's3cret!');

    expect(emailInput.props.value).toBe('user@example.com');
    expect(passwordInput.props.value).toBe('s3cret!');
  });

  it('keeps password input masked', () => {
    render(<LoginScreen />);

    const passwordInput = screen.getByLabelText('Password input');

    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('submits current credentials when sign in is pressed', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<LoginScreen />);

    const emailInput = screen.getByLabelText('Email input');
    const passwordInput = screen.getByLabelText('Password input');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.changeText(emailInput, 'agent@example.com');
    fireEvent.changeText(passwordInput, 'credential-value-123');
    fireEvent.press(signInButton);

    expect(logSpy).toHaveBeenCalledWith('Sign in pressed', {
      email: 'agent@example.com',
      password: 'credential-value-123',
    });
  });
});
