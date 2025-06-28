import { fetchEvents } from '@/lib/api';
import EventCard from '@/components/EventCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const SCHOOL_NAMES: Record<string, string> = {
  'all': '全部事件',
  'random': '随机事件库',
  'group_1': '羊县中学',
  'group_2': '闪西省汗忠中学',
  'group_3': '汗忠市龙港高级中学'
};

export default async function GroupEventsPage(props: any) {
  const { params } = props;
  const data = await fetchEvents();
  const groupName = params.groupName.replace(/-/g, '_');
  
  let events;
  if (groupName === 'all') {
    events = [...Object.values(data.events).flat(), ...data.random_events];
  } else if (groupName === 'random') {
    events = data.random_events;
  } else {
    events = data.events[groupName];
  }

  if (!events) return notFound();

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        {SCHOOL_NAMES[groupName] || groupName} ({events.length})
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {events.map((event: any) => (
          <Link 
            key={event.id} 
            href={`/events/${event.id}`}
            className="w-full no-underline"
          >
            <EventCard event={event} />
          </Link>
        ))}
      </div>
    </>
  );
}