// frontEnd/utils/mapService.ts
import provinceCityMap from '@/data/provinceCityMap.json';
import schoolMap from '@/data/schoolMap.json';

export function getProvinceName(provinceId: string): string {
  return provinceCityMap[provinceId]?.name || '未知省份';
}

export function getCityName(provinceId: string, cityId: string): string {
  return provinceCityMap[provinceId]?.cities?.[cityId] || '未知城市';
}

export function getSchoolName(schoolId: string): string {
  return schoolMap[schoolId] || '未知学校';
}
