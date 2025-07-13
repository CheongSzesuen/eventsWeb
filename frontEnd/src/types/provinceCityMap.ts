// frontEnd/src/types/provinceCityMap.ts
import { SchoolData } from '@/types/events';

/**
 * 城市数据结构
 */
export interface CityData {
  id: string;
  name: string;
  schools: SchoolData[];
  total: number;
}

/**
 * 省份数据结构
 */
export interface ProvinceData {
  id: string;
  name: string;
  cities: {
    [cityKey: string]: CityData;
  };
  schools?: SchoolData[];
  total?: number;
}

/**
 * 省份城市映射表
 */
export interface ProvinceCityMap {
  [provinceKey: string]: ProvinceData;
}