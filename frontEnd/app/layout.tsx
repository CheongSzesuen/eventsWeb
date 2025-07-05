'use client';

import './globals.css';
import NavBar from '@/components/NavBar';
import EventSidebar from '@/components/EventSidebar';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
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
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9932926368910541"
     crossOrigin="anonymous"></script>

    </head>
      <body className="bg-white min-h-screen">
        <NavBar 
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
        />
        <div className="flex pt-16">
          <EventSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isMobile={isMobile}
          />
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
          } ml-0 p-6`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
