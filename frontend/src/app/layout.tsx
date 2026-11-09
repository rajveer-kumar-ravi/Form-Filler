import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'FormFlow — Typeform-Inspired Conversational Form Builder',
  description:
    'Build, publish, and analyze conversational one-question-at-a-time forms with butter-smooth animations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
