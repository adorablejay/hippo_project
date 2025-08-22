// src/components/SimpleLogin.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const SimpleLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated, requiresNewPassword, signIn, signOut, tokens, completeNewPasswordChallenge } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(username, password);
      
      // 새 비밀번호 설정이 필요한 경우
      if (result && result.requiresNewPassword) {
        console.log('새 비밀번호 설정이 필요합니다');
      }
    } catch (err: any) {
      setError(err.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await completeNewPasswordChallenge(newPassword);
    } catch (err: any) {
      setError(err.message || '새 비밀번호 설정 실패');
    } finally {
      setLoading(false);
    }
  };

  // 새 비밀번호 설정 UI
  if (requiresNewPassword) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-orange-600">새 비밀번호 설정</h2>
        <p className="mb-4 text-gray-600">임시 비밀번호로 로그인했습니다. 새로운 비밀번호를 설정해주세요.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleNewPassword}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">최소 8자 이상 입력해주세요</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? '설정 중...' : '새 비밀번호 설정'}
          </button>
        </form>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="p-4 bg-green-100 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800">로그인 성공!</h2>
        <p className="text-green-600">Cognito 인증이 정상적으로 작동합니다.</p>
        
        {tokens && (
          <div className="mt-3 p-3 bg-white rounded border">
            <h3 className="font-medium text-sm mb-2">토큰 정보 (API Gateway 호출용):</h3>
            <div className="text-xs space-y-1">
              <div><strong>Access Token:</strong> {tokens.accessToken.substring(0, 20)}...</div>
              <div><strong>ID Token:</strong> {tokens.idToken.substring(0, 20)}...</div>
              <div><strong>Refresh Token:</strong> {tokens.refreshToken.substring(0, 20)}...</div>
            </div>
          </div>
        )}
        
        <button
          onClick={signOut}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Cognito 로그인 테스트</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">이메일</label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
        <p className="font-medium">테스트 계정 생성 방법:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>AWS Cognito 콘솔에서 "Users" 탭으로 이동</li>
          <li>"Create user" 클릭</li>
          <li>이메일과 임시 비밀번호 입력</li>
          <li>생성된 계정으로 로그인 테스트</li>
          <li>첫 로그인 시 새 비밀번호 설정 필요</li>
        </ol>
      </div>
    </div>
  );
};
