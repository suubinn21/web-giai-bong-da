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
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var migrated = localStorage.getItem('itftms_theme_emerald_v1');
                  if (!migrated) {
                    localStorage.setItem('itftms_theme', 'dark');
                    localStorage.setItem('itftms_theme_emerald_v1', 'true');
                  }
                  var saved = localStorage.getItem('itftms_theme');
                  if (saved === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#060F1D] text-slate-100 min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white relative transition-colors duration-300">
        <SportsBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
