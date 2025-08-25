# 🚀 프론트엔드 S3+CloudFront 배포 완료 (2025.08.25)

## 📋 작업 개요

오늘 AWS S3와 CloudFront를 사용하여 React 프론트엔드를 성공적으로 배포했습니다. 
Cognito 인증과 API Gateway 연결도 완료하여 백엔드 연결 준비가 완료되었습니다.

## ✅ 완료된 작업들

### 1. AWS 리소스 재생성
- **S3 버킷**: `hippo-project-frontend` (새로 생성)
- **CloudFront 배포**: `E1FXL8ZNZFQFXQ` (새로 생성)
- **CloudFront 도메인**: `dpqtg23yw76f4.cloudfront.net`

### 2. 배포 스크립트 개발
- **deploy.js**: 커스텀 배포 스크립트 생성
- **deploy-config.json**: 배포 설정 파일 생성
- **package.json**: 배포 스크립트 추가

### 3. 환경 변수 설정
- **.env.development**: 개발 환경 변수 설정
- **.env.production**: 프로덕션 환경 변수 설정

### 4. Cognito 설정 완료
- **User Pool ID**: `ap-northeast-2_VrMMVwNd8`
- **App Client ID**: `2b797ioh6lhc571p8k463n3fmt`
- **도메인**: `https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com`

### 5. API Gateway 연결
- **API ID**: `w9dfgfhcm6`
- **API URL**: `https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev`
- **Cognito Authorizer**: 설정 완료
- **CORS**: 설정 완료

## 🛠️ 사용된 기술 스택

### 프론트엔드
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **AWS Amplify** (인증)

### 배포
- **AWS S3** (정적 파일 호스팅)
- **AWS CloudFront** (CDN)
- **AWS CLI** (배포 자동화)

### 인증 & API
- **AWS Cognito** (사용자 인증)
- **AWS API Gateway** (API 관리)

## 📁 프로젝트 구조

```
hippo_project/
├── src/
│   ├── components/
│   ├── hooks/
│   │   └── useAuth.ts (Cognito 인증 로직)
│   ├── api/
│   │   └── client.ts (API 클라이언트)
│   └── App.tsx
├── deploy.js (배포 스크립트)
├── deploy-config.json (배포 설정)
├── .env.development (개발 환경 변수)
├── .env.production (프로덕션 환경 변수)
└── package.json
```

## 🔧 배포 설정

### deploy-config.json
```json
{
  "s3": {
    "bucketName": "hippo-project-frontend",
    "region": "ap-northeast-2"
  },
  "cloudfront": {
    "distributionId": "E1FXL8ZNZFQFXQ",
    "domain": "dpqtg23yw76f4.cloudfront.net"
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

### 환경 변수
```env
# .env.development & .env.production
VITE_API_URL=https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev
VITE_APP_ENV=development/production
VITE_COGNITO_USER_POOL_ID=ap-northeast-2_VrMMVwNd8
VITE_COGNITO_CLIENT_ID=2b797ioh6lhc571p8k463n3fmt
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_DOMAIN=https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com
```

## 🚀 배포 명령어

```bash
# 전체 배포
npm run deploy

# 단계별 배포
npm run deploy:s3
npm run deploy:cloudfront

