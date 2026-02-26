import React from 'react';
import WorkspaceLayout from '../../components/Workspace/WorkspaceLayout';

export const metadata = {
  title: 'Klyst Workspace',
  description: 'AI-powered ad creative and insights platform.',
};

export default function AppLayout({ children }) {
  return (
    <WorkspaceLayout>
      {children}
    </WorkspaceLayout>
  );
}
