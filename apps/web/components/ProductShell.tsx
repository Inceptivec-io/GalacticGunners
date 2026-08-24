import type { ReactNode } from 'react';

export function ProductShell({ children }: Readonly<{ children: ReactNode }>) {
  return <main>{children}</main>;
}
