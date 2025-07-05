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

  // 处理鼠标移出时的延迟（仅桌面端）
  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutId = setTimeout(() => {
        setShowDropdown(false);
      }, 300);
    }
  };

  // 清除定时器
  const cancelTimeout = () => {
    clearTimeout(timeoutId);
  };

  // 点击外部关闭
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

  // 移动端点击切换
  const handleMobileToggle = () => {
    if (isMobile) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // 修改 handleContributeClick 函数
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between h-16 items-center">
        <div className="flex items-center">
          {/* 网站Logo */}
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
          
          {/* 侧边栏切换按钮 */}
          {isMobile && (
            <button
              className="nav-button nav-button-default mr-4"
              onClick={onToggle}
              aria-label={isOpen ? "关闭菜单" : "打开菜单"}
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          )}
          {!isMobile && (
            <button
              className="nav-button nav-button-default mr-4"
              onClick={onToggle}
              aria-label="切换侧边栏"
            >
              <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
        
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索事件问题、选项或结果..."
              className="w-full h-10 pl-4 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <button 
              type="submit"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="搜索"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        {/* 蓝色贡献按钮 */}
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
            onClick={handleMobileToggle}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md whitespace-nowrap"
          >
            <span className="flex items-center">
              <PlusIcon className="w-4 h-4 mr-1" />
              贡献新事件
            </span>
            <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {/* 下拉菜单 - 调整宽度和文字居中 */}
          {(showDropdown || (!isMobile && showDropdown)) && (
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
