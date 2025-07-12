// frontEnd/app/events/[province]/[city]/[school]/page.tsx
import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function SchoolPage({ params }: { params: { province: string; city: string; school: string } }) {
  const cityData = await getCityData(params.province, params.city);

  if (!cityData) {
    return <div className="text-xl font-bold text-red-500">城市数据加载失败或不存在</div>;
  }

  const schoolData = cityData.schools.find(school => school.id === params.school);

  if (!schoolData) {
    return <div className="text-xl font-bold text-red-500">学校数据加载失败或不存在</div>;
  }

  // 确保 events 不为 undefined
  const events = schoolData.events || { start: [], special: [] };
  const startEvents = events.start || [];
  const specialEvents = events.special || [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{schoolData.name}</h1>
      <div className="ml-4"> {/* 学校内部内容往右移错开一点 */}
        {/* 开学事件 */}
        {startEvents.length > 0 && (
          <>
            <h4 className="text-xl font-semibold mb-2">开学事件</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  event={{
                    ...event,
                    type: 'school_start' as const,
                    question: event.question || "未命名学校事件",
                    choices: event.choices || {},
                    results: event.results || {},
                    school: schoolData.name || 'unknown_school',
                    provinceId: params.province,
                    cityId: params.city,
                    schoolId: params.school,
                  }}
                  showBadge={true}
                />
              ))}
            </div>
          </>
        )}

        {/* 特殊事件 */}
        {specialEvents.length > 0 && (
          <>
            {startEvents.length > 0 && <div className="border-t border-gray-400 mt-4 mb-4"></div>}
            <h4 className="text-xl font-semibold mb-2 mt-4">特殊事件</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  event={{
                    ...event,
                    type: 'school_special' as const,
                    question: event.question || "未命名学校事件",
                    choices: event.choices || {},
                    results: event.results || {},
                    school: schoolData.name || 'unknown_school',
                    provinceId: params.province,
                    cityId: params.city,
                    schoolId: params.school,
                  }}
                  showBadge={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}