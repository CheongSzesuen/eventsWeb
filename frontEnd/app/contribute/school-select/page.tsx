'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSchoolsByCity } from '@/lib/fetchEvents';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ProvinceCityMap } from '@/types/provinceCityMap';

export default function SchoolSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(searchParams?.get('province') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams?.get('city') || '');
  const [cities, setCities] = useState<string[]>([]);
  const [loadingProvinceData, setLoadingProvinceData] = useState(true);
  const [schools, setSchools] = useState<{id: string, name: string}[]>([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolZhName, setNewSchoolZhName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [provinceCityData, setProvinceCityData] = useState<ProvinceCityMap | null>(null);
  const [provinceList, setProvinceList] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const loadProvinceCityData = async () => {
      try {
        const response = await fetch('/data/provinceCityMap.json');
        const data: ProvinceCityMap = await response.json();
        setProvinceCityData(data);
        
        const provinces = Object.entries(data).map(([id, province]) => ({
          id,
          name: province.name
        }));
        setProvinceList(provinces);
        
        // If province is in URL params, load its cities
        if (searchParams?.get('province')) {
          const provinceId = searchParams.get('province') || '';
          const province = data[provinceId];
          if (province && province.cities) {
            // cityNames 是对象数组，需映射为名称数组
            const cityNames = Object.values(province.cities).map(city => typeof city === 'string' ? city : city.name);
            setCities(cityNames);
            setSelectedProvince(provinceId);
          }
        }
        
        // If city is in URL params, set it
        if (searchParams?.get('city')) {
          setSelectedCity(searchParams.get('city') || '');
        }
      } catch (error) {
        console.error('加载省份城市数据失败:', error);
      } finally {
        setLoadingProvinceData(false);
      }
    };
    
    loadProvinceCityData();
  }, [searchParams]);

  useEffect(() => {
    const loadSchools = async () => {
      if (selectedCity && selectedProvince) {
        setLoading(true);
        try {
          const provinceName = provinceList.find(p => p.id === selectedProvince)?.name || '';
          const schoolsData = await getSchoolsByCity(provinceName, selectedCity);
          setSchools(schoolsData.map(school => ({
            id: school.id,
            name: school.name
          })));
          
          // Update URL with current selections
          const newParams = new URLSearchParams();
          newParams.set('province', selectedProvince);
          newParams.set('city', selectedCity);
          router.replace(`/contribute/school-select?${newParams.toString()}`);
        } catch (err) {
          console.error('加载学校列表失败', err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadSchools();
  }, [selectedCity, selectedProvince, provinceList, router]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedCity('');

    if (provinceId && provinceCityData) {
      const province = provinceCityData[provinceId];
      if (province && province.cities) {
        // cityNames 是对象数组，需映射为名称数组
        const cityNames = Object.values(province.cities).map(city => typeof city === 'string' ? city : city.name);
        setCities(cityNames);
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };

  const handleConfirmLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity) {
      setIsTransitioning(true);
      setTimeout(() => {
        setConfirmed(true);
        setIsTransitioning(false);
        
        // Update URL with current selections
        const newParams = new URLSearchParams();
        newParams.set('province', selectedProvince);
        newParams.set('city', selectedCity);
        router.replace(`/contribute/school-select?${newParams.toString()}`);
      }, 150);
    }
  };

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchool(schoolId);
    const provinceName = provinceCityData?.[selectedProvince]?.name || '';
    router.push(`/contribute?type=school&province=${encodeURIComponent(provinceName)}&city=${encodeURIComponent(selectedCity)}&school=${encodeURIComponent(schoolId)}`);
  };

  const handleAddSchool = async () => {
    if (!newSchoolName.trim() || !newSchoolZhName.trim()) {
      console.error('请填写完整的学校信息');
      return;
    }
    const provinceName = provinceCityData?.[selectedProvince]?.name || '';
    router.push(`/contribute?type=school&province=${encodeURIComponent(provinceName)}&city=${encodeURIComponent(selectedCity)}&school=${encodeURIComponent(newSchoolName)}&schoolZh=${encodeURIComponent(newSchoolZhName)}`);
  };

  const handleGoBack = () => {
    router.push('/contribute');
  };

  if (!confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Modified header without back button */}
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            手动选择城市
          </h1>

          <form onSubmit={handleConfirmLocation} className={`bg-white rounded-xl shadow-md p-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">选择省份</label>
                <select
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                >
                  <option value="">请选择省份</option>
                  {loadingProvinceData ? (
                    <option value="">加载中...</option>
                  ) : (
                    provinceList.map(province => (
                      <option key={province.id} value={province.id}>{province.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">选择城市</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                  disabled={!selectedProvince}
                >
                  <option value="">请先选择省份</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className={`px-8 py-3 rounded-lg transition-colors duration-200 text-lg font-medium ${
                  !selectedCity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={!selectedCity}
              >
                {loading ? '处理中...' : '确认选择'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setConfirmed(false);
                setIsTransitioning(false);
              }, 150);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="返回"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            选择学校 - {selectedCity}
          </h1>
        </div>

        <div className={`bg-white rounded-xl shadow-md p-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : showAddSchool ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setShowAddSchool(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">添加新学校</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">学校中文名称（使用谐音替换原来的名字）</label>
                  <input
                    type="text"
                    value={newSchoolZhName}
                    onChange={(e) => setNewSchoolZhName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">学校真正的英文名</label>
                  <input
                    type="text"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddSchool(false)}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                >
                  返回
                </button>
                <button
                  onClick={handleAddSchool}
                  disabled={!newSchoolName || !newSchoolZhName}
                  className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                    !newSchoolName || !newSchoolZhName
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  提交学校
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-medium text-gray-800">选择学校</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schools.map(school => (
                    <div
                      key={school.id}
                      onClick={() => handleSelectSchool(school.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedSchool === school.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{school.name}</div>
                      <div className="text-gray-500 text-sm mt-1">{school.id.replace(/-/g, ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowAddSchool(true)}
                  className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  没有我要贡献的学校
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}