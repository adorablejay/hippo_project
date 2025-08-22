// src/api/client.ts
import axios from 'axios';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = (import.meta as any).env.VITE_API_URL;

console.log('=== API Client 디버깅 ===');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('import.meta.env.VITE_API_URL:', (import.meta as any).env.VITE_API_URL);
console.log('==========================');

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (기본 토큰 추가)
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API 요청에 토큰 추가:', token.substring(0, 20) + '...');
      } else {
        console.log('인증 토큰이 없습니다.');
      }
    } catch (error) {
      // 토큰이 없거나 만료된 경우 (로그인되지 않은 상태)
      console.log('인증 토큰이 없습니다.');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (예: 에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// API 테스트 함수들
export const testAPI = {
  // 인증 없이 API 호출 테스트
  testWithoutAuth: async () => {
    try {
      console.log('=== 인증 없이 API 호출 테스트 ===');
      const response = await axios.get(`${API_BASE_URL}/api/jobs`);
      console.log('성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('실패:', error.response?.status, error.response?.data);
      return null;
    }
  },

  // 인증과 함께 API 호출 테스트
  testWithAuth: async () => {
    try {
      console.log('=== 인증과 함께 API 호출 테스트 ===');
      const response = await apiClient.get('/api/jobs');
      console.log('성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('실패:', error.response?.status, error.response?.data);
      return null;
    }
  },

  // CORS 테스트
  testCORS: async () => {
    try {
      console.log('=== CORS 테스트 ===');
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization,Content-Type',
        },
      });
      console.log('CORS 응답:', response.status, response.headers);
      return response;
    } catch (error) {
      console.log('CORS 에러:', error);
      return null;
    }
  }
};

export default apiClient;

