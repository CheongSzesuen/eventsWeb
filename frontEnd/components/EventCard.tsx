// frontEnd/components/EventCard.tsx
'use client';

import { usePathname } from 'next/navigation';
import type { Event, SchoolData, CityData, ProvinceData } from '@/types/events';

// 定义带学校信息的事件类型
export interface EventWithSchool extends Event {
  school?: string;
}

export default function EventCard({ 
  event,
  showBadge = true 
}: { 
  event: Event;
  showBadge?: boolean;
}) {
  const pathname = usePathname();

  // 根据 event.type 设置标签文本
  const getEventBadgeText = () => {
    if (event.type === 'exam') {
      return '📝 考试事件';
    } else if (event.type === 'random') {
      return '🎲 随机事件';
    } else if (event.type === 'school_start') {
      return `🏫 ${event.school || '未知学校'} - 开始事件`;
    } else if (event.type === 'school_special') {
      return `🏫 ${event.school || '未知学校'} - 特殊事件`;
    }
    return '';
  };

  return (
    <div 
      className="h-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-all select-none"
    >
      {showBadge && (
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
            {getEventBadgeText()}
          </span>
        </div>
      )}
      
      <h3 className="font-semibold line-clamp-2 mb-2">
        {event.question.replace(/^>>>/, '').trim()}
      </h3>
      
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        {Object.entries(event.choices).map(([key, text]) => (
          <div key={key} className="flex gap-2">
            <span className="font-medium">{key}.</span>
            <span className="line-clamp-1">{text}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {Object.entries(event.results).map(([resultKey, resultText]) => {
          if (Array.isArray(resultText)) {
            return (
              <div key={resultKey} className="space-y-1">
                {resultText.map((result, index) => (
                  <div key={index}>
                    <strong>{resultKey}:</strong> {result.text} (概率: {result.prob * 100}%)
                  </div>
                ))}
              </div>
            );
          } else {
            return (
              <div key={resultKey}>
                <strong>{resultKey}:</strong> {resultText}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}