// frontEnd/app/events/[province]/[city]/page.tsx
import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

interface CityPageProps {
  params: {
    province: string;
    city: string;
  };
  cityData: CityData | null;
}

export async function getStaticPaths() {
  const provinceCityMap = await fetchDataFile<Record<string, { 
    name: string; 
    cities: Record<string, string> 
  }>>('provinceCityMap.json');

  if (!provinceCityMap) {
    console.error('省份城市数据加载失败');
    return { paths: [], fallback: false };
  }

  const paths = [];

  for (const [provinceId, provinceInfo] of Object.entries(provinceCityMap)) {
    for (const [cityId, _] of Object.entries(provinceInfo.cities || {})) {
      paths.push({
        params: {
          province: provinceId,
          city: cityId
        }
      });
    }
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { province: string; city: string } }) {
  const { province, city } = params;
  const cityData = await getCityData(province, city);

  if (!cityData) {
    return {
      props: {
        params: {
          province,
          city,
        },
        cityData: null,
      },
    };
  }

  return {
    props: {
      params: {
        province,
        city,
      },
      cityData,
    },
  };
}

const CityPage: React.FC<CityPageProps> = ({ params, cityData }) => {
  if (!cityData) {
    return <div className="text-xl font-bold text-red-500">城市数据加载失败或不存在</div>;
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{cityData.name}</h1>
      <div className="ml-4"> {/* 城市内部内容往右移错开一点 */}
        {cityData.schools.map(school => (
          <div key={school.id} className="mb-8">
            <h2 className="text-3xl font-semibold mb-4">{school.name}</h2>
            {school.events.start?.length > 0 && (
              <>
                <h4 className="text-xl font-semibold mb-2">开学事件</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schoolData.events.start?.map((event, eventIndex) => (
                    <EventCard 
                      key={event.id}
                      event={{
                        ...event,
                        type: 'school_start' as const,
                        question: event.question || "未命名学校事件",
                        choices: event.choices || {},
                        results: event.results || {},
                        school: schoolData.name || 'unknown_school',
                        provinceId: params.province,
                        cityId: params.city,
                        schoolId: school.id,
                      }}
                      showBadge={true}
                    />
                  ))}
                </div>
              </>
            )}
            {school.events.special?.length > 0 && (
              <>
                {school.events.start?.length > 0 && <div className="border-t border-gray-400 mt-4 mb-4"></div>} {/* 开学事件卡片和特殊事件字样之间 */}
                <h4 className="text-xl font-semibold mb-2 mt-4">特殊事件</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {school.events.special?.map((event, eventIndex) => (
                    <EventCard 
                      key={event.id}
                      event={{
                        ...event,
                        type: 'school_special' as const,
                        question: event.question || "未命名学校事件",
                        choices: event.choices || {},
                        results: event.results || {},
                        school: school.name || 'unknown_school',
                        provinceId: params.province,
                        cityId: params.city,
                        schoolId: school.id,
                      }}
                      showBadge={true}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default CityPage;
