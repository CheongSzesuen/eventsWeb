import { ApiResponse, Event, RandomEvent, ProvinceData, CityData, SchoolData } from '@/types/events';

// 定义请求配置类型
type FetchConfig = {
  basePath?: string;
  cache?: RequestCache;
  retries?: number;
};

// 统一获取数据基础路径
const getBasePath = () => {
  return '/data'; // 所有环境下都使用相对路径
};

// 默认配置对象（只声明一次！）
const DEFAULT_CONFIG: FetchConfig = {
  basePath: getBasePath(),
  cache: 'force-cache',
  retries: 3
};

// 缓存未找到的文件路径，避免重复请求
const notFoundCache = new Set<string>();

/**
 * 通用数据加载函数
 */
export async function fetchDataFile<T>(
  filePath: string,
  config: FetchConfig = DEFAULT_CONFIG
): Promise<T | null> {
  let attempt = 0;
  const maxAttempts = config.retries || 3;

  if (notFoundCache.has(filePath)) {
    console.log(`[CACHE] 跳过已知缺失文件: ${filePath}`);
    return null;
  }

  while (attempt <= maxAttempts) {
    try {
      const url = new URL(filePath, `${config.basePath}/`).toString();
      console.log(`[FETCH] 正在请求: ${url}`);
      const response = await fetch(url, {
        cache: config.cache,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'fetchEvents'
        }
      });

      if (response.status === 404) {
        notFoundCache.add(filePath);
        console.warn(`[NOT FOUND] 文件不存在: ${filePath}`);
        return null;
      } else if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[SUCCESS] 成功加载: ${filePath}`);
      return data as T;
    } catch (error) {
      attempt++;
      console.error(`[ATTEMPT ${attempt}/${maxAttempts}] ${filePath}:`, error);
      if (attempt > maxAttempts) {
        console.error(`[FATAL] 加载失败: ${filePath}`);
        notFoundCache.add(filePath);
        return null;
      }
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  return null;
}

/**
 * 异步获取所有事件数据
 */
export const fetchEvents = async (
  config?: FetchConfig
): Promise<ApiResponse> => {
  const loadWithFallback = async <T>(filePath: string, defaultValue: T) => {
    try {
      const data = await fetchDataFile<T>(filePath, { ...DEFAULT_CONFIG, ...config });
      return data || defaultValue;
    } catch (error) {
      console.error(`加载 ${filePath} 失败，使用默认值:`, error);
      return defaultValue;
    }
  };

  // 并行加载主要数据源
  const [provinceData, examData, randomData] = await Promise.all([
    loadWithFallback<Record<string, { name: string, cities: Record<string, string>}>>(
      'provinceCityMap.json',
      {}
    ),
    loadWithFallback<{ exam_events: Event[] }>('events/exam/exam.json', {
      exam_events: []
    }),
    loadWithFallback<{ random_events: RandomEvent[] }>('events/random.json', {
      random_events: []
    })
  ]);

  // 解析省份与城市数据
  const provinces: ProvinceData[] = [];
  let totalEvents = 0;

  for (const [provinceId, provinceInfo] of Object.entries(provinceData)) {
    const cities: CityData[] = [];
    let provinceTotal = 0;

    if (!provinceInfo || typeof provinceInfo !== 'object' || !provinceInfo.cities) {
      console.warn(`[SKIP] 无效省份结构: ${provinceId}`);
      continue;
    }

    for (const [cityId, cityName] of Object.entries(provinceInfo.cities)) {
      const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
      const cityData = await loadWithFallback<{ schools: SchoolData[] }>(
        cityFilePath,
        { schools: [] }
      );

      if (!cityData) {
        console.warn(`[SKIP] 文件不存在: ${cityFilePath}`);
        continue;
      }

      const schools = cityData.schools.map(school => ({
        ...school,
        events: school.events || { start: [], special: [] },
        start_count: school.events.start?.length || 0,
        special_count: school.events.special?.length || 0
      }));

      const cityTotal = schools.reduce(
        (acc, s) => acc + s.start_count + s.special_count,
        0
      );

      if (cityTotal > 0) {
        provinceTotal += cityTotal;
        totalEvents += cityTotal;
        cities.push({
          id: cityId,
          name: cityName,
          schools,
          total: cityTotal
        });
      }
    }

    if (cities.length > 0) {
      provinces.push({
        id: provinceId,
        name: provinceInfo.name,
        cities,
        total: provinceTotal
      });
    }
  }

  // 处理考试事件
  const examEvents = (examData.exam_events || []).map(event => ({
    ...event,
    type: 'exam' as const,
    school: event.school || '',
    provinceId: event.provinceId || '',
    cityId: event.cityId || '',
    schoolId: event.schoolId || ''
  }));

  // 处理随机事件
  const randomEvents = (randomData.random_events || []).map(event => ({
    ...event,
    type: 'random' as const,
    school: event.school || '',
    provinceId: event.provinceId || '',
    cityId: event.cityId || '',
    schoolId: event.schoolId || ''
  }));

  // 处理学校事件
  const schoolEvents: Event[] = [];

  for (const [provinceId, provinceInfo] of Object.entries(provinceData)) {
    if (!provinceInfo || !provinceInfo.cities) {
      console.warn(`[SKIP] 无效省份结构: ${provinceId}`);
      continue;
    }

    for (const [cityId, _] of Object.entries(provinceInfo.cities)) {
      const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
      const cityData = await loadWithFallback<{ schools: SchoolData[] }>(
        cityFilePath,
        { schools: [] }
      );

      if (!cityData) {
        console.warn(`[SKIP] 文件不存在: ${cityFilePath}`);
        continue;
      }

      for (const school of cityData.schools) {
        for (const event of school.events.start || []) {
          schoolEvents.push({
            ...event,
            type: 'school_start' as const,
            question: event.question || '未命名学校事件',
            choices: event.choices || {},
            results: event.results || {},
            school: school.name || 'unknown_school',
            provinceId,
            cityId,
            schoolId: school.id
          });
        }

        for (const event of school.events.special || []) {
          schoolEvents.push({
            ...event,
            type: 'school_special' as const,
            question: event.question || '未命名学校事件',
            choices: event.choices || {},
            results: event.results || {},
            school: school.name || 'unknown_school',
            provinceId,
            cityId,
            schoolId: school.id
          });
        }
      }
    }
  }

  // 构建最终响应
  return {
    provinces: {
      total: totalEvents,
      provinces
    },
    exam_events: examEvents,
    random_events: randomEvents,
    school_events: schoolEvents,
    total:
      totalEvents +
      examEvents.length +
      randomEvents.length +
      schoolEvents.length
  };
};

/**
 * 获取指定省份的数据
 */
export const getProvinceData = async (
  provinceId: string
): Promise<ProvinceData | null> => {
  const provinceCityMap = await fetchDataFile<
    Record<string, { name: string, cities: Record<string, string> }>
  >('provinceCityMap.json');

  if (!provinceCityMap) {
    console.error('省份城市数据加载失败');
    return null;
  }

  const provinceInfo = provinceCityMap[provinceId];

  if (!provinceInfo) {
    console.error(`无效省份ID: ${provinceId}`);
    return null;
  }

  const cities: CityData[] = [];
  let provinceTotal = 0;

  for (const [cityId, cityName] of Object.entries(provinceInfo.cities || {})) {
    const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
    const cityData = await fetchDataFile<{ schools: SchoolData[] }>(cityFilePath);

    if (!cityData) {
      console.warn(`[SKIP] 文件不存在: ${cityFilePath}`);
      continue;
    }

    const schools = cityData.schools.map(school => ({
      ...school,
      events: school.events || { start: [], special: [] },
      start_count: school.events.start?.length || 0,
      special_count: school.events.special?.length || 0
    }));

    const cityTotal = schools.reduce(
      (acc, s) => acc + s.start_count + s.special_count,
      0
    );

    if (cityTotal > 0) {
      provinceTotal += cityTotal;
      cities.push({
        id: cityId,
        name: cityName,
        schools,
        total: cityTotal
      });
    }
  }

  if (cities.length === 0) {
    return null;
  }

  return {
    id: provinceId,
    name: provinceInfo.name,
    cities,
    total: provinceTotal
  };
};

/**
 * 获取指定城市的学校数据
 */
export const getCityData = async (
  provinceId: string,
  cityId: string
): Promise<CityData | null> => {
  const provinceCityMap = await fetchDataFile<
    Record<string, { name: string, cities: Record<string, string> }>
  >('provinceCityMap.json');

  if (!provinceCityMap) {
    console.error('省份城市数据加载失败');
    return null;
  }

  const provinceKeys = Object.keys(provinceCityMap);

  if (!provinceKeys.includes(provinceId)) {
    console.error(`无效省份ID: ${provinceId}`);
    return null;
  }

  const cityKeys = Object.keys(provinceCityMap[provinceId].cities || {});

  if (!cityKeys.includes(cityId)) {
    console.error(`无效城市ID: ${provinceId}/${cityId}`);
    return null;
  }

  const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
  const cityData = await fetchDataFile<{ schools: SchoolData[] }>(cityFilePath);

  if (!cityData) {
    console.warn(`[SKIP] 文件不存在: ${cityFilePath}`);
    return null;
  }

  const schools = cityData.schools.map(school => ({
    ...school,
    events: school.events || { start: [], special: [] },
    start_count: school.events.start?.length || 0,
    special_count: school.events.special?.length || 0
  }));

  const cityTotal = schools.reduce(
    (acc, s) => acc + s.start_count + s.special_count,
    0
  );

  if (cityTotal === 0) {
    return null;
  }

  return {
    id: cityId,
    name: provinceCityMap[provinceId].cities[cityId],
    schools,
    total: cityTotal
  };
};

/**
 * 获取指定城市下的所有学校
 */
export const getSchoolsByCity = async (
  provinceId: string,
  cityId: string
): Promise<SchoolData[]> => {
  const provinceCityMap = await fetchDataFile<
    Record<string, { name: string, cities: Record<string, string> }>
  >('provinceCityMap.json');

  if (!provinceCityMap) {
    console.error('省份城市数据加载失败');
    return [];
  }

  const provinceKeys = Object.keys(provinceCityMap);

  if (!provinceKeys.includes(provinceId)) {
    console.error(`无效省份ID: ${provinceId}`);
    return [];
  }

  const cityKeys = Object.keys(provinceCityMap[provinceId].cities || {});

  if (!cityKeys.includes(cityId)) {
    console.error(`无效城市ID: ${provinceId}/${cityId}`);
    return [];
  }

  const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
  const cityData = await fetchDataFile<{ schools: SchoolData[] }>(cityFilePath);

  if (!cityData) {
    console.warn(`[SKIP] 文件不存在: ${cityFilePath}`);
    return [];
  }

  return cityData.schools.map(school => ({
    ...school,
    events: school.events || { start: [], special: [] },
    start_count: school.events.start?.length || 0,
    special_count: school.events.special?.length || 0
  }));
};