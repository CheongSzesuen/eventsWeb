'use client';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NavBar({
  isOpen,
  onToggle,
  isMobile
}: {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16">
          {/* 移动端按钮 */}
          {isMobile && (
            <button
              className="nav-button nav-button-default"
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

          {/* 桌面端/平板端按钮 */}
          {!isMobile && (
            <button
              className="nav-button nav-button-default"
              onClick={onToggle}
              aria-label="切换侧边栏"
            >
              <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* 搜索框 */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索事件..."
                className="w-full h-10 pl-4 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-2.5">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}