// frontEnd/src/types/events.ts
export interface Event {
  id: string;
  question: string;
  choices: { [key: string]: string };
  results: { [key: string]: string | ResultProbability[] };
  end_game_choices?: string[];
  achievements?: { [key: string]: any };
  contributors?: string[];
  type: 'exam' | 'random' | 'school_start' | 'school_special';
  school?: string;
  provinceId?: string;
  cityId?: string;
  schoolId?: string;
}

export interface RandomEvent {
  id: string;
  question: string;
  choices: { [key: string]: string };
  results: { [key: string]: string | ResultProbability[] };
  end_game_choices?: string[];
  achievements?: { [key: string]: any };
  contributors?: string[];
  type: 'random';
  school?: string;
  provinceId?: string;
  cityId?: string;
  schoolId?: string;
}

export interface SchoolData {
  id: string;
  name: string;
  events: {
    start?: Event[];
    special?: Event[];
  };
  start_count: number;
  special_count: number;
}

export interface CityData {
  id: string;
  name: string;
  schools: SchoolData[];
  total: number;
}

export interface ProvinceData {
  id: string;
  name: string;
  cities: CityData[];
  total: number;
}

export interface ApiResponse {
  provinces: {
    total: number;
    provinces: ProvinceData[];
  };
  exam_events: Event[];
  random_events: RandomEvent[];
  school_events: Event[];
  total: number;
}

export interface ResultProbability {
  text: string;
  prob: number;
}
