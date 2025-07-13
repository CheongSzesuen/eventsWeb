// frontEnd/components/NavBar.tsx
'use client';

import { Bars3Icon, XMarkIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function NavBar({
  isOpen,
  onToggle,
  isMobile
}: {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  let timeoutId: NodeJS.Timeout;

  const navBarClasses = "w-full bg-white shadow-sm";

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutId = setTimeout(() => {
        setShowDropdown(false);
      }, 300);
    }
  };

  const cancelTimeout = () => {
    clearTimeout(timeoutId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleContributeClick = (type: string) => {
    switch(type) {
      case 'random':
        window.location.href = '/contribute?type=random';
        break;
      case 'school':
        window.location.href = '/contribute/school-select';
        break;
      case 'exam':
        window.location.href = '/contribute?type=exam';
        break;
    }
    setShowDropdown(false);
  };

  return (
    <header className={navBarClasses}>
      <div className="px-4 sm:px-6 flex justify-between h-16 items-center max-w-[100vw]">
        <div className="flex items-center">
          <Link href="/" className="flex-shrink-0 mr-4">
            <div className="rounded-lg overflow-hidden">
              <Image
                src="/icons/icon-v4.png"
                alt="网站Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-cover hover:opacity-80 transition-opacity"
                priority
              />
            </div>
          </Link>
          
          <button
            className="nav-button nav-button-default mr-4"
            onClick={onToggle}
            aria-label={isOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMobile ? (
              isOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-700" />
              )
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className="w-full h-10 pl-4 pr-10 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="搜索"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        <div 
          className="relative"
          ref={dropdownRef}
          onMouseEnter={() => {
            if (!isMobile) {
              cancelTimeout();
              setShowDropdown(true);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md whitespace-nowrap"
          >
            <span className="flex items-center">
              <PlusIcon className="w-4 h-4 mr-1" />
              贡献新事件
            </span>
            <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div 
              className={`absolute right-0 mt-1 bg-white rounded-md shadow-lg z-50 border border-gray-200 ${isMobile ? 'animate-fade-in' : ''}`}
              onMouseEnter={!isMobile ? cancelTimeout : undefined}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
            >
              <div className="py-1 w-auto min-w-[120px]">
                <button
                  onClick={() => handleContributeClick('random')}
                  className="block w-full px-4 py-2 text-center text-gray-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  随机事件
                </button>
                <button
                  onClick={() => handleContributeClick('school')}
                  className="block w-full px-4 py-2 text-center text-gray-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  学校事件
                </button>
                <button
                  onClick={() => handleContributeClick('exam')}
                  className="block w-full px-4 py-2 text-center text-gray-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  考试事件
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
