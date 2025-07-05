// frontEnd/src/types/events.ts
export interface EventResult {
  text: string;
  prob?: number;          // 事件发生概率 (0-1)
  end_game?: boolean;     // 是否导致游戏结束
  achievement?: string;   // 关联的成就ID
}

export interface EventChoice {
  key: string;            // 选项键 (如 "1", "2", "3")
  text: string;           // 选项显示文本
  weight?: number;        // 选项权重 (影响随机概率)
}

export interface Event {
  id: string;             // 事件唯一标识
  question: string;      // 事件问题文本
  choices: Record<string, string>;          // 选项列表
  results: Record<string, string | EventResult[]>; // 结果 (支持简单文本或复杂结果)
  end_game_choices?: string[];              // 会导致游戏结束的选项键
  achievements?: Record<string, string>;     // 关联的成就
  contributors?: string[];                   // 贡献者列表
  tags?: string[];                            // 事件标签 (新增)
  min_grade?: number;                        // 最低年级要求 (新增)
}

export interface EventGroup {
  name: string;           // 分组名称
  count: number;          // 分组内事件数量
  description?: string;   // 分组描述 (新增)
}


export interface ApiResponse {
  events: Record<string, Event[]>; // 分组事件
  random_events: Event[];  // 随机事件
  statistics?: {           // 统计信息 (新增)
    total_events: number;
    average_choices: number;
  };
}

// 扩展类型 - 用于前端特殊处理
export interface UIExtendedEvent extends Event {
  _highlight?: boolean;    // 是否高亮显示
  _searchMatch?: {         // 搜索匹配信息
    field: 'question' | 'choice' | 'result';
    text: string;
  };
}
// 在现有类型基础上添加
export interface SearchResultHighlight {
  field: 'question' | 'choice' | 'result';
  matchText: string;
  startPos: number;
  endPos: number;
}

export interface SearchResultEvent extends Event {
  _highlight?: SearchResultHighlight[];
}
