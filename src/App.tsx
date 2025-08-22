// src/App.tsx
import CertificationCommunity from './components/CertificationCommunity';

export default function App() {
  // 환경변수 접근 예시
  const apiUrl = (import.meta as any).env.VITE_API_URL;
  const appEnv = (import.meta as any).env.VITE_APP_ENV;
  
  console.log('API URL:', apiUrl);
  console.log('App Environment:', appEnv);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="p-4 bg-blue-100 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800">자격증 커뮤니티</h1>
        <p className="text-blue-600">환경변수가 정상적으로 설정되었습니다.</p>
        <p className="text-sm mt-2">API URL: {apiUrl}</p>
        <p className="text-sm">App Environment: {appEnv}</p>
      </div>
      <CertificationCommunity />
    </div>
  );
}
