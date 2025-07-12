// frontEnd/app/events/exam/page.tsx
import { fetchEvents } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function ExamEventsPage() {
  const data = await fetchEvents();
  const examEvents = data.exam_events || [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">考试事件</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examEvents.map(event => (
          <EventCard 
            key={event.id}
            event={{
              ...event,
              question: event.question || "未命名事件",
              choices: event.choices || {},
              results: event.results || {}
            }}
          />
        ))}
      </div>
    </>
  );
}
