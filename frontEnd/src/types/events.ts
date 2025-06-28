/**
 * 事件结果类型定义
 */
export interface EventResult {
  text: string;          // 结果文本
  prob?: number;         // 触发概率 (0-1)
  end_game?: boolean;    // 是否导致游戏结束
}

/**
 * 单个事件完整定义
 */
export interface Event {
  id: string;                     // 事件唯一ID
  question: string;               // 问题描述（以>>>开头的需要特殊处理）
  choices: Record<string, string>; // 选项键值对
  results: Record<string, string | EventResult[]>; // 每个选项对应的结果
  end_game_choices?: string[];    // 会导致游戏结束的选项键
  achievements?: Record<string, string>; // 关联成就系统
  contributors: string[];         // 贡献者列表（必填）
}

/**
 * API响应数据结构
 */
export interface ApiResponse {
  metadata: {
    start_options: string[]; // 游戏初始选项
  };
  events: Record<string, Event[]>; // 按组分的事件
  random_events: Event[];   // 随机事件池
}

/**
 * Next.js 15+ 兼容的动态路由参数
 */
export interface DynamicRouteParams {
  params: {
    id: string;  // 必须与文件夹名 [id] 对应
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

/**
 * 页面组件Props类型 (兼容App Router)
 */
export type PageComponentProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};