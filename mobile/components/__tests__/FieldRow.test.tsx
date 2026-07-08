import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders, flushHydration } from '../../test-utils';
import { FieldRow } from '../FieldRow';

describe('FieldRow', () => {
  it('renders a long two-word prefix (THEN REST) without dropping it', async () => {
    // regression: "THEN REST" (transition-rest row in the Complex builder) is
    // longer than the fixed label column; it must still render (shrunk to fit
    // via adjustsFontSizeToFit), not be omitted.
    renderWithProviders(
      <FieldRow prefix="THEN REST" suffix="SECONDS" value={30} onChange={() => {}} />
    );
    await flushHydration();
    expect(screen.getByText('THEN REST')).toBeTruthy();
    expect(screen.getByText('SECONDS')).toBeTruthy();
    expect(screen.getByDisplayValue('30')).toBeTruthy();
  });

  it('reports parsed numeric changes to onChange', async () => {
    const onChange = jest.fn();
    renderWithProviders(
      <FieldRow prefix="THEN REST" suffix="SECONDS" value={0} onChange={onChange} />
    );
    await flushHydration();
    fireEvent.changeText(screen.getByDisplayValue('0'), '45');
    expect(onChange).toHaveBeenLastCalledWith(45);
  });
});
