import "./globals.css";

export const metadata = {
  title: 'Klyst | The Ultimate Ad Analyzer & Ecom Grower',
  description:
    'Boost your ROAS with Klyst, the premier AI Ad Analyzer and Ecom Software for Ecommerce brands. Iterate on creatives, analyze performance, and become a true Ecom Grower.',
  keywords: ['Ad Analyzer', 'Ecom Grower', 'Ecom Software', 'Ecommerce', 'AI Ad Creative', 'Performance Marketing', 'ROAS Optimization'],
  verification: {
    google: '78taroeF6g7PpUTB4ZOFMvg8Dt10ihC6sZeaJpyJzZ4',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
