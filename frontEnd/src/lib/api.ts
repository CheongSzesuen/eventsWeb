import type { ApiResponse, Event } from '@/types/events';

const PRODUCTION_API_URL = 'https://game-events-api.cheongszesuen.workers.dev/api/events';
const DEVELOPMENT_API_URL = 'http://localhost:8787/api/events';

export async function fetchEvents(): Promise<ApiResponse> {
  const API_URL = process.env.NODE_ENV === 'development' 
    ? DEVELOPMENT_API_URL 
    : PRODUCTION_API_URL;

  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) throw new Error(`API请求失败: ${res.status}`);
    
    const data = await res.json() as ApiResponse; // 显式类型断言
    return normalizeData(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// 增强类型安全的数据标准化
function normalizeData(data: ApiResponse): ApiResponse {
  const normalizeEvent = (event: Event): Event => ({
    ...event,
    contributors: event.contributors || [] // 确保数组存在
  });

  return {
    metadata: data.metadata,
    events: Object.fromEntries(
      Object.entries(data.events).map(([key, events]) => [
        key, 
        events.map(normalizeEvent)
      ])
    ),
    random_events: data.random_events.map(normalizeEvent)
  };
}