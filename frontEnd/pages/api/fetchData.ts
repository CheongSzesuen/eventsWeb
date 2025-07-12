// frontEnd/pages/api/fetchData.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { ApiResponse, Event, RandomEvent, ProvinceData, CityData, SchoolData } from '@/types/events';

const fetchDataFile = <T>(filePath: string): T | null => {
  try {
    const fullPath = path.join(process.cwd(), 'src', 'data', filePath);
    if (fs.existsSync(fullPath)) {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(fileContent) as T;
    }
    console.warn(`File not found: ${filePath}`);
    return null;
  } catch (error) {
    console.error(`Failed to fetch data for file ${filePath}:`, error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const provinceCityMap: { [provinceKey: string]: { name: string, cities: { [cityKey: string]: string } } } | null = fetchDataFile('provinceCityMap.json');

      if (!provinceCityMap) {
        throw new Error('无法加载省份城市映射数据');
      }

      const provinces: ProvinceData[] = [];
      let totalEvents = 0;

      for (const [provinceId, provinceData] of Object.entries(provinceCityMap)) {
        const cities: CityData[] = [];
        let provinceTotal = 0;

        for (const [cityId, cityName] of Object.entries(provinceData.cities || {})) {
          const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
          const cityDataFile = fetchDataFile<{ schools: SchoolData[] }>(cityFilePath);
          if (!cityDataFile) {
            console.warn(`City file not found: ${cityFilePath}`);
            continue; // 如果城市数据文件为空，则跳过
          }

          const schools = cityDataFile.schools.map((school: SchoolData) => ({
            ...school,
            start_count: school.events.start?.length || 0,
            special_count: school.events.special?.length || 0
          }));

          const cityTotal = schools.reduce((acc, s) => acc + s.start_count + s.special_count, 0);
          provinceTotal += cityTotal;
          totalEvents += cityTotal;

          cities.push({
            id: cityId,
            name: cityName,
            schools,
            total: cityTotal
          });
        }

        if (cities.length > 0) {
          provinces.push({
            id: provinceId,
            name: provinceData.name,
            cities,
            total: provinceTotal
          });
        }
      }

      // 加载考试事件
      const examDataPath = 'events/exam/exam.json';
      const examDataFile = fetchDataFile<{ exam_events: Event[] }>(examDataPath);
      const examEvents = examDataFile?.exam_events?.map(event => ({
        ...event,
        type: 'exam' as const,
        school: ''
      })) || [];

      // 加载随机事件
      const randomDataPath = 'events/random.json';
      const randomDataFile = fetchDataFile<{ random_events: RandomEvent[] }>(randomDataPath);
      const randomEvents = randomDataFile?.random_events?.map(event => ({
        ...event,
        type: 'random' as const,
        school: ''
      })) || [];

      // 加载学校事件
      const schoolEvents: Event[] = provinces.flatMap(province => 
        province.cities.flatMap(city => 
          city.schools.flatMap(school => 
            school.events.start?.map(event => ({
              ...event,
              type: 'school_start' as const,
              school: school.id // 确保学校ID被正确传递
            })) || []
          )
        )
      );

      // 构建最终响应
      const response: ApiResponse = {
        provinces: {
          total: totalEvents,
          provinces
        },
        exam_events: examEvents,
        random_events: randomEvents,
        school_events: schoolEvents, // 添加学校事件
        total: totalEvents + examEvents.length + randomEvents.length + schoolEvents.length
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('加载分类数据失败:', error);
      res.status(500).json({ error: '无法加载分类数据' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
