'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AUTH_PATHS = ['/auth/login', '/auth/signup', '/landing'];

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Don't show app shell on auth pages
  if (AUTH_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopBar collapsed={collapsed} />
      <main className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
}
