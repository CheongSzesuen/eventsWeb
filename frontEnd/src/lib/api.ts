import type { ApiResponse, Event } from '@/types/events';
import events from '@/data/events.json';

export async function fetchEvents(): Promise<ApiResponse> {
  const data = events as ApiResponse;
  
  if (!data.events || !data.random_events) {
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
    if (event.question.toLowerCase().includes(searchText)) return true;
    
    const choiceMatch = Object.entries(event.choices).some(([key, text]) => 
      text.toLowerCase().includes(searchText) || key === searchText
    );
    if (choiceMatch) return true;
    
    return Object.entries(event.results).some(([key, result]) => {
      if (typeof result === 'string') {
        return result.toLowerCase().includes(searchText);
      } else {
        return result.some(r => 
          r.text.toLowerCase().includes(searchText) ||
          (r.end_game && searchText.includes('游戏结束'))
        );
      }
    });
  });
}

export async function fetchUserGeoLocation() {
  try {
    const response = await fetch('/api/events/geo', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Geo API Response:', response); // 调试日志
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Geo API Data:', data); // 调试日志
    
    if (!data.city) {
      throw new Error('API返回数据缺少city字段');
    }
    
    return {
      city: data.city,
      country: data.country,
      error: null
    };
  } catch (error) {
    console.error('获取地理位置失败:', error);
    return { 
      city: null,
      error: error instanceof Error ? error.message : '定位服务异常'
    };
  }
}

export async function submitEvent(eventData: {
  type: string;
  question: string;
  choices: Record<string, string>;
  results: Record<string, any>;
  city?: string;
  school?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('/api/events/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '提交失败');
    
    return { success: true, id: data.id };
  } catch (error) {
    return { 
      success: false,
      error: error instanceof Error ? error.message : '提交失败'
    };
  }
}

export async function getSchoolsByCity(city: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/data/schools.json`);
    const data = await response.json();
    return data[city] || {};
  } catch (error) {
    console.error('获取学校列表失败:', error);
    return {};
  }
}

// 辅助函数 - 查找省份
export const findProvinceByCity = (city: string, provinceCityData: Record<string, string[]>): string | null => {
  for (const [province, cities] of Object.entries(provinceCityData)) {
    if (cities.includes(city)) {
      return province;
    }
  }
  return null;
};
