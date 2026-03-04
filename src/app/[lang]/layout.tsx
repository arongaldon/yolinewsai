import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'YoliNews - AI Agent Aggregator',
  description: 'AI-powered daily news aggregator and chat agent.',
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es-ES' }, { lang: 'ca' }, { lang: 'de' }, { lang: 'ja' }, { lang: 'zh-CN' }];
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang}>
      <body>
        <main className="layout-container">
          {children}
        </main>
      </body>
    </html>
  );
}
