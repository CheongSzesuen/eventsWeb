// frontEnd/src/lib/searchEvents.ts
import Fuse from 'fuse.js';
import type { Event } from '@/types/events';
import { fetchEvents } from './fetchEvents';

export const searchEvents = async (query: string): Promise<Event[]> => {
  try {
    const allEvents = await fetchEvents();
    if (!allEvents || allEvents.total === 0) {
      console.warn('没有找到任何事件');
      return [];
    }

    const events = [
      ...allEvents.school_events,
      ...allEvents.exam_events,
      ...allEvents.random_events
    ];

    // 添加调试信息
    console.log('搜索事件总数:', events.length);

    const options = {
      keys: ['question'], // 简化搜索字段
      threshold: 0.3
    };

    const fuse = new Fuse(events, options);
    const result = fuse.search(query);
    return result.map(item => item.item);
  } catch (error) {
    console.error('搜索事件失败:', error);
    return [];
  }
};