# 수동 배포
aws s3 sync dist/ s3://hippo-project-frontend/
aws cloudfront create-invalidation --distribution-id E1FXL8ZNZFQFXQ --paths '/*'
```

## 🌐 배포된 사이트

- **URL**: https://dpqtg23yw76f4.cloudfront.net/
- **상태**: 정상 작동
- **인증**: Cognito 로그인/로그아웃 정상 작동
- **API**: API Gateway 연결 정상 작동

---

## ❌ 발생한 오류들과 해결 방법

### 1. S3 버킷 정책 오류
**오류**: `Policy has invalid resource`
**원인**: S3 버킷 정책 설정 시 리소스 ARN 오류
**해결**: CloudFront OAC를 위한 올바른 버킷 정책 설정

### 2. 404 Not Found 오류 (index.html)
**오류**: `Code: NoSuchKey, Message: The specified key does not exist. Key: index.html`
**원인**: S3에 업로드된 파일 경로가 잘못됨 (`dist/index.html` → `index.html`)
**해결**: deploy.js 스크립트에서 경로 변환 로직 수정
```javascript
const key = file.replace(sourceDir + '/', '').replace(/\\/g, '/').replace(/^dist\//, '');
```

### 3. React 에러 #418, #423
**오류**: `Minified React error #418`, `Minified React error #423`
**원인**: 환경 변수 파일이 존재하지 않음
**해결**: `.env.development`와 `.env.production` 파일 생성

### 4. DNS 오류 (Cognito 도메인)
**오류**: `DNS_PROBE_FINISHED_NXDOMAIN`
**원인**: Cognito 도메인 URL 오타
**해결**: 올바른 Cognito 도메인으로 수정
```
잘못된 URL: https://hippo-project-auth.auth.ap-northeast-2.amazonaws.com
올바른 URL: https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com
```

### 5. 파일 경로 문제
**오류**: S3에 `dist/` 경로가 포함된 파일들이 업로드됨
**원인**: Windows 경로 구분자와 경로 변환 로직 문제
**해결**: 경로 변환 로직 개선
```javascript
// Windows 경로 구분자 처리 및 dist/ 경로 제거
const key = file.replace(sourceDir + '/', '').replace(/\\/g, '/').replace(/^dist\//, '');
```

### 6. CloudFront 캐시 문제
**오류**: 파일 업로드 후에도 이전 버전이 표시됨
**원인**: CloudFront 캐시가 무효화되지 않음
**해결**: 배포 후 자동 캐시 무효화 추가

---

## 📊 성능 최적화

### CloudFront 설정
- **캐시 정책**: `CachingOptimized`
- **압축**: 활성화
- **에러 페이지**: 404 → 200 리다이렉트 (SPA 지원)

### S3 설정
- **버킷 키**: 활성화
- **기본 암호화**: SSE-S3
- **정적 웹사이트 호스팅**: 비활성화 (CloudFront 사용)

### 빌드 최적화
- **코드 분할**: vendor chunk 분리
- **압축**: 활성화
- **소스맵**: 비활성화 (프로덕션)

---

## 🔐 보안 설정

### Cognito 설정
- **OAuth 2.0**: 활성화
- **Hosted UI**: 활성화
- **콜백 URL**: 로컬 및 프로덕션 도메인 설정

### API Gateway 설정
- **Cognito Authorizer**: 설정 완료
- **CORS**: 적절한 헤더 설정
- **HTTPS**: 강제 리다이렉트

### S3 설정
- **퍼블릭 액세스**: CloudFront를 통해서만 접근
- **버킷 정책**: CloudFront OAC만 허용

---

## 📈 모니터링 및 로깅

### CloudFront 모니터링
- **배포 상태**: `Deployed`
- **캐시 히트율**: 모니터링 가능
- **에러율**: 모니터링 가능

### S3 모니터링
- **저장 용량**: 모니터링 가능
- **요청 수**: 모니터링 가능

---

## 🎯 다음 단계

### 1. 백엔드 API 개발
- **기술 스택 선택**: Node.js, Python, Java 등
- **데이터베이스 연결**: RDS, DynamoDB 등
- **API 개발**: 실제 비즈니스 로직 구현

### 2. CI/CD 파이프라인 구축
- **GitHub Actions**: 자동 배포 설정
- **테스트 자동화**: 단위 테스트, 통합 테스트
- **배포 자동화**: 코드 변경 시 자동 배포

### 3. 모니터링 강화
- **CloudWatch**: 로그 수집 및 모니터링
- **알림 설정**: 오류 발생 시 알림
- **성능 모니터링**: 응답 시간, 에러율 등

### 4. 보안 강화
- **WAF**: CloudFront WAF 설정
- **HTTPS 강제**: 모든 요청 HTTPS 리다이렉트
- **보안 헤더**: CSP, HSTS 등 설정

---

## 📝 체크리스트

### ✅ 완료된 작업들
- [x] S3 버킷 생성 및 설정
- [x] CloudFront 배포 생성 및 설정
- [x] 배포 스크립트 개발
- [x] 환경 변수 설정
- [x] Cognito 인증 설정
- [x] API Gateway 연결
- [x] 프론트엔드 배포
- [x] 오류 해결 및 최적화

### 🔄 진행 중인 작업들
- [ ] 백엔드 API 개발
- [ ] CI/CD 파이프라인 구축
- [ ] 모니터링 시스템 구축

### 📋 향후 계획
- [ ] 데이터베이스 설계 및 구현
- [ ] 사용자 관리 기능 개발
- [ ] 파일 업로드 기능 개발
- [ ] 실시간 기능 개발
- [ ] 성능 최적화
- [ ] 보안 강화

---

**마지막 업데이트**: 2025년 8월 25일  
**작성자**: AI Assistant  
**상태**: 프론트엔드 배포 완료, 백엔드 연결 준비 완료
