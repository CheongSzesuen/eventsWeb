// frontEnd/utils/mapService.ts
import provinceCityMap from '@/public/data/provinceCityMap.json';
import schoolMap from '@/public/data/schoolMap.json';

// 定义类型
interface ProvinceInfo {
  name: string;
  cities: Record<string, string>;
}

type ProvinceCityMap = Record<string, ProvinceInfo>;

// 强制类型转换
const typedProvinceCityMap = provinceCityMap as ProvinceCityMap;

export function getProvinceName(provinceId: string): string {
  return typedProvinceCityMap[provinceId]?.name || '未知省份';
}

export function getCityName(provinceId: string, cityId: string): string {
  return typedProvinceCityMap[provinceId]?.cities?.[cityId] || '未知城市';
}

export function getSchoolName(schoolId: string): string {
  return (schoolMap as Record<string, string>)[schoolId] || '未知学校';
}