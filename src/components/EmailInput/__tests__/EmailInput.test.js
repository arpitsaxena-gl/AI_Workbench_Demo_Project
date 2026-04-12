/**
 * Unit tests for: KAN-2
 * @generated
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import EmailInput from '../EmailInput';

describe('EmailInput', () => {
  it('renders email input with label', () => {
    const { getByText, getByPlaceholderText } = render(<EmailInput register={{}} error={null} value='' onChange={() => {}} />);
    expect(getByText('Email:')).toBeInTheDocument();
    expect(getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('calls onChange function on input change', () => {
    const onChangeMock = jest.fn();
    const { getByPlaceholderText } = render(<EmailInput register={{}} error={null} value='' onChange={onChangeMock} />);
    const emailInput = getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith({ target: { value: 'test@example.com' } });
  });
});