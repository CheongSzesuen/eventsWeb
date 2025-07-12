// app/events/[province]/[city]/page.tsx
import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function CityPage({ params }: { params: { province: string; city: string } }) {
  const cityData = await getCityData(params.province, params.city);

  if (!cityData) {
    return <div className="text-xl font-bold text-red-500">城市数据加载失败或不存在</div>;
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{cityData.name}</h1>
      {cityData.schools.map((school, schoolIndex) => {
        const schoolEvents = school.events || { start: [], special: [] };
        const startEvents = schoolEvents.start || [];
        const specialEvents = schoolEvents.special || [];

        return (
          <div key={school.id} className="mb-8">
            {schoolIndex > 0 && <div className="border-t-2 border-gray-300 mt-4 mb-4"></div>}
            <h3 className="text-4xl font-semibold mb-4">{school.name}</h3>
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
                          provinceId: params.province,
                          cityId: params.city,
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
                          provinceId: params.province,
                          cityId: params.city,
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