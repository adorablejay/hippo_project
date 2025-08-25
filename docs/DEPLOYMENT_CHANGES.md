# 📝 배포를 위한 파일 수정 내역

이 문서는 AWS S3 + CloudFront 배포를 위해 수정/생성된 모든 파일들과 변경사항을 정리합니다.

## 📋 수정/생성된 파일 목록

### **1. 새로 생성된 파일들**
- `deploy-config.json` - AWS 배포 설정
- `deploy.js` - 자동 배포 스크립트
- `DEPLOYMENT.md` - 배포 가이드 문서
- `server/index.ts` - Express 서버
- `.env.development` - 개발 환경변수
- `.env.production` - 프로덕션 환경변수
- `src/api/client.ts` - API 클라이언트
- `DEPLOYMENT_CHANGES.md` - 이 문서

### **2. 수정된 파일들**
- `package.json` - 의존성 및 스크립트 추가
- `vite.config.ts` - 빌드 설정 최적화
- `src/types/index.ts` - 환경변수 타입 정의
- `src/App.tsx` - 환경변수 사용 예시
- `.gitignore` - 배포 관련 파일 제외 설정

---

## 🔧 상세 수정 내역

### **1. deploy-config.json (새 생성)**

**목적**: AWS S3 + CloudFront 배포 설정

```json
{
  "s3": {
    "bucketName": "hippo1-bucket",
    "region": "ap-northeast-2"
  },
  "cloudfront": {
    "distributionId": "E3TWPOR1TVSU4O",
    "domain": "d23j17myaap3b.cloudfront.net"
  },
  "build": {
    "sourceDir": "dist",
    "cacheControl": {
      "html": "no-cache",
      "css": "max-age=31536000",
      "js": "max-age=31536000",
      "assets": "max-age=31536000"
    }
  }
}
```

**주요 설정**:
- S3 버킷명 및 리전
- CloudFront 배포 ID 및 도메인
- 파일 타입별 캐시 컨트롤 설정

---

### **2. deploy.js (새 생성)**

**목적**: 자동 배포 스크립트

**주요 기능**:
- 프로젝트 빌드 자동화
- S3 파일 업로드
- CloudFront 캐시 무효화
- 파일 타입별 적절한 헤더 설정

**수정 이력**:
```javascript
// 초기 버전 (Node.js 22에서 오류)
import config from './deploy-config.json' assert { type: 'json' };

// 수정된 버전 (호환성 개선)
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./deploy-config.json', 'utf8'));
```

---

### **3. package.json (수정)**

**추가된 의존성**:
```json
"@aws-sdk/client-s3": "^3.0.0",
"@aws-sdk/client-cloudfront": "^3.0.0"
```

**제거된 의존성**:
```json
"firebase": "^12.1.0"  // Firebase 사용하지 않음
```

**추가된 스크립트**:
```json
"deploy:s3": "npm run build && aws s3 sync dist/ s3://your-actual-bucket-name-here --delete",
"deploy:cloudfront": "npm run deploy:s3 && aws cloudfront create-invalidation --distribution-id E1234567890ABCD --paths \"/*\"",
"deploy": "node deploy.js"
```

---

### **4. vite.config.ts (수정)**

**추가된 설정**:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
```

**주요 변경사항**:
- `base: '/'` - S3 배포를 위한 기본 경로 설정
- `outDir: 'dist'` - 빌드 출력 디렉토리 명시
- `manualChunks` - 코드 분할 최적화
- `sourcemap: false` - 프로덕션 빌드 최적화

---

### **5. src/types/index.ts (수정)**

**추가된 타입 정의**:
```typescript
// 환경변수 타입 정의
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**목적**: TypeScript에서 환경변수 타입 안전성 보장

---

### **6. src/App.tsx (수정)**

**추가된 환경변수 사용 예시**:
```typescript
export default function App() {
  // 환경변수 접근 예시
  const apiUrl = import.meta.env.VITE_API_URL;
  const appEnv = import.meta.env.VITE_APP_ENV;
  
  console.log('API URL:', apiUrl);
  console.log('App Environment:', appEnv);
  
  return <CertificationCommunity />;
}
```

---

### **7. server/index.ts (새 생성)**

**목적**: Express 서버 (개발용)

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '서버가 정상적으로 실행 중입니다!' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
```

---

### **8. src/api/client.ts (새 생성)**

**목적**: API 클라이언트 설정

```typescript
import axios from 'axios';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청/응답 인터셉터 설정
// ... (인터셉터 로직)

export default apiClient;
```

---

### **9. 환경변수 파일들 (새 생성)**

#### **.env.development**
```
# 개발 환경 환경변수
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
```

#### **.env.production**
```
# 프로덕션 환경 환경변수
VITE_API_URL=https://your-api-domain.com
VITE_APP_ENV=production
```

---

### **10. .gitignore (수정)**

**추가된 제외 항목**:
```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# AWS credentials
.aws/
aws-credentials.json

# Build artifacts
build/
out/
```

---

## 🗂️ 삭제된 파일들

### **src/firebase/config.ts**
- Firebase 사용하지 않기로 결정하여 삭제
- 관련 의존성도 package.json에서 제거

---

## 🔄 수정 과정에서 발생한 문제들

### **1. Node.js 호환성 문제**
**문제**: `assert` 구문이 Node.js 22에서 지원되지 않음
**해결**: `readFileSync` 방식으로 변경

### **2. 서버 크래시 문제**
**문제**: `server/index.ts` 파일이 없어서 서버가 크래시됨
**해결**: Express 서버 파일 생성

### **3. 환경변수 파일 생성 문제**
**문제**: PowerShell에서 긴 명령어 실행 시 오류
**해결**: 메모장에서 직접 파일 생성

---

## 📊 최종 결과

### **배포 성공 파일들**:
- `index.html` (0.48 kB)
- `assets/index-CzkLkQ-D.css` (16.70 kB)
- `assets/index-AI998G_4.js` (41.07 kB)
- `assets/vendor-nf7bT_Uh.js` (140.87 kB)

### **배포된 URL**:
https://d23j17myaap3b.cloudfront.net

### **총 수정/생성 파일 수**: 11개

---

## 📝 참고사항

1. **환경변수**: `VITE_` 접두사 필수
2. **배포 스크립트**: Node.js 버전 호환성 고려 필요
3. **Firebase**: 사용하지 않으므로 관련 설정 모두 제거
4. **보안**: 환경변수 파일은 `.gitignore`에 포함
5. **캐시**: CloudFront 캐시 무효화 자동화

---

**마지막 업데이트**: 2025년 8월 21일
