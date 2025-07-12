// frontEnd/src/types/provinceCityMap.ts
import { SchoolData } from '@/types/events';

export interface CityData {
  id: string;
  name: string;
  schools: SchoolData[];
  total: number;
}

export interface ProvinceData {
  id: string;
  name: string;
  cities: {
    [cityKey: string]: CityData;
  };
  schools?: SchoolData[];
  total?: number;
}

export interface ProvinceCityMap {
  [provinceKey: string]: ProvinceData;
}
