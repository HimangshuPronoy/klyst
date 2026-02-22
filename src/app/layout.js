import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'Kylst — Cold Email Platform',
  description:
    'Professional cold emailing software with inbox warm-up, campaign automation, and advanced analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
