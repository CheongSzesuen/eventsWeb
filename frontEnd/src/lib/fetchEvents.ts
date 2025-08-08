import { ApiResponse, Event, ProvinceData, CityData, SchoolData, ProcessedSchoolData, ResultProbability, EventType } from '@/types/events';
import provinceCityMap from '@/public/data/provinceCityMap.json';

// 定义省份城市映射类型
interface ProvinceInfo {
  name: string;
  cities: Record<string, string>;
}

interface ProvinceCityMap {
  [key: string]: ProvinceInfo;
}

// 使用类型断言确保类型安全
const typedProvinceCityMap = provinceCityMap as unknown as ProvinceCityMap;

// 增强的 Event 类型，确保包含所有必要属性
interface CompleteEvent extends Event {
  text: string;
  question: string;
  choices: Record<string, string>;
  results: Record<string, string | ResultProbability[]>;
}

type FetchConfig = {
  basePath?: string;
  cache?: RequestCache;
  retries?: number;
  defaultValue?: any;
};

const BASE_PATH = '/data';
const DEFAULT_CONFIG: FetchConfig = {
  basePath: BASE_PATH,
  cache: 'force-cache',
  retries: 1,
};

// 新增：快速检查文件是否存在的函数
async function checkFileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export const fetchEvents = async (config?: FetchConfig): Promise<ApiResponse> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 1. 使用类型断言后的省份城市数据
  const provinceCityData = typedProvinceCityMap;

  // 2. 并行加载其他数据
  const [examData, randomData] = await Promise.all([
    fetchDataFile<{ exam_events: Partial<CompleteEvent>[] }>(
      'events/exam/exam.json',
      { ...finalConfig, defaultValue: { exam_events: [] } }
    ),
    fetchDataFile<{ random_events: Partial<CompleteEvent>[] }>(
      'events/random.json',
      { ...finalConfig, defaultValue: { random_events: [] } }
    )
  ]);

  // 3. 处理省份数据
  const provinces: ProvinceData[] = [];
  let provinceEventTotal = 0;

  await Promise.all(
    Object.entries(provinceCityData).map(async ([provinceId, provinceInfo]) => {
      const cities: CityData[] = [];

      await Promise.all(
        Object.entries(provinceInfo.cities).map(async ([cityId, cityName]) => {
          // 先检查文件是否存在
          const cityUrl = new URL(
            `${finalConfig.basePath || BASE_PATH}/events/provinces/${provinceId}/${cityId}.json`,
            appUrl
          ).toString();
          
          if (!await checkFileExists(cityUrl)) return;

          try {
            const cityData = await fetchDataFile<{ schools: SchoolData[] }>(
              `events/provinces/${provinceId}/${cityId}.json`,
              { ...finalConfig, defaultValue: { schools: [] } }
            );

            const schools: ProcessedSchoolData[] = (cityData?.schools || []).map((school) => ({
              ...school,
              id: school.id || `${provinceId}-${cityId}-${school.name}`,
              events: school.events || { start: [], special: [] },
              start_count: school.events?.start?.length || 0,
              special_count: school.events?.special?.length || 0
            }));

            const cityTotal = schools.reduce(
              (sum: number, school) => sum + school.start_count + school.special_count,
              0
            );

            if (cityTotal > 0) {
              cities.push({
                id: cityId,
                name: cityName,
                schools,
                total: cityTotal
              });
            }
          } catch (error) {
            console.warn(`Failed to process city ${cityId} in province ${provinceId}:`, error);
          }
        })
      );

      if (cities.length > 0) {
        const provinceTotal = cities.reduce((sum, c) => sum + c.total, 0);
        provinces.push({
          id: provinceId,
          name: provinceInfo.name,
          cities,
          total: provinceTotal
        });
        provinceEventTotal += provinceTotal;
      }
    })
  );

  // 4. 处理考试事件
  const examEvents: CompleteEvent[] = (examData?.exam_events || []).map(event => ({
    ...event,
    type: EventType.Exam,
    id: event.id || `exam-${event.question?.substring(0, 10)}`,
    text: event.text || event.question || '',
    question: event.question || '',
    choices: event.choices || {},
    results: event.results || {},
    endGameChoices: event.endGameChoices || [],
    achievements: event.achievements || {},
    contributors: event.contributors || []
  }));

  // 5. 处理随机事件
  const randomEvents: CompleteEvent[] = (randomData?.random_events || []).map(event => ({
    ...event,
    type: EventType.Random,
    id: event.id || `random-${event.question?.substring(0, 10)}`,
    text: event.text || event.question || '',
    question: event.question || '',
    choices: event.choices || {},
    results: event.results || {},
    endGameChoices: event.endGameChoices || [],
    achievements: event.achievements || {},
    contributors: event.contributors || []
  }));

  // 6. 生成学校事件
  const schoolEvents: CompleteEvent[] = [];
  provinces.forEach(province => {
    province.cities.forEach(city => {
      city.schools.forEach(school => {
        (school.events.start || []).forEach(event => {
          schoolEvents.push({
            ...event,
            type: EventType.SchoolStart,
            school: school.name,
            provinceId: province.id,
            cityId: city.id,
            schoolId: school.id,
            id: event.id || `${province.id}-${city.id}-${school.id}-start-${event.question?.substring(0, 5)}`,
            text: event.text || event.question || '',
            question: event.question || '',
            choices: event.choices || {},
            results: event.results || {},
            endGameChoices: event.endGameChoices || [],
            achievements: event.achievements || {},
            contributors: event.contributors || []
          });
        });
        (school.events.special || []).forEach(event => {
          schoolEvents.push({
            ...event,
            type: EventType.SchoolSpecial,
            school: school.name,
            provinceId: province.id,
            cityId: city.id,
            schoolId: school.id,
            id: event.id || `${province.id}-${city.id}-${school.id}-special-${event.question?.substring(0, 5)}`,
            text: event.text || event.question || '',
            question: event.question || '',
            choices: event.choices || {},
            results: event.results || {},
            endGameChoices: event.endGameChoices || [],
            achievements: event.achievements || {},
            contributors: event.contributors || []
          });
        });
      });
    });
  });

  // 7. 计算总数
  const totalEvents = provinceEventTotal + examEvents.length + randomEvents.length + schoolEvents.length;

  return {
    provinces: {
      total: provinceEventTotal,
      provinces
    },
    exam_events: examEvents,
    random_events: randomEvents,
    school_events: schoolEvents,
    total: totalEvents
  };
};

