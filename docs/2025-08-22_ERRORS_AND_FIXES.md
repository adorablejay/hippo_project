# 2025-08-22 오류 및 수정사항 상세 정리

## 📋 개요
이 문서는 API Gateway와 Cognito 연동 과정에서 발생한 모든 오류와 그 해결 방법을 상세히 정리한 문서입니다.

## 🔍 오류 1: AWS Amplify 관련 오류

### 오류 내용
```
Uncaught TypeError: Cannot read properties of undefined (reading 'loginWith') 
at AmplifyClass.notifyOAuthListener ... at amplify-config.ts:29:9
```

### 원인
- 사용자가 Amplify를 사용하지 않는다고 명시했음
- 프로젝트에 Amplify 관련 코드가 남아있어서 발생

### 해결 방법
1. **파일 삭제**: `src/amplify-config.ts` 삭제
2. **코드 수정**: `src/hooks/useAuth.ts`에서 Amplify 의존성 제거
3. **코드 수정**: `src/api/client.ts`에서 Amplify 의존성 제거

### 수정된 파일들
- `src/hooks/useAuth.ts`: Amplify Auth 대신 직접 Cognito OAuth 구현
- `src/api/client.ts`: Amplify API 대신 Axios 사용

---

## 🔍 오류 2: 환경변수 로딩 실패

### 오류 내용
```
App.tsx:13 API URL: undefined
App.tsx:14 App Environment: undefined
```

### 원인
- Vite에서 `.env.development` 파일의 환경변수를 제대로 로딩하지 못함
- `vite.config.ts`의 `loadEnv` 설정 문제

### 해결 과정

#### 1단계: `.env.development` 파일 생성
```env
VITE_API_URL=https://23ay3reie5.execute-api.ap-northeast-2.amazonaws.com/dev
VITE_APP_ENV=development
VITE_COGNITO_USER_POOL_ID=ap-northeast-2_fmR6dIqxQ
VITE_COGNITO_CLIENT_ID=51jobrjs4rkj7u6cfso9og00le
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_DOMAIN=https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com
```

#### 2단계: `vite.config.ts` 수정
```typescript
// 수정 전
const env = loadEnv(mode, process.cwd(), 'VITE_')

// 수정 후
const env = loadEnv(mode, process.cwd(), '')
```

#### 3단계: `src/types/index.ts` 수정
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_REGION: string
  readonly VITE_COGNITO_DOMAIN: string
}
```

### 수정된 파일들
- `.env.development`: 환경변수 파일 생성
- `vite.config.ts`: `loadEnv` 설정 수정
- `src/types/index.ts`: 환경변수 타입 정의 추가

---

## 🔍 오류 3: Cognito Hosted UI 403 Forbidden

### 오류 내용
```
Login pages unavailable Please contact an administrator.
GET .../login?... 403 (Forbidden)
```

### 원인
- Cognito App Client OAuth 2.0 설정 문제
- Callback URLs, Scopes, OAuth Flows 설정 오류

### 해결 과정

#### 1단계: 초기 User Pool 삭제
- 기존 User Pool `ap-northeast-2_Wb3JGNXZH` 삭제
- 관련 App Client도 함께 삭제

#### 2단계: 새 User Pool 생성
- **User Pool ID**: `ap-northeast-2_fmR6dIqxQ`
- **App Client ID**: `51jobrjs4rkj7u6cfso9og00le`
- **Domain**: `hippo-project-auth`

#### 3단계: OAuth 설정
- **OAuth Flows**: Authorization Code Grant, Implicit Grant 활성화
- **Callback URLs**: `http://localhost:5173`, `http://localhost:5174`
- **Logout URLs**: `http://localhost:5173`, `http://localhost:5174`
- **Scopes**: `email`, `openid`, `profile`

### 수정된 파일들
- `.env.development`: 새로운 Cognito 정보로 업데이트
- `src/hooks/useAuth.ts`: 새로운 Cognito 설정 적용

