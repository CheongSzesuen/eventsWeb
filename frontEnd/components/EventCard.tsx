'use client'; // 必须保留
import { useRouter } from 'next/navigation';
import type { Event } from '@/types/events';

export default function EventCard({ event }: { event: Event }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/events/${event.id}`);
  };

  return (
    <div 
      className="h-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-all
                 cursor-pointer select-none" // 添加点击反馈样式
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
        {event.question.replace(/^>>>/, '').trim()}
      </h3>
      <div className="text-sm text-gray-500 mb-3">
        {Object.keys(event.choices).length} 个选项
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
        {Array.isArray(event.results[Object.keys(event.choices)[0]]) 
          ? (event.results[Object.keys(event.choices)[0]] as any[])[0].text
          : event.results[Object.keys(event.choices)[0]] as string}
      </div>
    </div>
  );
}