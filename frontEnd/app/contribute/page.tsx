'use client';

import { useSearchParams } from 'next/navigation';

export default function ContributePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const city = searchParams.get('city');
  const school = searchParams.get('school');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {type === 'random' && '贡献随机事件'}
        {type === 'exam' && '贡献考试事件'}
        {type === 'school' && `为 ${school} (${city}) 贡献学校事件`}
      </h1>
      
      {/* 这里放置事件编辑表单 */}
      <div className="bg-gray-100 p-4 rounded">
        <p>事件编辑表单将在这里显示...</p>
      </div>
    </div>
  );
}
