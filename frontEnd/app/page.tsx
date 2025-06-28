import { fetchEvents } from '@/lib/api';
import EventCard from '@/components/EventCard';

export default async function Home() {
  const data = await fetchEvents();
  const allEvents = [
    ...Object.values(data.events).flat(),
    ...data.random_events
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">全部事件</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </>
  );
}