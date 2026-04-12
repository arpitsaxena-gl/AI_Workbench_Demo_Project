/**
 * Unit tests for: KAN-2
 * @generated
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmailInput from '../EmailInput';

describe('EmailInput', () => {
  it('renders email input with label', () => {
    const { getByText, getByPlaceholderText } = render(<EmailInput value='' onChangeText={() => {}} />);
    expect(getByText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
  });

  it('calls onChangeText when email input changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(<EmailInput value='' onChangeText={onChangeText} />);
    const emailInput = getByPlaceholderText('Enter email');
    fireEvent.changeText(emailInput, 'new-email@example.com');
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('new-email@example.com');
  });
});