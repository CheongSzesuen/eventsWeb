import { searchEvents } from '@/lib/api';
import type { Event } from '@/types/events';
import Link from 'next/link';

function SearchResult({ event }: { event: Event }) {
  return (
    <Link 
      href={`/events/${event.id}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700"
    >
      <h3 className="font-bold text-lg mb-2 dark:text-white">
        {event.question.replace(/^>>>/, '').trim()}
      </h3>
      <div className="space-y-2">
        {Object.entries(event.choices).map(([key, choice]) => (
          <div key={key} className="flex items-start">
            <span className="mr-2 font-medium text-blue-600 dark:text-blue-400">{key}.</span>
            <div>
              <p className="dark:text-gray-300">{choice}</p>
              {event.results[key] && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {typeof event.results[key] === 'string' 
                    ? (event.results[key] as string).slice(0, 50) + '...'
                    : (event.results[key] as EventResult[])[0].text.slice(0, 50) + '...'
                  }
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {event.end_game_choices?.includes('1') && (
        <span className="inline-block mt-2 text-xs text-red-500">包含游戏结束选项</span>
      )}
    </Link>
  );
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q?.trim() || '';
  let results: Event[] = [];
  
  try {
    results = await searchEvents(query);
  } catch (error) {
    console.error('搜索出错:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        {query ? `"${query}"的搜索结果` : '所有事件'}
      </h1>
      
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map(event => (
            <SearchResult key={event.id} event={event} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg dark:text-gray-400">
            没有找到包含"<span className="font-medium">{query}</span>"的事件
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg dark:text-400">
            请输入搜索关键词
          </p>
        </div>
      )}
    </div>
  );
}


interface EventResult {
  text: string;
  prob?: number;
  end_game?: boolean;
}
