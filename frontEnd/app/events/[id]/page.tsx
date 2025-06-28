import { fetchEvents } from '@/lib/api';
import { notFound } from 'next/navigation';

interface Event {
  id: string
  question: string
  choices: Record<string, string>
  results: Record<string, any>
  contributors?: string[]
}

export default async function EventDetailPage({
  params
}: {
  params: { id: string }
}) {
  let data;
  try {
    data = await fetchEvents();
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return notFound();
  }

  if (!data || !data.events || !data.random_events) {
    return notFound();
  }

  const allEvents = [
    ...Object.values(data.events).flat(),
    ...data.random_events
  ];
  
  const event = allEvents.find((e: Event) => e.id === params.id);

  if (!event) return notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {event.question.replace(/^>>>/, '').trim()}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">选项与结果</h2>
          <div className="space-y-4">
            {Object.entries(event.choices).map(([key, choice]) => (
              <div key={key} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
                <h3 className="font-medium">
                  <span className="text-blue-600 dark:text-blue-400">{key}.</span> {choice}
                </h3>
                <div className="mt-2 ml-4">
                  {Array.isArray(event.results[key]) ? (
                    <ul className="space-y-2">
                      {(event.results[key] as any[]).map((result, i) => (
                        <li 
                          key={i} 
                          className={`p-3 rounded ${
                            result.end_game 
                              ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600' 
                              : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          <p className="dark:text-gray-200">
                            {result.text}
                            {result.prob && (
                              <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                                (概率: {(result.prob * 100).toFixed(0)}%)
                              </span>
                            )}
                          </p>
                          {result.end_game && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                              游戏结束
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded dark:text-gray-200">
                      {event.results[key] as string}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            {event.contributors && event.contributors.length > 0 && (
              <span>贡献者: {event.contributors.join(', ')}</span>
            )}
          </div>
          <span>事件ID: {event.id}</span>
        </div>
      </div>
    </div>
  );
}