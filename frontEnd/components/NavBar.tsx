'use client';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react'; // 导入 useState 钩子
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'; // 导入 MagnifyingGlassIcon

export default function NavBar({
  isOpen,
  onToggle,
  isMobile
}: {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState(''); // 定义 searchQuery 和 setSearchQuery

  // 定义 handleSearch 函数
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      // 构造查询字符串
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
      // 导航到搜索页面
      window.location.href = searchUrl;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16">
          {/* icon */}
          <Link href="/" className="flex-shrink-0 mr-4">
            <div className="rounded-lg overflow-hidden"> {/* 圆角 */}
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
          {/* 侧边栏按钮 */}
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
          {/* 搜索表单 */}
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
        </div>
      </div>
    </header>
  );
}
