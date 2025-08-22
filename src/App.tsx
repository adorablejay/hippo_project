// src/App.tsx
import { useState, useEffect } from 'react';
import CertificationCommunity from './components/CertificationCommunity';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 환경변수 접근 예시
  const apiUrl = (import.meta as any).env.VITE_API_URL || 'https://23ay3reie5.execute-api.ap-northeast-2.amazonaws.com/dev';
  const appEnv = (import.meta as any).env.VITE_APP_ENV || 'development';
  
  useEffect(() => {
    console.log('=== 환경변수 디버깅 ===');
    console.log('import.meta.env:', (import.meta as any).env);
    console.log('VITE_API_URL 직접 접근:', (import.meta as any).env.VITE_API_URL);
    console.log('VITE_APP_ENV 직접 접근:', (import.meta as any).env.VITE_APP_ENV);
    console.log('API URL 변수:', apiUrl);
    console.log('App Environment 변수:', appEnv);
    console.log('========================');
    setIsLoading(false);
  }, [apiUrl, appEnv]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">로딩 중...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-4 bg-red-100 rounded-lg">
          <h1 className="text-2xl font-bold text-red-800">에러 발생</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {/* 환경변수 디버깅 정보 (개발용) */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <p>API URL: {apiUrl}</p>
        <p>App Environment: {appEnv}</p>
      </div>
      
      {/* 메인 컴포넌트 */}
      <CertificationCommunity />
    </div>
  );
}
