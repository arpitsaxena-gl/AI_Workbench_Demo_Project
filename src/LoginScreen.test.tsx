import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/context';
import LoginScreen from './LoginScreen';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates email and password fields when user types', () => {
    renderWithProviders(<LoginScreen />);

    const emailInput = screen.getByLabelText('Email input') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password input') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 's3cret!' } });

    expect(emailInput.value).toBe('user@example.com');
    expect(passwordInput.value).toBe('s3cret!');
  });

  it('keeps password input masked', () => {
    renderWithProviders(<LoginScreen />);

    const passwordInput = screen.getByLabelText('Password input') as HTMLInputElement;

    expect(passwordInput.type).toBe('password');
  });

  it('submits current credentials when sign in is pressed', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderWithProviders(<LoginScreen />);

    const emailInput = screen.getByLabelText('Email input');
    const passwordInput = screen.getByLabelText('Password input');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'agent@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'credential-value-123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith('Sign in successful', {
        email: 'agent@example.com',
        password: 'credential-value-123',
      });
    }, { timeout: 2000 });

    logSpy.mockRestore();
  });

  it('shows validation errors for empty fields', () => {
    renderWithProviders(<LoginScreen />);

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signInButton);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginScreen />);

    const emailInput = screen.getByLabelText('Email input');
    const passwordInput = screen.getByLabelText('Password input');
    const form = emailInput.closest('form')!;
    
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'validpassword');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  it('toggles password visibility when eye button is clicked', () => {
    renderWithProviders(<LoginScreen />);

    const passwordInput = screen.getByLabelText('Password input') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('Show password');

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');
  });
});
