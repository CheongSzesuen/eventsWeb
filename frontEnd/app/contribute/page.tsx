'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 包装组件
function ContributeContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const city = searchParams.get('city');
  const school = searchParams.get('school');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {type === 'random' && '贡献随机事件'}
        {type === 'exam' && '贡献考试事件'}
        {type === 'school' && `为 ${school || ''} (${city || ''}) 贡献学校事件`}
      </h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <p>事件编辑表单将在这里显示...</p>
      </div>
    </div>
  );
}

// 主页面组件
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
