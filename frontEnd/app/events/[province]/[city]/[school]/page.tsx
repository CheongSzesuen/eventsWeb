import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';
import { EventType } from '@/types/events';
export const runtime = 'edge';
export const dynamic = 'auto';
export const revalidate = 3600;
// 使用 Next.js 15+ 的正确类型定义
// export const dynamic = 'force-static';

export default async function SchoolPage({ 
  params 
}: {
  params: Promise<{
    province: string;
    city: string;
    school: string;
  }>
}) {
  // 解构 Promise 参数
  const { province, city, school } = await params;

  const cityData = await getCityData(province, city);

  if (!cityData) {
    return (
      <div className="text-xl font-bold text-red-500">
        城市数据加载失败或不存在
      </div>
    );
  }

  const schoolData = cityData.schools.find(s => s.id === school);
  if (!schoolData) {
    return (
      <div className="text-xl font-bold text-red-500">
        学校数据加载失败或不存在
      </div>
    );
  }

  const { 
    events = { start: [], special: [] },
    name: schoolName = '未知学校'
  } = schoolData;
  const { 
    start: startEvents = [], 
    special: specialEvents = [] 
  } = events;

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-8">{schoolName}</h1>

      {/* 开学事件部分 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">开学事件</h2>
        {startEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startEvents.map((event) => (
              <EventCard
                key={event.id || `${school}-start-${event.question?.substring(0, 10)}`}
                event={{
                  ...event,
                  type: EventType.SchoolStart,
                  question: event.question || '未命名事件',
                  choices: event.choices || {},
                  results: event.results || {},
                  school: schoolName,
                  provinceId: province,
                  cityId: city,
                  schoolId: school,
                }}
                showBadge={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">暂无开学事件</div>
        )}
      </section>

      {/* 特殊事件部分 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">特殊事件</h2>
        {specialEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialEvents.map((event) => (
              <EventCard
                key={event.id || `${school}-special-${event.question?.substring(0, 10)}`}
                event={{
                  ...event,
                  type: EventType.SchoolSpecial,
                  question: event.question || '未命名事件',
                  choices: event.choices || {},
                  results: event.results || {},
                  school: schoolName,
                  provinceId: province,
                  cityId: city,
                  schoolId: school,
                }}
                showBadge={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">暂无特殊事件</div>
        )}
      </section>
    </div>
  );
}