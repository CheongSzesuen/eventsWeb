'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

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

function ContributeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams?.get('type') || '';
  const city = searchParams?.get('city') || '';
  const school = searchParams?.get('school') || '';
  const province = searchParams?.get('province') || '';
  const schoolZh = searchParams?.get('schoolZh') || '';
  
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
  const [newContributor, setNewContributor] = useState('');

  // Format school ID to readable format (capitalize first letter of each word)
  const formatSchoolId = (id: string) => {
    return id.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get display name - prioritize Chinese name if available
  const getDisplayName = () => {
    if (schoolZh) {
      return schoolZh;
    }
    
    // Default display names based on school ID
    switch(school) {
      case 'yangxian-high-school':
        return '羊县中学';
      case 'hanzhong-high-school-of-shaanxi-province':
        return '闪西省汗忠中学';
      case 'hanzhong-long-gang-school':
        return '汗忠市龙港学校';
      default:
        return formatSchoolId(school);
    }
  };

  // Handle back to school selection
  const handleBackToSchoolSelection = () => {
    router.push(`/contribute/school-select?city=${city}&province=${province}`);
  };

  // Option operations
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
    setOptions(options.filter(option => option.id !== id));
  };

  const handleOptionChange = (id: number, field: keyof Option, value: string | boolean) => {
    setOptions(
      options.map(option =>
        option.id === id ? { ...option, [field]: value } : option
      )
    );
  };

  // Random result operations
  const addRandomResult = (optionId: number) => {
    const newRandomResults = options.find(option => option.id === optionId)?.randomResults || [];
    const newId = `random${newRandomResults.length + 1}`;
    setOptions(
      options.map(option =>
        option.id === optionId
          ? {
              ...option,
              randomResults: [
                ...newRandomResults,
                { id: newId, text: '', achievement: '', prob: 0, isEndGame: false },
              ],
            }
          : option
      )
    );
  };

  const removeRandomResult = (optionId: number, randomId: string) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option || option.randomResults.length <= 2) return;
    const newRandomResults = option.randomResults.filter(result => result.id !== randomId);
    setOptions(
      options.map(opt =>
        opt.id === optionId ? { ...opt, randomResults: newRandomResults } : opt
      )
    );
  };

  const handleRandomResultChange = (
    optionId: number,
    randomId: string,
    field: keyof RandomResult,
    value: string | number | boolean
  ) => {
    setOptions(
      options.map(option =>
        option.id === optionId
          ? {
              ...option,
              randomResults: option.randomResults.map(result =>
                result.id === randomId ? { ...result, [field]: value } : result
              ),
            }
          : option
      )
    );
  };

  const toggleRandom = (id: number, isRandom: boolean) => {
    setOptions(
      options.map(option =>
        option.id === id
          ? {
              ...option,
              isRandom: isRandom,
              result: isRandom ? '' : option.result,
              achievement: isRandom ? '' : option.achievement,
              isEndGame: isRandom ? false : option.isEndGame,
              randomResults: isRandom
                ? [
                    { id: 'random1', text: '', achievement: '', prob: 0.5, isEndGame: false },
                    { id: 'random2', text: '', achievement: '', prob: 0.5, isEndGame: false },
                  ]
                : option.randomResults,
            }
          : option
      )
    );
  };

  const validateRandomProbs = (optionId: number) => {
    const randomResults = options.find(option => option.id === optionId)?.randomResults || [];
    const totalProb = randomResults.reduce((sum, result) => sum + parseFloat(String(result.prob || 0)), 0);
    return parseFloat(totalProb.toFixed(2)) === 1;
  };

  // Contributor operations
  const addContributor = () => {
    if (contributors[0]?.trim()) {
      setContributors([...contributors, '']);
    }
  };

  const removeContributor = (index: number) => {
    if (contributors.length > 1) {
      const newContributors = [...contributors];
      newContributors.splice(index, 1);
      setContributors(newContributors);
    }
  };

  const handleContributorChange = (index: number, value: string) => {
    const newContributors = [...contributors];
    newContributors[index] = value;
    setContributors(newContributors);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Section */}
      {type === 'school' && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToSchoolSelection}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="返回"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              为 {getDisplayName()} 贡献学校事件
            </h1>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {province}-{city}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                ID: {school}
              </span>
            </div>
          </div>
        </div>
      )}
      {type === 'random' && (
        <h1 className="text-2xl font-bold mb-6">
          贡献随机事件
        </h1>
      )}
      {type === 'exam' && (
        <h1 className="text-2xl font-bold mb-6">
          贡献考试事件
        </h1>
      )}

      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="space-y-6">
          {/* Problem Description */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="block text-base font-medium text-gray-700 mb-2">
              问题描述:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="请输入问题描述..."
            />
          </div>

          {/* Options Section */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="block text-base font-medium text-gray-700 mb-2">选项:</label>
            <div className="space-y-4">
              {options.map(option => (
                <div key={option.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder={`选项${option.id}`}
                      className="w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={option.id < 3}
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                    />
                    {option.id > 2 && (
                      <button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                        onClick={() => removeOption(option.id)}
                      >
                        删除
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-3">
                    {/* Normal Result */}
                    {!option.isRandom && (
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
                          <label className="relative flex items-center cursor-pointer gap-2">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={option.isEndGame}
                              onChange={(e) => handleOptionChange(option.id, 'isEndGame', e.target.checked)}
                            />
                            <div className="w-5 h-5 border border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-colors">
                              <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700">是否结束游戏</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Random Results */}
                    {option.isRandom && (
                      <div className="space-y-3">
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
                            <div className="flex items-center mb-2 gap-2">
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
                              <input
                                type="text"
                                placeholder="结果"
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={result.text}
                                onChange={(e) => handleRandomResultChange(option.id, result.id, 'text', e.target.value)}
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="成就 (可选)"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                              value={result.achievement}
                              onChange={(e) => handleRandomResultChange(option.id, result.id, 'achievement', e.target.value)}
                            />
                            <div className="flex items-center">
                              <label className="relative flex items-center cursor-pointer gap-2">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={result.isEndGame}
                                  onChange={(e) => handleRandomResultChange(option.id, result.id, 'isEndGame', e.target.checked)}
                                />
                                <div className="w-5 h-5 border border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-colors">
                                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-sm text-gray-700">是否结束游戏</span>
                              </label>
                            </div>
                          </div>
                        ))}

                        {option.randomResults.length > 0 && (
                          <div className="text-sm text-gray-600">
                            总概率: {option.randomResults.reduce((sum, result) => sum + (result.prob || 0), 0).toFixed(2)}
                            {!validateRandomProbs(option.id) && (
                              <span className="text-red-600 ml-2">概率总和必须等于1</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Random Toggle */}
                    <div className="flex items-center">
                      <label className="relative flex items-center cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={option.isRandom}
                          onChange={(e) => toggleRandom(option.id, e.target.checked)}
                        />
                        <div className="w-5 h-5 border border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-colors">
                          <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">是否为随机结果</span>
                      </label>
                    </div>
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

          {/* Contributors Section */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="block text-base font-medium text-gray-700 mb-2">贡献者:</label>
            <div className="flex flex-wrap gap-2">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="贡献者"
                    className="w-40 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={contributor}
                    onChange={(e) => handleContributorChange(index, e.target.value)}
                  />
                  {contributors.length > 1 && (
                    <button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      onClick={() => removeContributor(index)}
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs"
                onClick={addContributor}
              >
                添加贡献者
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
            >
              提交
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ContributeContent />
    </Suspense>
  );
}