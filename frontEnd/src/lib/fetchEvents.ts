import { ApiResponse, Event,ProvinceData, CityData, SchoolData, ProcessedSchoolData } from '@/types/events';
import { EventType } from '@/types/events';

type FetchConfig = {
  basePath?: string;
  cache?: RequestCache;
  retries?: number;
};

const BASE_PATH = '/data';
const DEFAULT_CONFIG: FetchConfig = {
  basePath: BASE_PATH,
  cache: 'force-cache',
  retries: 1,
};

// 缓存已知缺失的文件路径
export const notFoundCache = new Set<string>();
// 防止并发重复请求
const inflightRequests = new Map<string, Promise<any>>();

/**
 * 通用数据加载函数
 */
export async function fetchDataFile<T>(
  filePath: string,
  config: FetchConfig = DEFAULT_CONFIG
): Promise<T | null> {
  if (notFoundCache.has(filePath)) {
    console.log(`[CACHE] Skipping known missing file: ${filePath}`);
    return null;
  }

  if (inflightRequests.has(filePath)) {
    console.log(`[IN-FLIGHT] Reusing in-flight request for: ${filePath}`);
    return inflightRequests.get(filePath);
  }

  const maxAttempts = config.retries ?? 1;
  const effectiveBasePath = config.basePath ?? BASE_PATH;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const absoluteUrl = new URL(`${effectiveBasePath}/${filePath}`, appUrl).toString();

  const requestPromise = (async () => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        console.log(`[FETCH] Requesting: ${absoluteUrl} (Attempt ${attempt + 1})`);
        const response = await fetch(absoluteUrl, {
          cache: config.cache,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Source': 'fetchEvents'
          }
        });

        if (response.status === 404) {
          notFoundCache.add(filePath);
          console.warn(`[NOT FOUND] File does not exist: ${absoluteUrl}`);
          return null;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[SUCCESS] Successfully loaded: ${absoluteUrl}`);
        return data as T;
      } catch (error) {
        attempt++;
        console.error(`[ATTEMPT ${attempt}/${maxAttempts}] Failed to load ${absoluteUrl}:`, error);
        if (attempt >= maxAttempts) {
          console.error(`[FATAL] All attempts failed for: ${absoluteUrl}`);
          notFoundCache.add(filePath);
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 200));
      }
    }
    return null;
  })();

  inflightRequests.set(filePath, requestPromise);
  return requestPromise.finally(() => {
    inflightRequests.delete(filePath);
  });
}

/**
 * 加载所有事件数据
 */
export const fetchEvents = async (
  config?: FetchConfig
): Promise<ApiResponse> => {
  const loadWithFallback = async <T>(filePath: string, defaultValue: T) => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const data = await fetchDataFile<T>(filePath, finalConfig);
    if (data === null) {
      console.warn(`Loading ${filePath} failed, using default value.`);
      return defaultValue;
    }
    return data;
  };

  const [provinceData, examData, randomData] = await Promise.all([
    loadWithFallback<Record<string, { name: string; cities: Record<string, string> }>>(
      'provinceCityMap.json',
      {}
    ),
    loadWithFallback<{ exam_events: Event[] }>('events/exam/exam.json', {
      exam_events: [],
    }),
    loadWithFallback<{ random_events: Event[]; }>('events/random.json', {
      random_events: [],
    }),
  ]);

  const provinces: ProvinceData[] = [];
  let totalEvents = 0;

  for (const [provinceId, provinceInfo] of Object.entries(provinceData)) {
    if (!provinceInfo?.cities) {
      console.warn(`[SKIP] Invalid province structure: ${provinceId}`);
      continue;
    }

    const cityPromises = Object.entries(provinceInfo.cities).map(
      async ([cityId, cityName]) => {
        const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
        const cityData = await loadWithFallback<{ schools: SchoolData[] }>(
          cityFilePath,
          { schools: [] }
        );

        if (!cityData.schools || cityData.schools.length === 0) {
          return null;
        }

        const schools = cityData.schools.map((school): ProcessedSchoolData => ({
  ...school,
  events: school.events || { start: [], special: [] },
  start_count: school.events.start?.length || 0,
  special_count: school.events.special?.length || 0,
}));

        const cityTotal = schools.reduce(
          (acc, s) => acc + s.start_count + s.special_count,
          0
        );

        if (cityTotal > 0) {
          return {
            id: cityId,
            name: cityName,
            schools,
            total: cityTotal,
          };
        }

        return null;
      }
    );

   const cities = (await Promise.all(cityPromises))
  .filter((c): c is CityData => c !== null) as CityData[];

    if (cities.length > 0) {
      const provinceTotal = cities.reduce((acc, c) => acc + c.total, 0);
      totalEvents += provinceTotal;
      provinces.push({
        id: provinceId,
        name: provinceInfo.name,
        cities,
        total: provinceTotal,
      });
    }
  }

  const examEvents = (examData.exam_events || []).map((event) => ({
    ...event,
    type: EventType.Exam,
  }));

  const randomEvents = (randomData.random_events || []).map((event) => ({
    ...event,
    type: EventType.Random,
  }));

  const schoolEvents: Event[] = [];

  provinces.forEach((province) => {
    province.cities.forEach((city) => {
      city.schools.forEach((school) => {
        (school.events.start || []).forEach((event) => {
          schoolEvents.push({
            ...event,
            type: EventType.SchoolStart,
            school: school.name,
            provinceId: province.id,
            cityId: city.id,
            schoolId: school.id,
          });
        });
        (school.events.special || []).forEach((event) => {
          schoolEvents.push({
            ...event,
            type: EventType.SchoolSpecial,
            school: school.name,
            provinceId: province.id,
            cityId: city.id,
            schoolId: school.id,
          });
        });
      });
    });
  });

  return {
    provinces: {
      total: totalEvents,
      provinces,
    },
    exam_events: examEvents,
    random_events: randomEvents,
    school_events: schoolEvents,
    total: totalEvents + examEvents.length + randomEvents.length,
  };
};

/**
 * 获取省份数据
 */
export const getProvinceData = async (
  provinceId: string
): Promise<ProvinceData | null> => {
  const provinceCityMap = await fetchDataFile<
    Record<string, { name: string; cities: Record<string, string> }>
  >('provinceCityMap.json');

  const provinceInfo = provinceCityMap?.[provinceId];

  if (!provinceInfo) {
    console.error(`Failed to load province map or invalid province ID: ${provinceId}`);
    return null;
  }

  const cityPromises = Object.entries(provinceInfo.cities || {}).map(
    async ([cityId, cityName]) => {
      const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
      const cityData = await fetchDataFile<{ schools: SchoolData[] }>(cityFilePath);

      if (!cityData) return null;

      const schools = cityData.schools.map((school): ProcessedSchoolData => ({
  ...school,
  events: school.events || { start: [], special: [] },
  start_count: school.events.start?.length || 0,
  special_count: school.events.special?.length || 0,
}));

      const cityTotal = schools.reduce(
        (acc, s) => acc + s.start_count + s.special_count,
        0
      );

      return cityTotal > 0
        ? { id: cityId, name: cityName, schools, total: cityTotal }
        : null;
    }
  );

 const cities = (await Promise.all(cityPromises))
  .filter((c): c is CityData => c !== null) as CityData[];

  if (cities.length === 0) return null;

  const provinceTotal = cities.reduce((acc, c) => acc + c.total, 0);

  return {
    id: provinceId,
    name: provinceInfo.name,
    cities,
    total: provinceTotal,
  };
};

/**
 * 获取城市数据
 */
export const getCityData  = async (
  provinceId: string,
  cityId: string
): Promise<CityData | null> => {
  const provinceCityMap = await fetchDataFile<
    Record<string, { name: string; cities: Record<string, string> }>
  >('provinceCityMap.json');

  const cityName = provinceCityMap?.[provinceId]?.cities?.[cityId];

  if (!cityName) {
    console.error(`Invalid province/city ID: ${provinceId}/${cityId}`);
    return null;
  }

  const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
  const cityData = await fetchDataFile<{ schools: SchoolData[] }>(cityFilePath);

  if (!cityData) {
    // 如果城市数据不存在，返回一个空结构而非 null
    return {
      id: cityId,
      name: cityName,
      schools: [],
      total: 0,
    };
  }

  const schools = cityData.schools.map((school): ProcessedSchoolData => ({
  ...school,
  events: school.events || { start: [], special: [] },
  start_count: school.events.start?.length || 0,
  special_count: school.events.special?.length || 0,
}));

  const cityTotal = schools.reduce(
    (acc, s) => acc + s.start_count + s.special_count,
    0
  );

  return {
    id: cityId,
    name: cityName,
    schools,
    total: cityTotal,
  };
};

/**
 * 获取城市下的所有学校
 */
export const getSchoolsByCity = async (
  provinceId: string,
  cityId: string
): Promise<SchoolData[]> => {
  const cityData = await getCityData (provinceId, cityId);
  return cityData?.schools || [];
};