export interface EventResult {
  text: string;
  prob?: number;
  end_game?: boolean;
}

export interface Event {
  id: string;
  question: string;
  choices: Record<string, string>;
  results: Record<string, string | EventResult[]>;
  end_game_choices?: string[];
  achievements?: Record<string, string>;
  contributors?: string[];
}

export interface EventGroup {
  name: string;
  count: number;
}

export interface ApiResponse {
  metadata: { start_options: string[] };
  events: Record<string, Event[]>;
  random_events: Event[];
}