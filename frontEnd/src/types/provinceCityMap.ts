import { SchoolData } from '@/types/events';

/**
 * 城市信息
 */
export interface CityInfo {
  name: string;
  schools?: SchoolData[];
}

/**
 * 省份信息
 */
export interface ProvinceInfo {
  name: string;
  cities: {
    [cityId: string]: string; // 城市ID到城市名的映射
  };
}

/**
 * 省份城市映射表
 */
export interface ProvinceCityMap {
  [provinceId: string]: {
    name: string;
    cities: {
      [cityId: string]: string;
    };
  };
}