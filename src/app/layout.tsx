import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SportsBackground } from '@/components/layout/SportsBackground';

export const metadata: Metadata = {
  title: 'ITFTMS 2026 - Hệ Thống Quản Lý Giải Bóng Đá Khoa CNTT 2026',
  description: 'Hệ thống quản lý, điều hành và cổng thông tin trực tiếp Giải bóng đá Khoa Công nghệ Thông tin 2026',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0284C7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var migrated = localStorage.getItem('itftms_theme_ocean_v1');
                  if (!migrated) {
                    localStorage.setItem('itftms_theme', 'light');
                    localStorage.setItem('itftms_theme_ocean_v1', 'true');
                  }
                  var saved = localStorage.getItem('itftms_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#F8FAFC] text-slate-900 min-h-screen font-sans antialiased selection:bg-sky-500 selection:text-white relative transition-colors duration-300">
        <SportsBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
