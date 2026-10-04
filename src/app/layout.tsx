import type { Metadata } from 'next';
import './globals.css';
import { SportsBackground } from '@/components/layout/SportsBackground';

export const metadata: Metadata = {
  title: 'ITFTMS 2026 - Hệ Thống Quản Lý Giải Bóng Đá Khoa CNTT 2026',
  description: 'Hệ thống quản lý, điều hành và cổng thông tin trực tiếp Giải bóng đá Khoa Công nghệ Thông tin 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#050811] text-slate-100 min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white relative">
        <SportsBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
