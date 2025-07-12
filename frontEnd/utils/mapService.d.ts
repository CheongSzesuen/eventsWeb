// frontEnd/utils/mapService.d.ts
declare module '@/utils/mapService' {
  export const getProvinceName: (provinceId: string) => string;
  export const getCityName: (provinceId: string, cityId: string) => string;
  export const getSchoolName: (schoolId: string) => string;
}
