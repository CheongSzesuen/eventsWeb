import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';
import { EventType } from '@/types/events';
export const runtime = 'edge';
export const dynamic = 'auto';
export const revalidate = 3600;
// 使用静态生成
// export const dynamic = 'force-static';

// 定义参数类型
interface PageParams {
  province: string;
  city: string;
}

export default async function CityPage({ 
  params 
}: { 
  params: Promise<PageParams> 
}) {
  // 解构 Promise 参数
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
        const { events = { start: [], special: [] } } = school;
        const { start: startEvents = [], special: specialEvents = [] } = events;

        return (
          <div key={school.id || schoolIndex} className="mb-8">
            {/* 学校之间的分隔线 */}
            {schoolIndex > 0 && (
              <div className="border-t-2 border-gray-300 mt-4 mb-4" />
            )}

            <h3 className="text-4xl font-semibold mb-4">{school.name}</h3>

            <div className="ml-4">
              {/* 开学事件 */}
              {startEvents.length > 0 && (
                <section className="mb-6">
                  <h4 className="text-xl font-semibold mb-2">开学事件</h4>
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
                          provinceId: province,
                          cityId: city,
                          schoolId: school.id,
                        }}
                        showBadge={true}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 特殊事件 */}
              {specialEvents.length > 0 && (
                <section className="mb-6">
                  <h4 className="text-xl font-semibold mb-2">特殊事件</h4>
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
                          provinceId: province,
                          cityId: city,
                          schoolId: school.id,
                        }}
                        showBadge={true}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 无事件提示 */}
              {startEvents.length === 0 && specialEvents.length === 0 && (
                <div className="text-gray-500 mb-4">暂无事件</div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}