---

## 🔍 오류 4: Cognito Domain "Missing Authentication Token"

### 오류 내용
```
{"message":"Missing Authentication Token"}
```

### 원인
- Cognito Domain이 설정되지 않거나 활성화되지 않음

### 해결 방법
1. **Cognito Console** → **App integration** → **Domain name**
2. **Cognito domain** 선택
3. **Domain prefix**: `hippo-project-auth` 입력
4. **Save changes**

---

## 🔍 오류 5: CORS 에러 (지속적 문제)

### 오류 내용
```
Access to XMLHttpRequest at 'https://23ay3reie5.execute-api.ap-northeast-2.amazonaws.com/dev/api/jobs' 
from origin 'http://localhost:5174' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

### 원인
- API Gateway OPTIONS 메서드가 제대로 응답하지 않음
- CORS 헤더 설정 문제

### 해결 시도들

#### 시도 1: CORS 설정 추가
- API Gateway → Resources → `/api/jobs` → Actions → Enable CORS
- 헤더 설정:
  - Access-Control-Allow-Origin: `*`
  - Access-Control-Allow-Methods: `GET,OPTIONS`
  - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`

#### 시도 2: OPTIONS 메서드 수동 생성
- OPTIONS 메서드 생성
- Mock Integration 설정
- Method Response 헤더 설정

### 현재 상태
- **문제**: 여전히 OPTIONS 메서드 응답 실패
- **해결 필요**: OPTIONS 메서드 완전 재설정

---

## 🔍 오류 6: 401 Unauthorized (인증 토큰 문제)

### 오류 내용
```
401 Unauthorized
{"message": "Unauthorized"}
```

### 원인
- Cognito Authorizer가 실제 Cognito JWT 토큰만 인식
- 임시 토큰으로는 인증 불가

### 해결 과정

#### 1단계: 임시 토큰 사용 (테스트용)
```typescript
// src/hooks/useAuth.ts
const signIn = async () => {
  const tempToken = `temp-token-${Date.now()}`;
  localStorage.setItem('authToken', tempToken);
  setIsAuthenticated(true);
};
```

#### 2단계: 실제 Cognito OAuth 구현
```typescript
// src/hooks/useAuth.ts
const signIn = async () => {
  const cognitoLoginUrl = `${COGNITO_CONFIG.domain}/login?` + 
    `client_id=${COGNITO_CONFIG.clientId}&` +
    `response_type=code&` +
    `scope=openid+email+profile&` +
    `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
    `state=${Date.now()}`;
  
  window.location.assign(cognitoLoginUrl);
};
```

### 수정된 파일들
- `src/hooks/useAuth.ts`: Cognito OAuth 로그인 구현
- `src/api/client.ts`: JWT 토큰 인터셉터 구현

---

## 📝 주요 코드 수정사항

### 1. `src/hooks/useAuth.ts` 주요 변경사항

#### 수정 전 (Amplify 사용)
```typescript
import { Auth } from 'aws-amplify';

