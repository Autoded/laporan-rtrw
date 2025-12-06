import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LaporRT - Sistem Laporan Warga RT/RW',
  description: 'Platform digital untuk laporan warga, keuangan, dan surat-menyurat RT/RW',
  keywords: 'laporan warga, RT, RW, keuangan RT, surat menyurat, digital RT',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
