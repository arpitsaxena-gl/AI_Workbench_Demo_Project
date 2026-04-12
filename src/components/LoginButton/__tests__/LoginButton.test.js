/**
 * Unit tests for: KAN-2
 * @generated
 */

import React from 'react';
import { render } from '@testing-library/react';
import LoginButton from '../LoginButton';

describe('LoginButton', () => {
  it('renders login button', () => {
    const { getByText } = render(<LoginButton disabled={false} />);
    expect(getByText('Login')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(<LoginButton disabled={true} />);
    expect(getByText('Login')).toBeDisabled();
  });
});