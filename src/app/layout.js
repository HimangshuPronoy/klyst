import "./globals.css";

export const metadata = {
  title: 'Klyst — AI Ad Creative & Insights Platform',
  description:
    'Chat with AI to create, iterate on, and analyze ad creatives for your performance marketing campaigns.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
