// frontEnd/app/events/[province]/page.tsx
import { getProvinceData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

interface ProvincePageProps {
  params: {
    province: string;
  };
  provinceData: ProvinceData | null;
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

  for (const [provinceId, _] of Object.entries(provinceCityMap)) {
    paths.push({
      params: {
        province: provinceId
      }
    });
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { province: string } }) {
  const { province } = params;
  const provinceData = await getProvinceData(province);

  if (!provinceData) {
    return {
      props: {
        params: {
          province,
        },
        provinceData: null,
      },
    };
  }

  return {
    props: {
      params: {
        province,
      },
      provinceData,
    },
  };
}

const ProvincePage: React.FC<ProvincePageProps> = ({ params, provinceData }) => {
  if (!provinceData) {
    return <div className="text-xl font-bold text-red-500">省份数据加载失败或不存在</div>;
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{provinceData.name}</h1>
      <div className="ml-4"> {/* 省份内部内容往右移错开一点 */}
        {provinceData.cities.map(city => (
          <div key={city.id} className="mb-8">
            <h2 className="text-3xl font-semibold mb-4">{city.name}</h2>
            {city.schools.map(school => (
              <div key={school.id} className="mb-4">
                <h3 className="text-2xl font-semibold mb-2">{school.name}</h3>
                {school.events.start?.length > 0 && (
                  <>
                    <h4 className="text-xl font-semibold mb-2">开学事件</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {school.events.start?.map((event, eventIndex) => (
                        <EventCard 
                          key={event.id}
                          event={{
                            ...event,
                            type: 'school_start' as const,
                            question: event.question || "未命名学校事件",
                            choices: event.choices || {},
                            results: event.results || {},
                            school: school.name || 'unknown_school',
                            provinceId: params.province,
                            cityId: city.id,
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
                            cityId: city.id,
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
        ))}
      </div>
    </>
  );
}

export default ProvincePage;
