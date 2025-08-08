/**
 * 基础事件类型（确保所有必需属性）
 */
export interface Event {
  id: string;
  type: EventType;
  question: string;
  text: string;
  choices: Record<string, string>;
  results: Record<string, string | ResultProbability[]>;
  endGameChoices?: string[];
  achievements?: Record<string, any>;
  contributors?: string[];
  // 学校特有属性
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
 * 概率结果类型
 */
export interface ResultProbability {
  text: string;
  prob: number;
  isEndGame?: boolean;
  achievement?: string;
}

/**
 * 学校数据结构（原始）
 */
export interface SchoolData {
  id: string;
  name: string;
  events: {
    start?: Event[];
    special?: Event[];
  };
}

/**
 * 处理后的学校数据（带统计字段）
 */
export interface ProcessedSchoolData {
  id: string;
  name: string;
  events: {
    start?: Event[];
    special?: Event[];
  };
  start_count: number;
  special_count: number;
}

/**
 * 城市数据结构
 */
export interface CityData {
  id: string;
  name: string;
  schools: ProcessedSchoolData[];
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
 * API响应格式
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
 * 提交数据格式（用于POST请求）
 */
export interface EventSubmission {
  type: EventType;
  question: string;
  text: string;
  choices: Record<string, string>;
  results: Record<string, string | ResultProbability[]>;
  randomResults?: Record<string, ResultProbability[]>;
  contributors: string[];
  recaptchaToken: string;
  // 学校特有字段
  provinceId?: string;
  cityId?: string;
  schoolId?: string;
  schoolZh?: string;
}

/**
 * 省份-城市映射信息
 */
export interface ProvinceInfo {
  name: string;
  cities: Record<string, string>;
}

/**
 * 省份-城市映射表
 */
export interface ProvinceCityMap {
  [provinceId: string]: ProvinceInfo;
}

/**
 * 学校名称映射表
 */
export interface SchoolMap {
  [schoolId: string]: string;
}

/**
 * 动态路由页面基础Props类型
 */
export interface DynamicRoutePageProps {
  params: {
    province: string;
    city: string;
    school: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * 学校页面Props类型（扩展基础类型）
 */
export interface SchoolPageProps extends DynamicRoutePageProps {
  // 可以添加学校页面特有的props
}

export interface PageParams {
  province: string;
  city: string;
  school: string;
}

export interface PageProps {
  params: PageParams;
  searchParams?: Record<string, string | string[] | undefined>;
}