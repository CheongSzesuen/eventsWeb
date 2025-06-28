'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SCHOOL_NAMES = {
  'all': '全部事件',
  'random': '随机事件库',
  'group_1': '羊县中学',
  'group_2': '闪西省汗忠中学',
  'group_3': '汗忠市龙港高级中学'
};

const SAMPLE_GROUPS = [
  { name: 'all', count: 66 },
  { name: 'random', count: 57 },
  { name: 'group_1', count: 3 },
  { name: 'group_2', count: 3 },
  { name: 'group_3', count: 3 }
];

export default function EventSidebar({
  isOpen,
  onClose,
  isMobile
}: {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  const pathname = usePathname();
  const currentGroup = pathname.split('/')[3] || 'all';

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className={`hidden md:block fixed inset-y-0 left-0 z-40 w-64 bg-gray-50 border-r border-gray-200 pt-16 h-full transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">事件分类</h2>
          <ul className="space-y-2">
            {SAMPLE_GROUPS.map(group => (
              <li key={group.name}>
                <Link
                  href={`/events/group/${group.name}`}
                  className={`block px-4 py-2 rounded ${
                    currentGroup === group.name 
                      ? 'bg-blue-100 font-medium' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {SCHOOL_NAMES[group.name as keyof typeof SCHOOL_NAMES]}({group.count})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* 移动端侧边栏 */}
      {isMobile && (
        <div className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div 
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 pt-20">
              <h2 className="text-xl font-bold mb-4">事件分类</h2>
              <ul className="space-y-2">
                {SAMPLE_GROUPS.map(group => (
                  <li key={group.name}>
                    <Link
                      href={`/events/group/${group.name}`}
                      className={`block px-4 py-2 rounded ${
                        currentGroup === group.name 
                          ? 'bg-blue-100 font-medium' 
                          : 'hover:bg-gray-200'
                      }`}
                      onClick={onClose}
                    >
                      {SCHOOL_NAMES[group.name as keyof typeof SCHOOL_NAMES]}({group.count})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}