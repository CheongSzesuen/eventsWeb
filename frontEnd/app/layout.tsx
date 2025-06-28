'use client';

import './globals.css';
import NavBar from '@/components/NavBar';
import EventSidebar from '@/components/EventSidebar';
import { useState, useEffect } from 'react';

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
      if (!mobile) setIsSidebarOpen(true);
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