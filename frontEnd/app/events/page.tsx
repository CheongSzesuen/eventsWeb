// frontEnd/app/events/page.tsx
import { fetchEvents } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

export default async function EventsPage() {
  const data = await fetchEvents();
  
  // 合并时确保 school 字段存在
  const events = [
    ...(data.random_events || []).map(event => ({
      ...event,
      type: 'random' as const,
      school: '', // 初始化 school 字段
      question: event.question || "未命名随机事件",
    })),
    ...(data.exam_events || []).map(event => ({
      ...event,
      type: 'exam' as const,
      school: '', // 初始化 school 字段
      question: event.question || "未命名考试事件",
    })),
    ...(data.school_events || []).map(event => ({
      ...event,
      type: event.type || 'school_start' as const, // 根据事件类型区分
      school: event.school || 'unknown_school', // 确保 school 字段存在
      question: event.question || "未命名学校事件",
    }))
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
