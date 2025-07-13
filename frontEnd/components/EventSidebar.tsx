'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavLink } from '@/components/NavLink';
import {
  getProvinceName,
  getCityName,
  getSchoolName
} from '@/utils/mapService';
import {
  ApiResponse,
  ProvinceData,
  CityData,
  SchoolData
} from '@/types/events';
import { fetchEvents } from '@/src/lib/fetchEvents';

export default function EventSidebar({
  isOpen,
  onClose,
  isMobile,
  isTransitioning
}: {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isTransitioning?: boolean;
}) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const result = await fetchEvents();
        setData(result);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const renderProvinceTree = () => {
    if (!data || !data.provinces || !Array.isArray(data.provinces.provinces)) {
      return (
        <div className="text-gray-400 text-sm px-3 py-2 bg-gray-50 rounded-md">
          暂无省份数据
        </div>
      );
    }

    return data.provinces.provinces.map((province: ProvinceData) => (
      <li key={province.id} className="mt-1">
        <details className="group">
          <summary className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200">
            <Link
              href={`/events/${province.id}`}
              className="font-medium hover:text-blue-600"
              onClick={(e) => e.stopPropagation()}
            >
              {getProvinceName(province.id)}
            </Link>
            <div className="flex items-center">
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {province.total || 0}
              </span>
              <svg
                className="w-4 h-4 text-gray-500 transition-transform duration-200 group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </summary>
          <ul className="ml-3 mt-1 space-y-1 pl-3 border-l border-gray-200">
            {(province.cities || []).map((city: CityData) => (
              <li key={city.id}>
                <details className="group">
                  <summary className="flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                    <Link
                      href={`/events/${province.id}/${city.id}`}
                      className="hover:text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getCityName(province.id, city.id)}
                    </Link>
                    <div className="flex items-center">
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {city.total || 0}
                      </span>
                      <svg
                        className="w-3 h-3 text-gray-400 transition-transform duration-200 group-open:rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </summary>
                  <ul className="ml-2 mt-1 space-y-1 pl-3 border-l border-gray-200">
                    {(city.schools || []).map((school: SchoolData) => {
                      const startCount = school.events.start?.length || 0;
                      const specialCount = school.events.special?.length || 0;
                      if (startCount + specialCount === 0) {
                        return null;
                      }
                      return (
                        <li key={school.id}>
                          <details className="group">
                            <summary className="flex items-center justify-between px-1.5 py-1 text-xs text-gray-500 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                              <Link
                                href={`/events/${province.id}/${city.id}/${school.id}`}
                                className="hover:text-blue-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {getSchoolName(school.id)}
                              </Link>
                              <div className="flex items-center">
                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                  {startCount + specialCount}
                                </span>
                                <svg
                                  className="w-3 h-3 text-gray-400 transition-transform duration-200 group-open:rotate-90"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </summary>
                            <ul className="ml-1 mt-1 space-y-1">
                              {startCount > 0 && (
                                <NavLink
                                  href={`/events/${province.id}/${city.id}/${school.id}/start`}
                                  name="开学事件"
                                  count={startCount}
                                />
                              )}
                              {specialCount > 0 && (
                                <NavLink
                                  href={`/events/${province.id}/${city.id}/${school.id}/special`}
                                  name="特殊事件"
                                  count={specialCount}
                                />
                              )}
                            </ul>
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </details>
      </li>
    ));
  };

  return (
    <div
      className={`w-64 bg-white border-r border-gray-200 p-4 fixed top-16 bottom-0 z-50 ${
        isOpen ? 'left-0' : isMobile ? '-left-full' : '-left-64'
      } transition-all duration-300 shadow-lg`}
      style={{
        transition: isTransitioning
          ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'none'
      }}
    >
      {/* 加载动画 */}
      {isLoading && (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">
          数据加载失败，请检查控制台
        </div>
      )}

      {/* 正常数据渲染 */}
      {!isLoading && data && (
        <div className="space-y-4">
          <ul className="space-y-1">
            <NavLink href="/events" name="全部事件" count={data.total || 0} />
            <NavLink
              href="/events/random"
              name="随机事件库"
              count={data.random_events?.length || 0}
            />
            <NavLink
              href="/events/exam"
              name="考试事件库"
              count={data.exam_events?.length || 0}
            />
          </ul>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              按地区筛选
            </h3>
            {(data.provinces?.provinces || []).length > 0 ? (
              <ul className="space-y-1">{renderProvinceTree()}</ul>
            ) : (
              <div className="text-gray-400 text-sm px-3 py-2 bg-gray-50 rounded-md">
                暂无可用地区数据
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}