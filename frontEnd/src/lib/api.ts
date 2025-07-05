import type { ApiResponse, Event } from '@/types/events';
import events from '@/data/events.json';

export async function fetchEvents(): Promise<ApiResponse> {
  const data = events as ApiResponse;
  
  if (!data.metadata || !data.events || !data.random_events) {
    throw new Error('Invalid events data structure');
  }
  
  return data;
}

export async function searchEvents(query: string): Promise<Event[]> {
  if (!query.trim()) return [];
  
  const data = await fetchEvents();
  const searchText = query.toLowerCase();
  
  const allEvents = [
    ...Object.values(data.events).flat(),
    ...data.random_events
  ];

  return allEvents.filter(event => {
    // 搜索问题
    if (event.question.toLowerCase().includes(searchText)) {
      return true;
    }
    
    // 搜索选项
    const choiceMatch = Object.entries(event.choices).some(([key, text]) => {
      return text.toLowerCase().includes(searchText) || 
             key === searchText; // 支持按选项编号搜索
    });
    if (choiceMatch) return true;
    
    // 搜索结果
    const resultMatch = Object.entries(event.results).some(([key, result]) => {
      if (typeof result === 'string') {
        return result.toLowerCase().includes(searchText);
      } else {
        return result.some(r => 
          r.text.toLowerCase().includes(searchText) ||
          (r.end_game && searchText.includes('游戏结束'))
        );
      }
    });
    
    return resultMatch;
  });
}

