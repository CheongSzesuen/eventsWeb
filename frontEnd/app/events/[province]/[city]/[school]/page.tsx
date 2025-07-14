import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';
import { EventType } from '@/types/events';

export const runtime = 'edge';

export default async function SchoolPage({ params }: { params: Promise<{ province: string; city: string; school: string }> }) {
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

  const schoolEvents = schoolData.events || { start: [], special: [] };
  const startEvents = schoolEvents.start || [];
  const specialEvents = schoolEvents.special || [];

  const hasStartEvents = startEvents.length > 0;
  const hasSpecialEvents = specialEvents.length > 0;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{schoolData.name}</h1>

      <div className="ml-4">
        {!hasStartEvents && !hasSpecialEvents && (
          <div className="text-gray-500 mb-4">暂无事件</div>
        )}

        {/* 开学事件 */}
        {hasStartEvents && (
          <>
            <h2 className="text-2xl font-semibold mb-4">开学事件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={{
                    ...event,
                    type: EventType.SchoolStart,
                    school: schoolData.name,
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
        {hasSpecialEvents && (
          <>
            <h2 className="text-2xl font-semibold mb-4 mt-6">特殊事件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={{
                    ...event,
                    type: EventType.SchoolSpecial,
                    school: schoolData.name,
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
    </div>
  );
}