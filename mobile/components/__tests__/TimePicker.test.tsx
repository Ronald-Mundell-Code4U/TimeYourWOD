import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders, flushHydration } from '../../test-utils';
import { TimePicker } from '../TimePicker';

describe('TimePicker — two-digit entry (regression)', () => {
  it('accepts a full two-digit seconds value like 30', async () => {
    const onChange = jest.fn();
    renderWithProviders(<TimePicker value={0} onChange={onChange} />);
    await flushHydration();
    const secs = screen.getByLabelText('seconds');

    fireEvent(secs, 'focus'); // clears the padded "00" so typing starts fresh
    fireEvent.changeText(secs, '3');
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.changeText(secs, '30');
    expect(onChange).toHaveBeenLastCalledWith(30); // <- was impossible before the fix
  });

  it('accepts a two-digit minutes value and composes total seconds', async () => {
    const onChange = jest.fn();
    renderWithProviders(<TimePicker value={0} onChange={onChange} />);
    await flushHydration();
    const mins = screen.getByLabelText('minutes');

    fireEvent(mins, 'focus');
    fireEvent.changeText(mins, '12');
    expect(onChange).toHaveBeenLastCalledWith(12 * 60); // 720s
  });

  it('clamps out-of-range input (seconds > 59 → 59)', async () => {
    const onChange = jest.fn();
    renderWithProviders(<TimePicker value={0} onChange={onChange} />);
    await flushHydration();
    const secs = screen.getByLabelText('seconds');

    fireEvent(secs, 'focus');
    fireEvent.changeText(secs, '99');
    expect(onChange).toHaveBeenLastCalledWith(59);
  });

  it('re-pads the display on blur', async () => {
    const onChange = jest.fn();
    renderWithProviders(<TimePicker value={5} onChange={onChange} />);
    await flushHydration();
    const secs = screen.getByLabelText('seconds');
    expect(secs.props.value).toBe('05');
    fireEvent(secs, 'focus');
    expect(secs.props.value).toBe(''); // cleared for fresh entry
    fireEvent(secs, 'blur');
    expect(secs.props.value).toBe('05'); // restored
  });
});
