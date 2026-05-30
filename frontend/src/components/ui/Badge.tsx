import React from 'react';

type Props = {
  label: string;
};

export function Badge({ label }: Props) {
  return <span>{label}</span>;
}
