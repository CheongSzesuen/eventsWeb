// frontEnd/app/events/[province]/[city]/[school]/special/page.tsx
export const runtime = 'edge';
import { getSchoolsByCity } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function SchoolSpecialPage({
  params,
}: {
  params: Promise<{ province: string; city: string; school: string }>;
}) {
  const { province, city, school } = await params;

  const schools = await getSchoolsByCity(province, city);
  const schoolData = schools.find(s => s.id === school);

  if (!schoolData) {
    return <h1 className="text-3xl font-bold mb-8">学校未找到</h1>;
  }

  const specialEvents = schoolData.events.special || [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">{schoolData.name} - 特殊事件</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialEvents.map(event => (
          <EventCard 
            key={event.id}
            event={{
              ...event,
              type: EventType.SchoolSpecial,
              question: event.question || "未命名事件",
              choices: event.choices || {},
              results: event.results || {},
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
  );
}