import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KARACA - Servis Yönetim Sistemi',
  description: 'Teknik servis yönetim uygulaması',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
