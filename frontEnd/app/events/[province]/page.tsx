import { getProvinceData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province } = await params;

  const provinceData = await getProvinceData(province);

  if (!provinceData) {
    return <div className="text-xl font-bold text-red-500">省份数据加载失败或不存在</div>;
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{provinceData.name}</h1>
      {provinceData.cities.map((city, cityIndex) => {
        const schools = city.schools || [];
        return (
          <div key={city.id} className="mb-16">
            {cityIndex > 0 && <div className="border-t-4 border-gray-200 mt-8 mb-8"></div>}
            <h2 className="text-3xl font-bold mb-4">{city.name}</h2>
            <div className="ml-4">
              {schools.map((school, schoolIndex) => {
                const schoolEvents = school.events || { start: [], special: [] };
                const startEvents = schoolEvents.start || [];
                const specialEvents = schoolEvents.special || [];
                return (
                  <div key={school.id} className="mb-8">
                    {schoolIndex > 0 && <div className="border-t-2 border-gray-300 mt-4 mb-4"></div>}
                    <h3 className="text-2xl font-semibold mb-2">{school.name}</h3>
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
                                  type: 'school_start',
                                  question: event.question || "未命名学校事件",
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
                                  type: 'school_special',
                                  question: event.question || "未命名学校事件",
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