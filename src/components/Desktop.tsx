import type { ReactNode } from 'react';
import './Desktop.css';

type DesktopProps = {
  children: ReactNode;
};

export function Desktop({ children }: DesktopProps) {
  return <div className="desktop">{children}</div>;
}
