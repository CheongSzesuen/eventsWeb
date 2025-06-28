import { fetchEvents } from '@/lib/api';
import { notFound } from 'next/navigation';
import type { Event, ApiResponse, EventResult, DynamicRouteParams } from '@/types/events';

export default async function EventDetailPage({ params }: DynamicRouteParams) {
  // 数据获取
  let data: ApiResponse;
  try {
    data = await fetchEvents();
  } catch (error) {
    console.error('数据获取失败:', error);
    notFound();
  }

  // 数据处理
  const allEvents = [
    ...Object.values(data.events).flat(),
    ...data.random_events
  ].map(event => ({
    ...event,
    contributors: event.contributors || [] // 确保数组存在
  }));

  const event = allEvents.find(e => e.id === params.id);
  if (!event) notFound();

  // 渲染结果项
  const renderResultItem = (item: EventResult) => (
    <li className={`p-3 rounded ${
      item.end_game 
        ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600' 
        : 'bg-gray-50 dark:bg-gray-700/50'
    }`}>
      <p className="dark:text-gray-200">
        {item.text}
        {item.prob && (
          <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
            ({(item.prob * 100).toFixed(0)}%)
          </span>
        )}
      </p>
      {item.end_game && (
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          游戏结束
        </span>
      )}
    </li>
  );

  // 渲染结果集
  const renderResult = (result: string | EventResult[]) => {
    if (typeof result === 'string') {
      return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded dark:text-gray-200">
          {result}
        </div>
      );
    }
    return <ul className="space-y-2">{result.map(renderResultItem)}</ul>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {event.question.replace(/^>>>/, '').trim()}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">选项与结果</h2>
          <div className="space-y-4">
            {Object.entries(event.choices).map(([key, choice]) => (
              <div key={key} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
                <h3 className="font-medium">
                  <span className="text-blue-600 dark:text-blue-400">{key}.</span> {choice}
                </h3>
                <div className="mt-2 ml-4">
                  {renderResult(event.results[key])}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
          {event.contributors.length > 0 && (
            <span>贡献者: {event.contributors.join(', ')}</span>
          )}
          <span>事件ID: {event.id}</span>
        </div>
      </div>
    </div>
  );
}