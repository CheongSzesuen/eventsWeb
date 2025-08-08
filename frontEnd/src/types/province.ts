// lib/types/province.ts
export interface ProvinceInfo {
  name: string;
  cities: Record<string, string>;
}

export type ProvinceCityMap = Record<string, ProvinceInfo>;