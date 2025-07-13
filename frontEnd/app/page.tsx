import { fetchEvents } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';
import type { ProvinceData, CityData, SchoolData } from '@/types/events';
import { EventType } from '@/types/events'; 
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
        <p className="text-red-700">错误信息: {(error as Error).message}</p>
      </div>
    );
  }

  // 合并所有事件
  const allEvents = [
    ...(data?.random_events || []),
    ...(data?.exam_events || []),
    ...data.provinces.provinces.flatMap((province: ProvinceData) =>
      province.cities.flatMap((city: CityData) =>
        city.schools.flatMap((school: SchoolData) => [
          ...(school.events.start || []).map(event => ({
            ...event,
            school: school.name,
            type: EventType.SchoolStart
          })),
          ...(school.events.special || []).map(event => ({
            ...event,
            school: school.name,
            type: EventType.SchoolSpecial
          }))
        ])
      )
    )
  ];

  if (allEvents.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-yellow-50 rounded-lg">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">暂无事件</h1>
        <p className="text-yellow-700">当前没有可显示的事件数据。</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">事件总览</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEvents.map((event) => (
          <EventCard key={event.id} event={event} showBadge />
        ))}
      </div>
    </>
  );
}