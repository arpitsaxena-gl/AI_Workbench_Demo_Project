/**
 * Unit tests for: KAN-2
 * @generated
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import LoginScreen from '../LoginScreen';
import { useAuth } from '../../hooks/useAuth';

const server = setupServer(
  rest.post('/api/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'mock-token' }));
  })
);

jest.mock('../../hooks/useAuth');

describe('LoginScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with email and password inputs', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Email')).toBeInTheDocument();
    expect(getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('calls login function on form submission', async () => {
    const loginMock = jest.fn();
    useAuth.mockImplementation(() => ({ login: loginMock, isLoading: false, error: null }));
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Login');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(loginMock).toHaveBeenCalledTimes(1));
    expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays loader during login request', async () => {
    const loginMock = jest.fn();
    useAuth.mockImplementation(() => ({ login: loginMock, isLoading: true, error: null }));
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error message on login failure', async () => {
    const loginMock = jest.fn(() => Promise.reject(new Error('Login failed')));
    useAuth.mockImplementation(() => ({ login: loginMock, isLoading: false, error: 'Login failed' }));
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Login failed')).toBeInTheDocument();
  });
});