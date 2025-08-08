import { NextResponse } from 'next/server';
import { 
  ApiResponse, 
  Event, 
  EventType, 
  ProvinceData, 
  CityData, 
  SchoolData,
  ProcessedSchoolData,
  ResultProbability 
} from '@/types/events';

// 静态数据基础路径
const DATA_BASE_PATH = '/data';
const DEFAULT_PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE));
    const type = searchParams.get('type') as EventType | null;

    // 获取完整数据
    const fullData = await loadFullData();
    
    // 应用类型过滤
    const filteredData = type ? filterByType(fullData, type) : fullData;
    
    // 应用分页
    const paginatedData = paginateEvents(filteredData, page, limit);

    return NextResponse.json(paginatedData, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'CDN-Cache-Control': 'max-age=3600'
      }
    });
  } catch (error) {
    console.error('[Events API] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// 加载所有数据
async function loadFullData(): Promise<ApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // 并行加载所有基础数据
  const [provinceData, examData, randomData] = await Promise.all([
    fetchJson<{ provinces: ProvinceData[] }>(`${baseUrl}${DATA_BASE_PATH}/provinceCityMap.json`),
    fetchJson<{ exam_events: Event[] }>(`${baseUrl}${DATA_BASE_PATH}/events/exam/exam.json`),
    fetchJson<{ random_events: Event[] }>(`${baseUrl}${DATA_BASE_PATH}/events/random.json`)
  ]);

  // 处理省份数据
  const processedProvinces = await processProvinces(provinceData?.provinces || []);

  // 处理学校事件
  const schoolEvents = await extractSchoolEvents(processedProvinces);

  return {
    provinces: {
      total: processedProvinces.reduce((sum, p) => sum + p.total, 0),
      provinces: processedProvinces
    },
    exam_events: examData?.exam_events || [],
    random_events: randomData?.random_events || [],
    school_events: schoolEvents,
    total: (examData?.exam_events?.length || 0) + 
          (randomData?.random_events?.length || 0) + 
          schoolEvents.length
  };
}

// 处理省份数据
async function processProvinces(provinces: ProvinceData[]): Promise<ProvinceData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return Promise.all(provinces.map(async (province) => {
    const processedCities = await Promise.all(
      province.cities.map(async (city) => {
        try {
          const cityData = await fetchJson<{ schools: SchoolData[] }>(
            `${baseUrl}${DATA_BASE_PATH}/events/provinces/${province.id}/${city.id}.json`
          );

          const schools: ProcessedSchoolData[] = (cityData?.schools || []).map(school => ({
            ...school,
            events: school.events || { start: [], special: [] },
            start_count: school.events?.start?.length || 0,
            special_count: school.events?.special?.length || 0
          }));

          const cityTotal = schools.reduce((sum, s) => sum + s.start_count + s.special_count, 0);

          return {
            ...city,
            schools,
            total: cityTotal
          };
        } catch (error) {
          console.warn(`Failed to load city ${city.id} in province ${province.id}:`, error);
          return { ...city, schools: [], total: 0 };
        }
      })
    );

    const provinceTotal = processedCities.reduce((sum, c) => sum + c.total, 0);

    return {
      ...province,
      cities: processedCities.filter(c => c.total > 0),
      total: provinceTotal
    };
  }));
}

// 从省份数据提取学校事件
async function extractSchoolEvents(provinces: ProvinceData[]): Promise<Event[]> {
  const schoolEvents: Event[] = [];

  for (const province of provinces) {
    for (const city of province.cities) {
      for (const school of city.schools) {
        const processEvent = (event: Partial<Event>, eventType: EventType) => {
          if (!event) return;
          
          schoolEvents.push({
            id: event.id || `${province.id}-${city.id}-${school.id}-${eventType}`,
            type: eventType,
            text: event.text || event.question || '',
            question: event.question || '',
            choices: event.choices || {},
            results: event.results || {},
            endGameChoices: event.endGameChoices || [],
            achievements: event.achievements || {},
            contributors: event.contributors || [],
            school: school.name,
            provinceId: province.id,
            cityId: city.id,
            schoolId: school.id
          });
        };

        school.events.start?.forEach(e => processEvent(e, EventType.SchoolStart));
        school.events.special?.forEach(e => processEvent(e, EventType.SchoolSpecial));
      }
    }
  }

  return schoolEvents;
}

// 按类型过滤数据
function filterByType(data: ApiResponse, type: EventType): ApiResponse {
  return {
    ...data,
    exam_events: type === EventType.Exam ? data.exam_events : [],
    random_events: type === EventType.Random ? data.random_events : [],
    school_events: [EventType.SchoolStart, EventType.SchoolSpecial].includes(type) 
      ? data.school_events.filter(e => e.type === type) 
      : [],
    total: 0 // 将在paginateEvents中重新计算
  };
}

// 分页处理
function paginateEvents(data: ApiResponse, page: number, limit: number): ApiResponse {
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginate = <T>(items: T[]) => ({
    items: items.slice(start, end),
    total: items.length,
    hasMore: end < items.length
  });

  const exam = paginate(data.exam_events);
  const random = paginate(data.random_events);
  const school = paginate(data.school_events);

  return {
    provinces: data.provinces,
    exam_events: exam.items,
    random_events: random.items,
    school_events: school.items,
    total: exam.total + random.total + school.total
  };
}

// 通用JSON获取函数
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: 'force-cache',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  return response.json();
}