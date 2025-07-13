// app/search/SearchContent.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchEvents } from '@/lib/searchEvents'
import type { Event } from '@/types/events'
import Link from 'next/link'

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
                    : ((event.results[key] as any[])[0]?.text ? (event.results[key] as any[])[0].text.slice(0, 50) + '...' : '')
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

export default function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() || ''
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [eventsPerPage] = useState(10)

  useEffect(() => {
    const searchAndFilter = async () => {
      const results = await searchEvents(query)
      setFilteredEvents(results)
      setCurrentPage(1)
    }

    if (query) {
      searchAndFilter()
    } else {
      setFilteredEvents([])
    }
  }, [query])

  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)

  return (
    <>
      {filteredEvents.length > 0 ? (
        <div className="mb-4">
          <select 
            className="border p-2 rounded-lg"
            onChange={(e) => {
              const sortType = e.target.value
              let sortedEvents = [...filteredEvents]
              switch(sortType) {
                case 'type':
                  sortedEvents.sort((a, b) => (a.type || '').localeCompare(b.type || ''))
                  break
                case 'school':
                  sortedEvents.sort((a, b) => (a.school || '').localeCompare(b.school || ''))
                  break
                case 'province':
                  sortedEvents.sort((a, b) => (a.provinceId || '').localeCompare(b.provinceId || ''))
                  break
                case 'city':
                  sortedEvents.sort((a, b) => (a.cityId || '').localeCompare(b.cityId || ''))
                  break
                default:
                  break
              }
              setFilteredEvents(sortedEvents)
              setCurrentPage(1)
            }}
          >
            <option value="default">默认排序</option>
            <option value="type">按类型排序</option>
            <option value="school">按学校排序</option>
            <option value="province">按省份排序</option>
            <option value="city">按城市排序</option>
          </select>
        </div>
      ) : null}

      {currentEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map(event => (
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
          <p className="text-gray-500 text-lg dark:text-gray-400">
            请输入搜索关键词
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 mx-2 rounded-lg ${currentPage === index + 1 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </>
  )
}