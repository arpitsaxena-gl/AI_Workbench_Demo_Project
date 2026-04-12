/**
 * Unit tests for: KAN-2
 * @generated
 */

import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'mock-token' }));
  })
);

describe('useAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns login function', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.login).toBeInstanceOf(Function);
  });

  it('calls login API on login function call', async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.login('test@example.com', 'password123');
    expect(server.handlers[0].ctx.request.body).toEqual({ email: 'test@example.com', password: 'password123' });
  });
});