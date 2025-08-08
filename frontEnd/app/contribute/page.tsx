'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import ReCAPTCHA from 'react-google-recaptcha';
import provinceCityMap from '@/public/data/provinceCityMap.json';
import type { ProvinceCityMap } from '@/types/provinceCityMap';

// 使用双重类型断言确保类型安全
const typedProvinceCityMap = provinceCityMap as unknown as ProvinceCityMap;

interface RandomResult {
  id: string;
  text: string;
  achievement: string;
  prob: number;
  isEndGame: boolean;
}

interface Option {
  id: number;
  text: string;
  result: string;
  achievement: string;
  isEndGame: boolean;
  isRandom: boolean;
  randomResults: RandomResult[];
}

interface SchoolMap {
  [key: string]: string;
}

interface BackendSubmitData {
  type: 'school' | 'random' | 'exam';
  question: string;
  text: string;
  choices: Record<string, string>;
  results: Record<string, string>;
  randomResults?: Record<string, Array<{
    text: string;
    prob: number;
    end_game?: boolean;
    achievement?: string;
  }>>;
  contributors: string[];
  recaptchaToken: string;
  province?: string;
  city?: string;
  school?: string;
  schoolZh?: string;
}

function ContributeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams?.get('type') || '';
  const city = searchParams?.get('city') || '';
  const school = searchParams?.get('school') || '';
  const province = searchParams?.get('province') || '';
  const schoolZh = searchParams?.get('schoolZh') || '';
  
  const [schoolMap, setSchoolMap] = useState<SchoolMap>({});
  const [options, setOptions] = useState<Option[]>([
    {
      id: 1,
      text: '',
      result: '',
      achievement: '',
      isEndGame: false,
      isRandom: false,
      randomResults: [
        { id: 'random1', text: '', achievement: '', prob: 0.5, isEndGame: false },
        { id: 'random2', text: '', achievement: '', prob: 0.5, isEndGame: false },
      ],
    },
    {
      id: 2,
      text: '',
      result: '',
      achievement: '',
      isEndGame: false,
      isRandom: false,
      randomResults: [
        { id: 'random1', text: '', achievement: '', prob: 0.5, isEndGame: false },
        { id: 'random2', text: '', achievement: '', prob: 0.5, isEndGame: false },
      ],
    },
  ]);
  const [contributors, setContributors] = useState(['']);
  const [problemDescription, setProblemDescription] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchoolMap = async () => {
      try {
        const response = await fetch('/data/schoolMap.json');
        setSchoolMap(await response.json());
      } catch (error) {
        console.error('加载学校数据失败:', error);
      }
    };
    loadSchoolMap();
  }, []);

  const getDisplayName = () => {
    if (schoolZh) return schoolZh;
    return schoolMap[school] || formatSchoolId(school);
  };

  const formatSchoolId = (id: string) => {
    return id.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getLocationDisplay = () => {
    const provinceName = typedProvinceCityMap[province]?.name || province;
    const cityName = typedProvinceCityMap[province]?.cities[city] || city;
    return `${provinceName}${cityName ? `-${cityName}` : ''}`;
  };

  const transformToBackendFormat = (): BackendSubmitData => {
    return {
      type: type as 'school' | 'random' | 'exam',
      question: problemDescription,
      text: problemDescription,
      choices: options.reduce((acc, option) => {
        acc[option.id] = option.text;
        return acc;
      }, {} as Record<string, string>),
      results: options.reduce((acc, option) => {
        acc[option.id] = option.result;
        return acc;
      }, {} as Record<string, string>),
      ...(options.some(opt => opt.isRandom) ? {
        randomResults: options.reduce((acc, option) => {
          if (option.isRandom && option.randomResults.length > 0) {
            acc[option.id] = option.randomResults.map(res => ({
              text: res.text,
              prob: res.prob,
              ...(res.isEndGame ? { end_game: true } : {}),
              ...(res.achievement ? { achievement: res.achievement } : {})
            }));
          }
          return acc;
        }, {} as Record<string, any>)
      } : {}),
      contributors: contributors.filter(c => c.trim()),
      recaptchaToken: recaptchaToken || '',
      ...(type === 'school' ? {
        province,
        city,
        school,
        schoolZh: schoolMap[school] || ''
      } : {})
    };
  };

  const addOption = () => {
    setOptions([
      ...options,
      {
        id: options.length + 1,
        text: '',
        result: '',
        achievement: '',
        isEndGame: false,
        isRandom: false,
        randomResults: [
          { id: 'random1', text: '', achievement: '', prob: 0.5, isEndGame: false },
          { id: 'random2', text: '', achievement: '', prob: 0.5, isEndGame: false },
        ],
      },
    ]);
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter(option => option.id !== id));
  };

  const handleOptionChange = (id: number, field: keyof Option, value: string | boolean) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  const addRandomResult = (optionId: number) => {
    setOptions(options.map(option => {
      if (option.id !== optionId) return option;
      
      const newId = `random${option.randomResults.length + 1}`;
      return {
        ...option,
        randomResults: [
          ...option.randomResults,
          { 
            id: newId, 
            text: '', 
            achievement: '', 
            prob: 0, 
            isEndGame: false 
          }
        ]
      };
    }));
  };

  const removeRandomResult = (optionId: number, randomId: string) => {
    setOptions(options.map(option => {
      if (option.id !== optionId || option.randomResults.length <= 2) return option;
      return {
        ...option,
        randomResults: option.randomResults.filter(r => r.id !== randomId)
      };
    }));
  };

  const handleRandomResultChange = (
    optionId: number,
    randomId: string,
    field: keyof RandomResult,
    value: string | number | boolean
  ) => {
    setOptions(options.map(option => {
      if (option.id !== optionId) return option;
      return {
        ...option,
        randomResults: option.randomResults.map(r => 
          r.id === randomId ? { ...r, [field]: value } : r
        )
      };
    }));
  };

  const toggleRandom = (id: number, isRandom: boolean) => {
    setOptions(options.map(option => {
      if (option.id !== id) return option;
      return {
        ...option,
        isRandom,
        result: isRandom ? '' : option.result,
        achievement: isRandom ? '' : option.achievement,
        isEndGame: isRandom ? false : option.isEndGame,
        randomResults: isRandom
          ? [
              { id: 'random1', text: '', achievement: '', prob: 0.5, isEndGame: false },
              { id: 'random2', text: '', achievement: '', prob: 0.5, isEndGame: false },
            ]
          : option.randomResults
      };
    }));
  };

  const addContributor = () => {
    if (contributors[0]?.trim()) {
      setContributors([...contributors, '']);
    }
  };

  const removeContributor = (index: number) => {
    if (contributors.length <= 1) return;
    const newContributors = [...contributors];
    newContributors.splice(index, 1);
    setContributors(newContributors);
  };

  const handleContributorChange = (index: number, value: string) => {
    const newContributors = [...contributors];
    newContributors[index] = value;
    setContributors(newContributors);
  };

  const validateForm = (): boolean => {
    if (!problemDescription.trim()) {
      setSubmitError('请填写问题描述');
      return false;
    }

    if (options.some(opt => !opt.text.trim() && opt.id <= 2)) {
      setSubmitError('请填写至少两个选项');
      return false;
    }

    if (options.some(opt => 
      opt.isRandom && 
      Math.abs(opt.randomResults.reduce((sum, r) => sum + (r.prob || 0), 0) - 1) > 0.01
    )) {
      setSubmitError('随机选项的概率总和必须等于1');
      return false;
    }

    if (contributors.every(c => !c.trim())) {
      setSubmitError('请至少填写一个贡献者');
      return false;
    }

    if (type === 'school') {
      if (!province || !city || !school) {
        setSubmitError('学校事件必须包含完整的地区信息');
        return false;
      }
    }

    setSubmitError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!recaptchaToken) {
      setSubmitError('请完成人机验证');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const transformedData = transformToBackendFormat();

      const response = await fetch('https://eventsapi.okschoollife.fun/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        },
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `提交失败: ${response.status}`);
      }

      const data = await response.json();
      router.push(`/contribute/success?id=${data.id}`);
    } catch (error) {
      console.error('提交错误:', error);
      setSubmitError(error instanceof Error ? error.message : '提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/contribute/school-select?city=${city}&province=${province}`)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="返回"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {type === 'school' ? `为 ${getDisplayName()} 贡献学校事件` : 
             type === 'random' ? '贡献随机事件' : '贡献考试事件'}
          </h1>
          {type === 'school' && (
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {getLocationDisplay()}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                ID: {school}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {submitError}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="block text-base font-medium text-gray-700 mb-2">
              问题描述:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="请输入问题描述..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
            />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="block text-base font-medium text-gray-700 mb-2">
              选项: <span className="text-sm text-gray-500">(至少需要2个)</span>
            </label>
            <div className="space-y-4">
              {options.map(option => (
                <div key={option.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4 mb-3">
                    <input
                      type="text"
                      placeholder={`选项${option.id}`}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                      required={option.id <= 2}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                        onClick={() => removeOption(option.id)}
                      >
                        删除
                      </button>
                    )}
                  </div>

                  {!option.isRandom ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="结果"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={option.result}
                        onChange={(e) => handleOptionChange(option.id, 'result', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="成就 (可选)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={option.achievement}
                        onChange={(e) => handleOptionChange(option.id, 'achievement', e.target.value)}
                      />
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            checked={option.isEndGame}
                            onChange={(e) => handleOptionChange(option.id, 'isEndGame', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">是否结束游戏</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-gray-700">随机结果:</span>
                        <button
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          onClick={() => addRandomResult(option.id)}
                        >
                          添加随机结果
                        </button>
                      </div>

                      {option.randomResults.map(result => (
                        <div key={result.id} className="border border-gray-200 p-3 rounded bg-white">
                          {option.randomResults.length > 2 && (
                            <div className="flex justify-end mb-2">
                              <button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                onClick={() => removeRandomResult(option.id, result.id)}
                              >
                                删除
                              </button>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700 whitespace-nowrap">概率:</label>
                              <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.01"
                                className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={result.prob}
                                onChange={(e) => handleRandomResultChange(option.id, result.id, 'prob', parseFloat(e.target.value))}
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="结果"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={result.text}
                                onChange={(e) => handleRandomResultChange(option.id, result.id, 'text', e.target.value)}
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="成就 (可选)"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                            value={result.achievement}
                            onChange={(e) => handleRandomResultChange(option.id, result.id, 'achievement', e.target.value)}
                          />
                          <div className="flex items-center mt-2">
                            <label className="flex items-center cursor-pointer gap-2">
                              <input
                                type="checkbox"
                                checked={result.isEndGame}
                                onChange={(e) => handleRandomResultChange(option.id, result.id, 'isEndGame', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">是否结束游戏</span>
                            </label>
                          </div>
                        </div>
                      ))}

                      <div className="text-sm text-gray-600">
                        总概率: {option.randomResults.reduce((sum, r) => sum + (r.prob || 0), 0).toFixed(2)}
                        {Math.abs(option.randomResults.reduce((sum, r) => sum + (r.prob || 0), 0) - 1) > 0.01 && (
                          <span className="text-red-600 ml-2">概率总和必须等于1</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center mt-3">
                    <label className="flex items-center cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={option.isRandom}
                        onChange={(e) => toggleRandom(option.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">是否为随机结果</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={addOption}
            >
              添加选项
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="block text-base font-medium text-gray-700 mb-2">
              贡献者: <span className="text-sm text-gray-500">(至少需要1个)</span>
            </label>
            <div className="space-y-3">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="贡献者名称"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={contributor}
                    onChange={(e) => handleContributorChange(index, e.target.value)}
                  />
                  {contributors.length > 1 && (
                    <button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                      onClick={() => removeContributor(index)}
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={addContributor}
              >
                添加贡献者
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <ReCAPTCHA
              sitekey="6LdQz50rAAAAABd5ABB3y4gBuvgKv0woqeIifDYH"
              onChange={setRecaptchaToken}
              onExpired={() => setRecaptchaToken(null)}
              theme="light"
            />
            {!recaptchaToken && (
              <p className="mt-2 text-sm text-red-600">请完成人机验证</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!recaptchaToken || isSubmitting}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                !recaptchaToken ? 'bg-gray-400 cursor-not-allowed' : 
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors flex items-center justify-center min-w-32`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  提交中...
                </>
              ) : '提交'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContributePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    }>
      <ContributeContent />
    </Suspense>
  );
}