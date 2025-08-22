// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

// Cognito 설정
const COGNITO_CONFIG = {
  userPoolId: (import.meta as any).env.VITE_COGNITO_USER_POOL_ID || 'undefined',
  clientId: (import.meta as any).env.VITE_COGNITO_CLIENT_ID || 'undefined',
  region: (import.meta as any).env.VITE_COGNITO_REGION || 'undefined',
  domain: (import.meta as any).env.VITE_COGNITO_DOMAIN || 'undefined',
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  // 인증 상태 확인
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // URL에서 authorization code 확인
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('Cognito 인증 코드 발견:', code);
        // authorization code를 access token으로 교환
        await exchangeCodeForToken(code);
        // URL에서 code 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // 기존 토큰 확인
        const token = localStorage.getItem('authToken');
        if (token) {
          console.log('기존 토큰 발견');
          setAuthState({
            isAuthenticated: true,
            user: { username: 'user' },
            loading: false
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      }
    } catch (error) {
      console.error('인증 상태 확인 에러:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  // authorization code를 access token으로 교환
  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log('토큰 교환 시작...');
      
      // Cognito 토큰 엔드포인트로 POST 요청
      const tokenEndpoint = `${COGNITO_CONFIG.domain}/oauth2/token`;
      
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: COGNITO_CONFIG.clientId,
          code: code,
          redirect_uri: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error(`토큰 교환 실패: ${response.status}`);
      }

      const tokenData = await response.json();
      console.log('토큰 교환 성공:', tokenData);

      // access token 저장
      localStorage.setItem('authToken', tokenData.access_token);
      
      // 사용자 정보 가져오기
      await getUserInfo(tokenData.access_token);
      
    } catch (error) {
      console.error('토큰 교환 에러:', error);
      throw error;
    }
  };

  // 사용자 정보 가져오기
  const getUserInfo = async (accessToken: string) => {
    try {
      const userInfoEndpoint = `${COGNITO_CONFIG.domain}/oauth2/userInfo`;
      
      const response = await fetch(userInfoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`사용자 정보 조회 실패: ${response.status}`);
      }

      const userInfo = await response.json();
      console.log('사용자 정보:', userInfo);

      setAuthState({
        isAuthenticated: true,
        user: userInfo,
        loading: false
      });
      
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error);
      // 토큰은 있지만 사용자 정보 조회 실패 시 기본 사용자로 설정
      setAuthState({
        isAuthenticated: true,
        user: { username: 'user' },
        loading: false
      });
    }
  };

  // 로그인 (Cognito OAuth 로그인)
  const signIn = async (username?: string, password?: string) => {
    try {
      console.log('Cognito OAuth 로그인 시작...');
      console.log('COGNITO_CONFIG:', COGNITO_CONFIG);
      console.log('환경변수 직접 확인:');
      console.log('- VITE_COGNITO_USER_POOL_ID:', (import.meta as any).env.VITE_COGNITO_USER_POOL_ID);
      console.log('- VITE_COGNITO_CLIENT_ID:', (import.meta as any).env.VITE_COGNITO_CLIENT_ID);
      console.log('- VITE_COGNITO_REGION:', (import.meta as any).env.VITE_COGNITO_REGION);
      console.log('- VITE_COGNITO_DOMAIN:', (import.meta as any).env.VITE_COGNITO_DOMAIN);
      
      // Cognito Hosted UI로 리다이렉트 (Authorization Code Flow)
      const cognitoLoginUrl = `${COGNITO_CONFIG.domain}/oauth2/authorize?` + 
        `client_id=${COGNITO_CONFIG.clientId}&` +
        `response_type=code&` +
        `scope=openid+email+profile&` +
        `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
        `state=${Date.now()}`;
      
      console.log('Cognito 로그인 URL:', cognitoLoginUrl);
      console.log('현재 window.location.origin:', window.location.origin);
      
      // Cognito 로그인 페이지로 이동
      window.location.assign(cognitoLoginUrl);
      
    } catch (error: any) {
      console.error('로그인 에러:', error);
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  };

  // 로그아웃 (Cognito OAuth 로그아웃)
  const signOut = async () => {
    try {
      console.log('Cognito OAuth 로그아웃 시작...');
      
      // 로컬 토큰 삭제
      localStorage.removeItem('authToken');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      
      // Cognito Hosted UI 로그아웃으로 리다이렉트
      const cognitoLogoutUrl = `${COGNITO_CONFIG.domain}/logout?` +
        `client_id=${COGNITO_CONFIG.clientId}&` +
        `logout_uri=${encodeURIComponent(window.location.origin)}`;
      
      console.log('Cognito 로그아웃 URL:', cognitoLogoutUrl);
      
      // 브라우저에서 Cognito 로그아웃 페이지로 이동
      window.location.href = cognitoLogoutUrl;
      
    } catch (error: any) {
      console.error('로그아웃 에러:', error);
      // 에러 발생 시 로컬에서만 로그아웃
      localStorage.removeItem('authToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  return {
    ...authState,
    signIn,
    signOut,
    checkAuthState
  };
};
