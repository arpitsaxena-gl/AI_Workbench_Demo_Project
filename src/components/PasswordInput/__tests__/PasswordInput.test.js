/**
 * Unit tests for: KAN-2
 * @generated
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PasswordInput from '../PasswordInput';

describe('PasswordInput', () => {
  it('renders password input with label', () => {
    const { getByText, getByPlaceholderText } = render(<PasswordInput register={{}} error={null} value='' onChange={() => {}} />);
    expect(getByText('Password:')).toBeInTheDocument();
    expect(getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('calls onChange function on input change', () => {
    const onChangeMock = jest.fn();
    const { getByPlaceholderText } = render(<PasswordInput register={{}} error={null} value='' onChange={onChangeMock} />);
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith({ target: { value: 'password123' } });
  });
});