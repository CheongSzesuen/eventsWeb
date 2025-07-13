// frontEnd/app/events/page.tsx
import { fetchEvents } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function EventsPage() {
  const data = await fetchEvents();
  
  // 合并时确保 school 字段存在
  const allEvents = [
  ...(data?.random_events || []).map((event) => ({
    ...event,
    school: '', // 默认学校字段
    type: EventType.Random, // 固定类型为 Random
  })),
  ...(data?.exam_events || []).map((event) => ({
    ...event,
    school: '', // 考试事件没有学校信息
    type: EventType.Exam, // 固定类型为 Exam
  })),
  ...(data?.school_events || []).map((event) => ({
    ...event,
    type: event.type || EventType.SchoolStart, // 使用事件自带类型或默认 SchoolStart
    school: event.school || 'unknown_school',
    provinceId: event.provinceId || 'unknown_province',
    cityId: event.cityId || 'unknown_city',
    schoolId: event.schoolId || 'unknown_school',
  })),
];

  // 调试信息
  console.log('Fetched Events:', data);

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">全部事件</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard 
            key={event.id}
            event={{
              ...event,
              choices: event.choices || {},
              results: event.results || {},
              school: event.school || '' // 明确传递 school
            }}
          />
        ))}
      </div>
    </>
  );
}
