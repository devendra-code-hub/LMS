import React from 'react';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export function Input({ value, onChange }: Props) {
  return <input value={value} onChange={(e) => onChange?.(e.target.value)} />;
}
