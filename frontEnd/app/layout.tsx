// frontEnd/app/layout.tsx
'use client';

import './globals.css';
import NavBar from '@/components/NavBar';
import EventSidebar from '@/components/EventSidebar';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!isLoaded) {
        setIsSidebarOpen(!mobile);
        setIsLoaded(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isLoaded]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <html lang="zh">
      <head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
        <meta name="msvalidate.01" content="37CAC20B08B5FD887461C6799EC8078B" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9932926368910541"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-white min-h-screen relative">
        <div className="fixed top-0 left-0 right-0 z-50">
          <NavBar
            isOpen={isSidebarOpen}
            onToggle={handleToggleSidebar}
            isMobile={isMobile}
          />
        </div>

        {isMobile && isSidebarOpen && (
          <div
            className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={handleCloseSidebar}
            style={{
              pointerEvents: isSidebarOpen ? 'auto' : 'none',
              opacity: isSidebarOpen ? 1 : 0
            }}
          />
        )}

        <div className="flex pt-16 relative">
          <EventSidebar
            isOpen={isSidebarOpen}
            onClose={handleCloseSidebar}
            isMobile={isMobile}
            isTransitioning={isLoaded}
          />
          <main className={`flex-1 min-w-0 p-4 transition-all duration-300 ${
            isMobile 
              ? (isSidebarOpen ? 'translate-x-64' : 'translate-x-0') 
              : (isSidebarOpen ? 'ml-64' : 'ml-0')
          } relative z-30`}>
            <div className="mx-auto w-full max-w-[100vw]">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
