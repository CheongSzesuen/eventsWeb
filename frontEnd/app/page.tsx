// app/page.tsx
import { fetchEvents } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function HomePage() {
  let data;
  try {
    data = await fetchEvents();
    console.log('加载到的数据:', JSON.stringify({
      randomCount: data?.random_events?.length || 0,
      examCount: data?.exam_events?.length || 0,
      provincesCount: (data?.provinces?.provinces || []).length
    }, null, 2));
  } catch (error) {
    console.error('数据加载失败:', error);
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 rounded-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">数据加载失败</h1>
        <div className="space-y-2">
          <p className="text-red-700">错误信息: {(error as Error).message}</p>
          <p className="text-red-700">建议操作:</p>
          <ul className="list-disc pl-6 text-red-700">
            <li>检查控制台查看详细错误</li>
            <li>验证数据文件是否存在</li>
            <li>刷新页面重试</li>
          </ul>
        </div>
      </div>
    );
  }

  // 提取事件逻辑保持不变
  const provinceEvents = (data?.provinces?.provinces || []).flatMap(province => 
    (province?.cities || []).flatMap(city => 
      (city?.schools || []).flatMap(school => 
        [
          ...(school?.events?.start?.map(event => ({
            ...event,
            school: school.name,
            type: 'school_start' as const
          })) || []),
          ...(school?.events?.special?.map(event => ({
            ...event,
            school: school.name,
            type: 'school_special' as const
          })) || [])
        ]
      ) || []
    ) || []
  );

  const allEvents = [
    ...(data?.random_events || []),
    ...(data?.exam_events || []),
    ...provinceEvents
  ];

  if (allEvents.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-yellow-50 rounded-lg">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">暂无事件</h1>
        <div className="space-y-2">
          <p className="text-yellow-700">可能原因:</p>
          <ul className="list-disc pl-6 text-yellow-700">
            <li>数据文件尚未配置</li>
            <li>文件路径配置错误</li>
            <li>数据正在更新中</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">首页事件</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEvents.map((event) => (
          <div key={event.id} className="hover:shadow-lg transition-shadow duration-200">
            <EventCard
              event={{
                ...event,
                question: event.question || "未命名事件",
                choices: event.choices || {
                  default: "默认选项"
                },
                results: event.results || {
                  default: "默认结果"
                }
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}