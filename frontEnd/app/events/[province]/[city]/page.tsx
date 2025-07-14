import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';
import { EventType } from '@/types/events';

export const runtime = 'edge';

export default async function CityPage({ params }: { params: Promise<{ province: string; city: string }> }) {
  const { province, city } = await params;
  const cityData = await getCityData(province, city);

  if (!cityData) {
    return (
      <div className="text-xl font-bold text-red-500">
        城市数据加载失败或不存在
      </div>
    );
  }

  if (cityData.schools.length === 0) {
    return (
      <div className="text-xl font-bold text-gray-500">
        该城市暂无学校数据
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{cityData.name}</h1>

      {cityData.schools.map((school, schoolIndex) => {
        const schoolEvents = school.events || { start: [], special: [] };
        const startEvents = schoolEvents.start || [];
        const specialEvents = schoolEvents.special || [];

        const hasStartEvents = startEvents.length > 0;
        const hasSpecialEvents = specialEvents.length > 0;

        return (
          <div key={school.id} className="mb-8">
            {schoolIndex > 0 && <div className="border-t-2 border-gray-300 mt-4 mb-4" />}
            <h3 className="text-4xl font-semibold mb-4">{school.name}</h3>

            <div className="ml-4">
              {!hasStartEvents && !hasSpecialEvents && (
                <div className="text-gray-500 mb-4">暂无事件</div>
              )}

              {/* 开学事件 */}
              {hasStartEvents && (
                <>
                  <h4 className="text-xl font-semibold mb-2">开学事件</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {startEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={{
                          ...event,
                          type: EventType.SchoolStart,
                          school: school.name,
                          provinceId: province,
                          cityId: city,
                          schoolId: school.id,
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
                  <h4 className="text-xl font-semibold mb-2 mt-6">特殊事件</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specialEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={{
                          ...event,
                          type: EventType.SchoolSpecial,
                          school: school.name,
                          provinceId: province,
                          cityId: city,
                          schoolId: school.id,
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
      })}
    </>
  );
}