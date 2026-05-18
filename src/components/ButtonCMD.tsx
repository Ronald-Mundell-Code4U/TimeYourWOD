import React from 'react';

interface Props {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}

export const ButtonCMD: React.FC<Props> = ({ text, onPress, variant = 'primary', disabled }) => {
  return (
    <button
      type="button"
      className={variant === 'primary' ? 'btn-cmd' : 'btn-ghost'}
      onClick={onPress}
      disabled={disabled}
      style={disabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
    >
      {text}
    </button>
  );
};
