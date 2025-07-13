// frontEnd/app/events/[province]/[city]/[school]/page.tsx
export const runtime = 'edge';
import { getCityData  } from '@/lib/fetchEvents'; // ✅ 正确函数名
import EventCard from '@/components/EventCard';
import { EventType } from '@/types/events';

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ province: string; city: string; school: string }>;
}) {
  const { province, city, school } = await params;

  const cityData = await getCityData (province, city); // ✅ 改为驼峰命名

  if (!cityData) {
    return <div className="text-xl font-bold text-red-500">城市数据加载失败或不存在</div>;
  }

  const schoolData = cityData.schools.find(schoolItem => schoolItem.id === school);

  if (!schoolData) {
    return <div className="text-xl font-bold text-red-500">学校数据加载失败或不存在</div>;
  }

  const events = schoolData.events || { start: [], special: [] };
  const startEvents = events.start || [];
  const specialEvents = events.special || [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{schoolData.name}</h1>
      <div className="ml-4">
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
                    type: EventType.SchoolStart,
                    question: event.question || "未命名学校事件",
                    choices: event.choices || {},
                    results: event.results || {},
                    school: schoolData.name || 'unknown_school',
                    provinceId: province,
                    cityId: city,
                    schoolId: school,
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
                    provinceId: province,
                    cityId: city,
                    schoolId: school,
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