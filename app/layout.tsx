import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FT-SEDE | Membros',
  description: 'Sistema de gerenciamento de membros da igreja FT-SEDE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' }
        }} />
      </body>
    </html>
  );
}
