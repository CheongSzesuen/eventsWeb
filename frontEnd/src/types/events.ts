
/**
 * 通用事件类型
 */
export interface Event {
  id: string;
  question: string;
  choices: Record<string, string>;
  results: Record<string, string | ResultProbability[]>;
  endGameChoices?: string[];
  achievements?: Record<string, any>;
  contributors?: string[];
  type: EventType;
  school?: string;
  provinceId?: string;
  cityId?: string;
  schoolId?: string;
}

/**
 * 事件类型枚举
 */
export enum EventType {
  Exam = 'exam',
  Random = 'random',
  SchoolStart = 'school_start',
  SchoolSpecial = 'school_special'
}

/**
 * 学校数据结构
 */
export interface SchoolData {
  id: string;
  name: string;
  events: {
    start?: Event[];
    special?: Event[];
  };
  start_count?: number;
  special_count?: number;
}

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
  cities: CityData[];
  total: number;
}

/**
 * API 响应格式
 */
export interface ApiResponse {
  provinces: {
    total: number;
    provinces: ProvinceData[];
  };
  exam_events: Event[];
  random_events: Event[];
  school_events: Event[];
  total: number;
}

/**
 * 概率结果类型
 */
export interface ResultProbability {
  text: string;
  prob: number;
}