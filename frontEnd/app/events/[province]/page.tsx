import { getProvinceData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';
import { EventType } from '@/types/events';
import { SchoolData, CityData, ProvinceData } from '@/types/events';

export const runtime = 'edge';

export default async function ProvincePage({ params }: { params: Promise<{ province: string }> }) {
  const { province } = await params;
  const provinceData = await getProvinceData(province);

  if (!provinceData) {
    return (
      <div className="text-xl font-bold text-red-500">
        省份数据加载失败或不存在
      </div>
    );
  }

  if (provinceData.cities.length === 0) {
    return (
      <div className="text-xl font-bold text-gray-500">
        该省份暂无事件数据
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{provinceData.name}</h1>
      {provinceData.cities.map((city) => {
        const schools = city.schools || [];
        return (
          <div key={city.id} className="mb-16" data-city-id={city.id}>
            <h2 className="text-3xl font-bold mb-4">{city.name}</h2>
            <div className="ml-4">
              {schools.length === 0 && (
                <div className="text-gray-500">该城市下暂无学校数据</div>
              )}
              {schools.map((school) => {
                const schoolEvents = school.events || { start: [], special: [] };
                const startEvents = schoolEvents.start || [];
                const specialEvents = schoolEvents.special || [];
                const hasStartEvents = startEvents.length > 0;
                const hasSpecialEvents = specialEvents.length > 0;
                return (
                  <div key={school.id} className="mb-8">
                    <h3 className="text-2xl font-semibold mb-2">{school.name}</h3>
                    <div className="ml-4">
                      {!hasStartEvents && !hasSpecialEvents && (
                        <div className="text-gray-500 mb-4">暂无事件</div>
                      )}
                      {/* 开学事件 */}
                      {hasStartEvents && (
                        <>
                          <h4 className="text-xl font-semibold mb-2 mt-4">开学事件</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {startEvents.map((event) => (
                              <EventCard
                                key={event.id}
                                event={{
                                  ...event,
                                  type: EventType.SchoolStart,
                                  question: event.question || '未命名事件',
                                  choices: event.choices || {},
                                  results: event.results || {},
                                  school: school.name || 'unknown_school',
                                  provinceId: provinceData.id,
                                  cityId: city.id,
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
                                  question: event.question || '未命名事件',
                                  choices: event.choices || {},
                                  results: event.results || {},
                                  school: school.name || 'unknown_school',
                                  provinceId: provinceData.id,
                                  cityId: city.id,
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
            </div>
          </div>
        );
      })}
    </>
  );
                          }