// 辅助函数：通用数据加载
async function fetchDataFile<T>(filePath: string, config: FetchConfig = DEFAULT_CONFIG): Promise<T | null> {
  const effectiveBasePath = config.basePath ?? BASE_PATH;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const absoluteUrl = new URL(`${effectiveBasePath}/${filePath}`, appUrl).toString();

  try {
    const response = await fetch(absoluteUrl, {
      cache: config.cache,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return config.defaultValue ?? null;
      }
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${absoluteUrl}:`, error);
    return config.defaultValue ?? null;
  }
}

// 辅助函数：获取省份数据
export const getProvinceData = async (
  provinceId: string, 
  config?: FetchConfig
): Promise<ProvinceData | null> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    // 使用类型断言后的数据
    const provinceInfo = typedProvinceCityMap[provinceId];
    if (!provinceInfo) return null;

    const cityPromises = Object.entries(provinceInfo.cities || {}).map(
      async ([cityId, cityName]) => {
        const cityUrl = new URL(
          `${finalConfig.basePath || BASE_PATH}/events/provinces/${provinceId}/${cityId}.json`,
          appUrl
        ).toString();
        
        if (!await checkFileExists(cityUrl)) return null;

        try {
          const cityData = await fetchDataFile<{ schools: SchoolData[] }>(
            `events/provinces/${provinceId}/${cityId}.json`,
            { ...finalConfig, defaultValue: { schools: [] } }
          );

          const schools: ProcessedSchoolData[] = (cityData?.schools || []).map((school) => ({
            ...school,
            events: school.events || { start: [], special: [] },
            start_count: school.events?.start?.length || 0,
            special_count: school.events?.special?.length || 0
          }));

          const cityTotal = schools.reduce(
            (sum: number, school) => sum + school.start_count + school.special_count,
            0
          );

          return cityTotal > 0
            ? { 
                id: cityId, 
                name: cityName, 
                schools, 
                total: cityTotal 
              } as CityData
            : null;
        } catch (error) {
          console.warn(`Failed to process city ${cityId} in province ${provinceId}:`, error);
          return null;
        }
      }
    );

    const cities = (await Promise.all(cityPromises))
      .filter((city): city is CityData => city !== null);

    return {
      id: provinceId,
      name: provinceInfo.name,
      cities,
      total: cities.reduce((sum, city) => sum + city.total, 0)
    };
  } catch (error) {
    console.error(`Failed to load province data for ${provinceId}:`, error);
    return null;
  }
};

// 辅助函数：获取城市数据
export const getCityData = async (
  provinceId: string,
  cityId: string,
  config?: FetchConfig
): Promise<CityData | null> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // 使用类型断言后的数据
    const cityName = typedProvinceCityMap[provinceId]?.cities?.[cityId];
    if (!cityName) return null;

    const cityUrl = new URL(
      `${finalConfig.basePath || BASE_PATH}/events/provinces/${provinceId}/${cityId}.json`,
      appUrl
    ).toString();
    
    if (!await checkFileExists(cityUrl)) return null;

    const cityData = await fetchDataFile<{ schools: SchoolData[] }>(
      `events/provinces/${provinceId}/${cityId}.json`,
      { ...finalConfig, defaultValue: { schools: [] } }
    );

    const schools: ProcessedSchoolData[] = (cityData?.schools || []).map((school) => ({
      ...school,
      events: school.events || { start: [], special: [] },
      start_count: school.events?.start?.length || 0,
      special_count: school.events?.special?.length || 0
    }));

    const cityTotal = schools.reduce(
      (sum: number, school) => sum + school.start_count + school.special_count,
      0
    );

    return {
      id: cityId,
      name: cityName,
      schools,
      total: cityTotal
    };
  } catch (error) {
    console.error(`Failed to load city data for ${provinceId}/${cityId}:`, error);
    return null;
  }
};

// 辅助函数：获取城市下的学校
export const getSchoolsByCity = async (
  provinceName: string,
  cityName: string,
  config?: FetchConfig
): Promise<SchoolData[]> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // 使用类型断言后的数据
    const provinceEntry = Object.entries(typedProvinceCityMap).find(
      ([, info]) => info.name === provinceName
    );
    if (!provinceEntry) return [];

    const [provinceId] = provinceEntry;
    const cityEntry = Object.entries(provinceEntry[1].cities).find(
      ([, name]) => name === cityName
    );
    if (!cityEntry) return [];

    const [cityId] = cityEntry;
    
    const cityUrl = new URL(
      `${finalConfig.basePath || BASE_PATH}/events/provinces/${provinceId}/${cityId}.json`,
      appUrl
    ).toString();
    
    if (!await checkFileExists(cityUrl)) return [];

    const cityData = await fetchDataFile<{ schools: SchoolData[] }>(
      `events/provinces/${provinceId}/${cityId}.json`,
      { ...finalConfig, defaultValue: { schools: [] } }
    );

    return cityData?.schools || [];
  } catch (error) {
    console.error(`Failed to get schools for ${provinceName}/${cityName}:`, error);
    return [];
  }
};