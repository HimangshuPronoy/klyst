import React from 'react';
import Sidebar from '../Sidebar';

export default function ChatLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#030303',
      color: '#fff',
      minHeight: '100vh',
      overflow: 'hidden',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100vh'
      }}>
        {children}
      </main>
    </div>
  );
}
