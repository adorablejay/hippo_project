# 🚀 AWS S3 + CloudFront 배포 가이드

이 문서는 React + TypeScript + Vite 프로젝트를 AWS S3 + CloudFront로 배포하는 방법을 상세히 설명합니다.

## ✅ 실제 배포 완료 사례

### **배포된 프로젝트 정보:**
- **프로젝트명**: my-cert-community (자격증 커뮤니티)
- **S3 버킷**: `hippo1-bucket`
- **CloudFront 배포 ID**: `E3TWPOR1TVSU4O`
- **배포된 URL**: https://d23j17myaap3b.cloudfront.net
- **배포 완료일**: 2024년 8월 21일

## 📋 목차

1. [사전 준비사항](#사전-준비사항)
2. [AWS 리소스 생성](#aws-리소스-생성)
3. [프로젝트 설정](#프로젝트-설정)
4. [배포 실행](#배포-실행)
5. [문제 해결](#문제-해결)
6. [비용 최적화](#비용-최적화)

## 🛠 사전 준비사항

### 1. AWS CLI 설치 및 설정

```bash
# AWS CLI 설치
npm install -g aws-cli

# AWS 자격 증명 설정
aws configure
```

설정 시 다음 정보를 입력하세요:
- **AWS Access Key ID**: AWS IAM에서 생성한 액세스 키
- **AWS Secret Access Key**: AWS IAM에서 생성한 시크릿 키
- **Default region**: `ap-northeast-2` (서울)
- **Default output format**: `json`

### 2. 필요한 AWS 권한

다음 AWS 서비스에 대한 권한이 필요합니다:
- S3 (버킷 생성, 파일 업로드)
- CloudFront (배포 생성, 캐시 무효화)
- IAM (권한 확인)

## 🌐 AWS 리소스 생성

### 1. S3 버킷 생성

#### 1.1 AWS 콘솔에서 버킷 생성
1. AWS 콘솔 → S3 → 버킷 만들기
2. **버킷 이름**: `your-project-bucket-name` (예: `my-hippo-project`)
3. **리전**: `아시아 태평양 (서울) ap-northeast-2`
4. **퍼블릭 액세스 차단**: 해제 (정적 웹사이트 호스팅을 위해)
5. **버킷 만들기** 클릭

#### 1.2 정적 웹사이트 호스팅 활성화
1. 생성된 버킷 선택 → **속성** 탭
2. **정적 웹사이트 호스팅** → **편집**
3. **정적 웹사이트 호스팅** → **활성화**
4. **인덱스 문서**: `index.html`
5. **오류 문서**: `index.html` (SPA 라우팅 지원)
6. **변경 사항 저장**

#### 1.3 버킷 정책 설정
1. **권한** 탭 → **버킷 정책** → **편집**
2. 다음 정책 입력:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

**⚠️ 주의**: `your-bucket-name`을 실제 버킷명으로 변경하세요.

### 2. CloudFront 배포 생성

#### 2.1 배포 생성
1. AWS 콘솔 → CloudFront → **배포 생성**
2. **Origin Domain**: S3 버킷 선택
3. **Origin Path**: 비워두기
4. **Origin ID**: 자동 생성됨

#### 2.2 캐시 동작 설정
1. **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
2. **Cache Policy**: `CachingOptimized`
3. **Origin Request Policy**: `CORS-S3Origin`

#### 2.3 에러 페이지 설정 (SPA 라우팅 지원)
1. **에러 페이지** 탭 → **에러 페이지 만들기**
2. **403 에러**:
   - HTTP 오류 코드: `403`
   - 오류 캐싱 최소 TTL: `0`
   - 응답 페이지 경로: `/index.html`
   - HTTP 응답 코드: `200`
3. **404 에러**:
   - HTTP 오류 코드: `404`
   - 오류 캐싱 최소 TTL: `0`
   - 응답 페이지 경로: `/index.html`
   - HTTP 응답 코드: `200`

#### 2.4 배포 완료
1. **배포 생성** 클릭
2. 배포가 완료될 때까지 대기 (보통 5-10분)
3. **배포 ID**와 **도메인 이름** 기록

## ⚙️ 프로젝트 설정

### 1. 배포 설정 파일 수정

`deploy-config.json` 파일을 다음과 같이 수정하세요:

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

**✅ 실제 적용된 값:**
- `hippo1-bucket`: 실제 S3 버킷명
- `E3TWPOR1TVSU4O`: CloudFront 배포 ID
- `d23j17myaap3b.cloudfront.net`: CloudFront 도메인

### 2. 환경 변수 설정

#### 개발 환경 (`.env.development`)
```bash
# 개발 환경 환경변수
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
```

#### 프로덕션 환경 (`.env.production`)
```bash
# 프로덕션 환경 환경변수
VITE_API_URL=https://your-api-domain.com
VITE_APP_ENV=production
```

**📝 참고사항:**
- Firebase는 사용하지 않으므로 관련 설정 제거됨
- 환경변수는 `VITE_` 접두사 필수
- 코드에서 `import.meta.env.VITE_API_URL`로 접근 가능

## 🚀 배포 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 배포 실행

**⚠️ 주의: 배포 스크립트 수정 필요**

Node.js 버전 호환성을 위해 `deploy.js` 파일의 import 구문을 수정해야 합니다:

```javascript
// 기존 (Node.js 22에서 오류 발생)
import config from './deploy-config.json' assert { type: 'json' };

// 수정된 버전 (호환성 개선)
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./deploy-config.json', 'utf8'));
```

**배포 실행:**
```bash
# 1단계: 프로젝트 빌드
npm run build

# 2단계: S3 + CloudFront 배포
npm run deploy
```

**✅ 실제 배포 결과:**
```
🚀 배포 시작...
📁 총 4개 파일 배포 예정
✅ 업로드 완료: assets/index-AI998G_4.js
✅ 업로드 완료: assets/index-CzkLkQ-D.css
✅ 업로드 완료: assets/vendor-nf7bT_Uh.js
✅ 업로드 완료: index.html
✅ CloudFront 캐시 무효화 완료
🎉 배포 완료!
🌐 사이트 URL: https://d23j17myaap3b.cloudfront.net
```

### 3. 배포 스크립트 기능

`deploy.js` 스크립트는 다음 기능을 제공합니다:

- ✅ **자동 빌드**: `npm run build` 실행
- ✅ **파일 업로드**: S3에 모든 빌드 파일 업로드
- ✅ **캐시 컨트롤**: 파일 타입별 적절한 캐시 헤더 설정
- ✅ **Content-Type**: 파일 확장자별 올바른 MIME 타입 설정
- ✅ **캐시 무효화**: CloudFront 캐시 자동 무효화
- ✅ **진행 상황**: 실시간 업로드 진행 상황 표시

### 4. 수동 배포 (선택사항)

```bash
# S3에만 업로드
npm run deploy:s3

# CloudFront 캐시 무효화
npm run deploy:cloudfront
```

## 🔍 문제 해결

### 1. AWS 자격 증명 오류
```bash
# AWS 자격 증명 확인
aws sts get-caller-identity

# 자격 증명 재설정
aws configure
```

### 2. S3 권한 오류
- IAM 사용자에게 S3 권한이 있는지 확인
- 버킷 정책이 올바르게 설정되었는지 확인

### 3. CloudFront 캐시 무효화 오류
- 배포 ID가 올바른지 확인
- CloudFront 배포가 완료되었는지 확인

### 4. SPA 라우팅 문제
- CloudFront 에러 페이지 설정 확인
- 403/404 에러가 `/index.html`로 리다이렉트되는지 확인

### 5. CORS 오류
- API 서버에서 CloudFront 도메인을 허용하도록 설정
- Express 서버에 CORS 미들웨어 설정

## 💰 비용 최적화

### 1. CloudFront 캐시 설정
- **HTML 파일**: `no-cache` (항상 최신 버전)
- **CSS/JS 파일**: `max-age=31536000` (1년 캐시)
- **이미지/폰트**: `max-age=31536000` (1년 캐시)

### 2. S3 스토리지 최적화
- 불필요한 파일 제거
- 이미지 압축
- 코드 분할 (Code Splitting)

### 3. CloudFront 비용 절약
- 캐시 히트율 최적화
- 불필요한 캐시 무효화 최소화
- 적절한 TTL 설정

## 📊 배포 확인

### 1. 배포 상태 확인
```bash
# S3 파일 확인
aws s3 ls s3://your-bucket-name/

# CloudFront 배포 상태 확인
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

### 2. 웹사이트 접속 확인
- CloudFront 도메인으로 접속
- 모든 페이지가 정상적으로 로드되는지 확인
- SPA 라우팅이 정상 작동하는지 확인

## 🔄 자동화 (선택사항)

### GitHub Actions를 통한 자동 배포

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to AWS S3 + CloudFront

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-northeast-2
        
    - name: Deploy to S3 + CloudFront
      run: npm run deploy
```

## 📝 체크리스트

### ✅ 완료된 작업들 (2024.08.21)
- [x] AWS CLI 설치 및 설정 완료
- [x] S3 버킷 생성 (`hippo1-bucket`)
- [x] S3 정적 웹사이트 호스팅 활성화
- [x] S3 버킷 정책 설정 (공개 읽기 권한)
- [x] CloudFront 배포 생성 (`E3TWPOR1TVSU4O`)
- [x] CloudFront 에러 페이지 설정 (SPA 라우팅 지원)
- [x] `deploy-config.json` 파일 실제 값으로 설정
- [x] 환경 변수 설정 (Firebase 제거)
- [x] 의존성 설치 완료
- [x] 배포 스크립트 Node.js 호환성 수정
- [x] 프로젝트 빌드 성공
- [x] S3 + CloudFront 배포 성공

### 배포 완료 확인사항
- [x] CloudFront 도메인으로 접속 가능: https://d23j17myaap3b.cloudfront.net
- [x] 4개 파일 업로드 완료 (HTML, CSS, JS)
- [x] CloudFront 캐시 무효화 완료
- [x] 자동 배포 스크립트 정상 작동

---

**마지막 업데이트**: 2025년 8월 21일
