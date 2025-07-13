// frontEnd/components/EventCardList.tsx
'use client';

import EventCard from '@/components/EventCard';
import { EventType } from '@/types/events';
interface EventCardListProps {
  events: {
    start?: any[];
    special?: any[];
  };
  school: {
    name: string;
    id: string;
  };
  provinceId: string;
  cityId: string;
}

export default function EventCardList({ events, school, provinceId, cityId }: EventCardListProps) {
  return (
    <>
      {events.start && events.start.length > 0 && (
        <>
          <h4 className="text-xl font-semibold mb-2">开学事件</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.start.map((event, eventIndex) => (
              <EventCard 
                key={event.id}
                event={{
                  ...event,
                  type: EventType.SchoolStart,
                  question: event.question || "未命名学校事件",
                  choices: event.choices || {},
                  results: event.results || {},
                  school: school.name || 'unknown_school',
                  provinceId,
                  cityId,
                  schoolId: school.id,
                }}
                showBadge={true}
              />
            ))}
          </div>
        </>
      )}
      {events.special && events.special.length > 0 && (
        <>
          {events.start && events.start.length > 0 && <div className="border-t border-gray-400 mt-4 mb-4"></div>}
          <h4 className="text-xl font-semibold mb-2 mt-4">特殊事件</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.special.map((event, eventIndex) => (
              <EventCard 
                key={event.id}
                event={{
                  ...event,
                  type: EventType.SchoolSpecial,
                  question: event.question || "未命名学校事件",
                  choices: event.choices || {},
                  results: event.results || {},
                  school: school.name || 'unknown_school',
                  provinceId,
                  cityId,
                  schoolId: school.id,
                }}
                showBadge={true}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}