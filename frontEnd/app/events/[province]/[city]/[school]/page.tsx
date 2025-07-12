// frontEnd/app/events/[province]/[city]/[school]/page.tsx
import { getCityData } from '@/lib/fetchEvents';
import EventCard from '@/components/EventCard';

interface SchoolPageProps {
  params: {
    province: string;
    city: string;
    school: string;
  };
  cityData: CityData | null;
  schoolData: SchoolData | null;
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
      const cityFilePath = `events/provinces/${provinceId}/${cityId}.json`;
      const cityData = await fetchDataFile<{ schools: SchoolData[] }>(cityFilePath);

      if (!cityData) {
        console.warn(`[SKIP] 文件不存在: ${cityFilePath}`);
        continue;
      }

      for (const school of cityData.schools) {
        paths.push({
          params: {
            province: provinceId,
            city: cityId,
            school: school.id
          }
        });
      }
    }
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { province: string; city: string; school: string } }) {
  const { province, city, school } = params;
  const cityData = await getCityData(province, city);

  if (!cityData) {
    return {
      props: {
        params: {
          province,
          city,
          school,
        },
        cityData: null,
        schoolData: null,
      },
    };
  }

  const schoolData = cityData.schools.find(schoolItem => schoolItem.id === school);

  if (!schoolData) {
    return {
      props: {
        params: {
          province,
          city,
          school,
        },
        cityData: null,
        schoolData: null,
      },
    };
  }

  return {
    props: {
      params: {
        province,
        city,
        school,
      },
      cityData,
      schoolData,
    },
  };
}

const SchoolPage: React.FC<SchoolPageProps> = ({ params, cityData, schoolData }) => {
  if (!cityData) {
    return <div className="text-xl font-bold text-red-500">城市数据加载失败或不存在</div>;
  }

  if (!schoolData) {
    return <div className="text-xl font-bold text-red-500">学校数据加载失败或不存在</div>;
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{schoolData.name}</h1>
      <div className="ml-4"> {/* 学校内部内容往右移错开一点 */}
        {schoolData.events.start?.length > 0 && (
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
                    schoolId: params.school,
                  }}
                  showBadge={true}
                />
              ))}
            </div>
          </>
        )}
        {schoolData.events.special?.length > 0 && (
          <>
            {schoolData.events.start?.length > 0 && <div className="border-t border-gray-400 mt-4 mb-4"></div>} {/* 开学事件卡片和特殊事件字样之间 */}
            <h4 className="text-xl font-semibold mb-2 mt-4">特殊事件</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schoolData.events.special?.map((event, eventIndex) => (
                <EventCard 
                  key={event.id}
                  event={{
                    ...event,
                    type: 'school_special' as const,
                    question: event.question || "未命名学校事件",
                    choices: event.choices || {},
                    results: event.results || {},
                    school: schoolData.name || 'unknown_school',
                    provinceId: params.province,
                    cityId: params.city,
                    schoolId: params.school,
                  }}
                  showBadge={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default SchoolPage;
