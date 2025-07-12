// frontEnd/app/events/[province]/[city]/[school]/start/page.tsx
import { getSchoolsByCity } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function SchoolStartPage({ params }: { params: { province: string, city: string, school: string } }) {
  const schools = await getSchoolsByCity(params.province, params.city);
  const schoolData = schools.find(s => s.id === params.school);

  if (!schoolData) {
    return <h1 className="text-3xl font-bold mb-8">学校未找到</h1>;
  }

  const startEvents = schoolData.events.start || [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">{schoolData.name} - 开始事件</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startEvents.map(event => (
          <EventCard 
            key={event.id}
            event={{
              ...event,
              type: 'school_start' as const,
              question: event.question || "未命名事件",
              choices: event.choices || {},
              results: event.results || {},
              school: schoolData.name, // 添加学校名称
              provinceId: params.province, // 添加省份ID
              cityId: params.city, // 添加城市ID
              schoolId: schoolData.id // 添加学校ID
            }}
            showBadge={true} // 确保 showBadge 为 true
          />
        ))}
      </div>
    </>
  );
}
