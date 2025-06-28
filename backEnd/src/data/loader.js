// 同步加载JSON（开发模式）
export function loadLocalEvents() {
  if (process.env.NODE_ENV === 'development') {
    return require('./data/events.json');
  }
  // 生产环境通过fetch加载
  return {};
}