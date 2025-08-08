import { fetchEvents } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';
import { Event, EventType } from '@/types/events';
export const runtime = 'edge';
export const dynamic = 'auto';
export const revalidate = 3600;
export default async function EventsPage() {
  const data = await fetchEvents();
  
  // 数据转换（确保符合Event类型）
  const allEvents = [
    ...(data?.random_events || []).map(event => ({
      ...event,
      type: EventType.Random,
      id: event.id || `random-${event.question?.substring(0, 10)}`,
      text: event.text || event.question || '',
      question: event.question || '',
      choices: event.choices || {},
      results: event.results || {},
      endGameChoices: event.endGameChoices || [],
      achievements: event.achievements || {},
      contributors: event.contributors || []
    })),
    ...(data?.exam_events || []).map(event => ({
      ...event,
      type: EventType.Exam,
      id: event.id || `exam-${event.question?.substring(0, 10)}`,
      text: event.text || event.question || '',
      question: event.question || '',
      choices: event.choices || {},
      results: event.results || {},
      endGameChoices: event.endGameChoices || [],
      achievements: event.achievements || {},
      contributors: event.contributors || []
    })),
    ...(data?.school_events || []).map(event => ({
      ...event,
      type: event.type || EventType.SchoolStart,
      id: event.id || `${event.provinceId}-${event.cityId}-${event.schoolId}-${event.type}`,
      text: event.text || event.question || '',
      question: event.question || '',
      choices: event.choices || {},
      results: event.results || {},
      endGameChoices: event.endGameChoices || [],
      achievements: event.achievements || {},
      contributors: event.contributors || [],
      school: event.school || 'unknown_school',
      provinceId: event.provinceId || 'unknown_province',
      cityId: event.cityId || 'unknown_city',
      schoolId: event.schoolId || 'unknown_school'
    }))
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">全部事件</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEvents.map(event => (
          <EventCard 
            key={event.id}
            event={{
              ...event,
              // 确保所有必需属性都有值
              text: event.text || event.question || '',
              question: event.question || '',
              choices: event.choices || {},
              results: event.results || {},
              ...('school' in event ? {
                school: event.school || ''
              } : {})
            }}
          />
        ))}
      </div>
    </>
  );
}