import { getSchoolsByCity } from '@/lib/fetchEvents';
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
  school: string;
}

export default async function SchoolStartPage({ 
  params 
}: { 
  params: Promise<PageParams> 
}) {
  // 解构 Promise 参数
  const { province, city, school } = await params;
  
  const schools = await getSchoolsByCity(province, city);
  const schoolData = schools.find(s => s.id === school);

  if (!schoolData) {
    return (
      <div className="text-xl font-bold text-red-500 p-4">
        学校数据加载失败或不存在
      </div>
    );
  }

  // 安全解构
  const { 
    events = { start: [] },
    name: schoolName = '未知学校'
  } = schoolData;
  const startEvents = events.start || [];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">
        {schoolName} - 开学事件
        <span className="text-sm font-normal ml-2 text-gray-500">
          ({startEvents.length}个事件)
        </span>
      </h1>

      {startEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startEvents.map(event => (
            <EventCard 
              key={event.id || `${school}-start-${event.question?.substring(0, 10)}`}
              event={{
                ...event,
                type: EventType.SchoolStart,
                question: event.question || "未命名事件",
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
        <div className="text-gray-500 text-center py-8">
          该学校暂无开学事件
        </div>
      )}
    </div>
  );
}