const signIn = async (username: string, password: string) => {
  const user = await Auth.signIn(username, password);
  return user;
};
```

#### 수정 후 (직접 Cognito OAuth)
```typescript
const signIn = async () => {
  const cognitoLoginUrl = `${COGNITO_CONFIG.domain}/login?` + 
    `client_id=${COGNITO_CONFIG.clientId}&` +
    `response_type=code&` +
    `scope=openid+email+profile&` +
    `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
    `state=${Date.now()}`;
  
  window.location.assign(cognitoLoginUrl);
};
```

### 2. `src/api/client.ts` 주요 변경사항

#### 수정 전 (Amplify API)
```typescript
import { API } from 'aws-amplify';

const apiClient = API;
```

#### 수정 후 (Axios 사용)
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 인터셉터 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. `vite.config.ts` 주요 변경사항

#### 수정 전
```typescript
export default defineConfig({
  plugins: [react()],
  // 환경변수 설정 없음
});
```

#### 수정 후
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('=== Vite Config 환경변수 디버깅 ===');
  console.log('Mode:', mode);
  console.log('Loaded env:', env);
  console.log('VITE_API_URL:', env.VITE_API_URL);
  console.log('=====================================');
  
  return {
    plugins: [react()],
    // ... 기타 설정
  };
});
```

### 4. `src/App.tsx` 주요 변경사항

#### 수정 전
```typescript
export default function App() {
  return (
    <div className="App">
      <CertificationCommunity />
    </div>
  );
}
```

#### 수정 후 (디버깅용)
```typescript
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = (import.meta as any).env.VITE_API_URL || 'https://23ay3reie5.execute-api.ap-northeast-2.amazonaws.com/dev';
  const appEnv = (import.meta as any).env.VITE_APP_ENV || 'development';
  
  useEffect(() => {
    console.log('=== 환경변수 디버깅 ===');
    console.log('VITE_API_URL 직접 접근:', (import.meta as any).env.VITE_API_URL);
    console.log('API URL 변수:', apiUrl);
    console.log('========================');
    setIsLoading(false);
  }, [apiUrl, appEnv]);
  
  return (
    <div className="App">
      {/* 환경변수 디버깅 표시 */}
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', margin: '10px' }}>
        <p>API URL: {apiUrl}</p>
        <p>App Environment: {appEnv}</p>
      </div>
      <CertificationCommunity />
    </div>
  );
}
```

---

## 🎯 해결된 문제들

### ✅ 완전 해결
1. **AWS Amplify 의존성 제거**: 모든 Amplify 관련 코드 제거 완료
2. **환경변수 로딩**: Vite에서 모든 VITE_ 변수 정상 로딩
3. **Cognito 설정**: 새 User Pool 생성 및 OAuth 설정 완료
4. **로그인/회원가입**: Cognito Hosted UI 정상 작동
5. **토큰 관리**: JWT 토큰 자동 저장 및 관리

### 🔄 진행 중
1. **CORS 문제**: OPTIONS 메서드 응답 실패 (해결 필요)

---

## 📊 오류 해결 통계

| 오류 유형 | 상태 | 해결 방법 |
|-----------|------|-----------|
| Amplify 의존성 | ✅ 해결 | 코드 제거 |
| 환경변수 로딩 | ✅ 해결 | 설정 수정 |
| Cognito 설정 | ✅ 해결 | 재생성 |
| Cognito Domain | ✅ 해결 | 활성화 |
| CORS 설정 | 🔄 진행 중 | OPTIONS 메서드 재설정 |
| 인증 토큰 | ✅ 해결 | OAuth 구현 |

---

## 🎉 주요 성과

### 기술적 성과
1. **AWS Amplify 제거**: 불필요한 의존성 제거로 프로젝트 경량화
2. **직접 Cognito 연동**: 더 세밀한 제어 가능
3. **환경변수 관리**: Vite 환경변수 시스템 완전 이해
4. **OAuth 구현**: Authorization Code Flow 완전 구현

### 학습 성과
1. **AWS Cognito**: User Pool, App Client, Domain 설정 방법
2. **API Gateway**: CORS, Authorizer, Mock Integration 설정
3. **React + TypeScript**: 환경변수, 인터셉터, 상태 관리
4. **문제 해결**: 체계적인 디버깅 및 해결 과정

---

## 📚 참고 자료

### AWS 공식 문서
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [API Gateway CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
- [Cognito OAuth 2.0](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-idp-settings.html)

### 기술 스택 문서
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)

---

**이 문서는 프로젝트 진행 과정에서 발생한 모든 오류와 해결 방법을 기록한 것으로, 향후 유사한 문제 해결 시 참고 자료로 활용할 수 있습니다.**
