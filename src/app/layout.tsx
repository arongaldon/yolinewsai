import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YoliNews - AI Agent Aggregator',
  description: 'AI-powered daily news aggregator and chat agent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="layout-container">
          {children}
        </main>
      </body>
    </html>
  );
}
