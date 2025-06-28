export function validateEventData(data) {
  if (!data) return false;
  
  // 确保有基本结构
  if (typeof data !== 'object') return false;
  
  // 设置默认值
  if (!data.metadata) data.metadata = { start_options: [] };
  if (!data.events) data.events = {};
  if (!data.random_events) data.random_events = [];
  
  // 验证事件组
  for (const groupName in data.events) {
    if (!Array.isArray(data.events[groupName])) {
      data.events[groupName] = [];
    }
  }
  
  // 验证随机事件
  if (!Array.isArray(data.random_events)) {
    data.random_events = [];
  }
  
  return true;
}