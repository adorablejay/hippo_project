# 🚀 AWS S3 + CloudFront 배포 가이드 (2025.08.25 재배포)

이 문서는 React + TypeScript + Vite 프로젝트를 AWS S3 + CloudFront로 배포하는 방법을 상세히 설명합니다.

## 📋 현재 상황

### **이전 배포 정보 (삭제됨):**
- **프로젝트명**: my-cert-community (자격증 커뮤니티)
- **S3 버킷**: `hippo1-bucket` (삭제됨)
- **CloudFront 배포 ID**: `E3TWPOR1TVSU4O` (삭제됨)
- **배포된 URL**: https://d23j17myaap3b.cloudfront.net (삭제됨)

### **새로운 배포 계획:**
- **새 S3 버킷**: `hippo-project-frontend-2025`
- **새 CloudFront 배포**: 새로 생성 예정
- **새 배포 URL**: 새로 생성 예정

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
# AWS CLI 설치 (이미 설치되어 있다면 생략)
npm install -g aws-cli

# AWS 자격 증명 확인
aws sts get-caller-identity

# 자격 증명이 없다면 설정
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
1. AWS 콘솔 → S3 → **버킷 만들기**
2. **버킷 이름**: `hippo-project-frontend` (전역적으로 고유해야 함)
3. **리전**: `아시아 태평양 (서울) ap-northeast-2`
4. **퍼블릭 액세스 차단**: **해제** (정적 웹사이트 호스팅을 위해)
   - ✅ 모든 퍼블릭 액세스 차단 해제
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
            "Resource": "arn:aws:s3:::hippo-project-frontend/*"
        }
    ]
}
```

### 2. CloudFront 배포 생성

#### 2.1 배포 생성
1. AWS 콘솔 → CloudFront → **배포 생성**
2. **Origin Domain**: `hippo-project-frontend.s3.ap-northeast-2.amazonaws.com` 선택
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

### 1. 배포 설정 파일 생성

`deploy-config.json` 파일을 생성하세요:

```json
{
  "s3": {
    "bucketName": "hippo-project-frontend",
    "region": "ap-northeast-2"
  },
  "cloudfront": {
    "distributionId": "YOUR_NEW_DISTRIBUTION_ID",
    "domain": "YOUR_NEW_CLOUDFRONT_DOMAIN"
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

**📝 주의**: CloudFront 배포 완료 후 실제 값으로 교체하세요.

### 2. 환경 변수 설정

#### 개발 환경 (`.env.development`)
```bash
# 개발 환경 환경변수
VITE_API_URL=https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev
VITE_APP_ENV=development
VITE_COGNITO_USER_POOL_ID=ap-northeast-2_VrMMVwNd8
VITE_COGNITO_CLIENT_ID=2b797ioh6lhc571p8k463n3fmt
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_DOMAIN=https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com
```

#### 프로덕션 환경 (`.env.production`)
```bash
# 프로덕션 환경 환경변수
VITE_API_URL=https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev
VITE_APP_ENV=production
VITE_COGNITO_USER_POOL_ID=ap-northeast-2_VrMMVwNd8
VITE_COGNITO_CLIENT_ID=2b797ioh6lhc571p8k463n3fmt
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_DOMAIN=https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com
```

### 3. 배포 스크립트 생성

`deploy.js` 파일을 생성하세요:

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// 설정 파일 읽기
const config = JSON.parse(readFileSync('./deploy-config.json', 'utf8'));

const s3Client = new S3Client({ region: config.s3.region });
const cloudfrontClient = new CloudFrontClient({ region: config.s3.region });

// MIME 타입 매핑
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// 캐시 컨트롤 헤더
const getCacheControl = (filePath) => {
  const ext = extname(filePath);
  const cacheConfig = config.build.cacheControl;
  
  if (ext === '.html') return cacheConfig.html;
  if (ext === '.css') return cacheConfig.css;
  if (ext === '.js') return cacheConfig.js;
  return cacheConfig.assets;
};

// 파일 업로드
async function uploadFile(filePath, key) {
  const fileContent = readFileSync(filePath);
  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const cacheControl = getCacheControl(filePath);

  const command = new PutObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: cacheControl
  });

  await s3Client.send(command);
  console.log(`✅ 업로드 완료: ${key}`);
}

// 디렉토리 재귀 탐색
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// CloudFront 캐시 무효화
async function invalidateCache() {
  const command = new CreateInvalidationCommand({
    DistributionId: config.cloudfront.distributionId,
    InvalidationBatch: {
      CallerReference: `invalidation-${Date.now()}`,
      Paths: {
        Quantity: 1,
        Items: ['/*']
      }
    }
  });

  await cloudfrontClient.send(command);
  console.log('✅ CloudFront 캐시 무효화 완료');
}

// 메인 배포 함수
async function deploy() {
  try {
    console.log('🚀 배포 시작...');
    
    const sourceDir = config.build.sourceDir;
    const files = getAllFiles(sourceDir);
    
    console.log(`📁 총 ${files.length}개 파일 배포 예정`);
    
    // 모든 파일 업로드
    for (const file of files) {
      const key = file.replace(sourceDir + '/', '');
      await uploadFile(file, key);
    }
    
    // CloudFront 캐시 무효화
    await invalidateCache();
    
    console.log('🎉 배포 완료!');
    console.log(`🌐 사이트 URL: https://${config.cloudfront.domain}`);
    
  } catch (error) {
    console.error('❌ 배포 실패:', error);
    process.exit(1);
  }
}

deploy();
```

### 4. package.json 스크립트 추가

`package.json`에 다음 스크립트를 추가하세요:

```json
{
  "scripts": {
    "deploy": "node deploy.js",
    "deploy:s3": "aws s3 sync dist/ s3://hippo-project-frontend-2025 --delete",
    "deploy:cloudfront": "aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'"
  }
}
```

## 🚀 배포 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 프로젝트 빌드
```bash
npm run build
```

### 3. 배포 실행
```bash
npm run deploy
```

**✅ 예상 배포 결과:**
```
🚀 배포 시작...
📁 총 4개 파일 배포 예정
✅ 업로드 완료: assets/index-XXXXXXX.js
✅ 업로드 완료: assets/index-XXXXXXX.css
✅ 업로드 완료: assets/vendor-XXXXXXX.js
✅ 업로드 완료: index.html
✅ CloudFront 캐시 무효화 완료
🎉 배포 완료!
🌐 사이트 URL: https://YOUR_NEW_CLOUDFRONT_DOMAIN
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

## 📊 배포 확인

### 1. 배포 상태 확인
```bash
# S3 파일 확인
aws s3 ls s3://hippo-project-frontend/

# CloudFront 배포 상태 확인
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

### 2. 웹사이트 접속 확인
- CloudFront 도메인으로 접속
- 모든 페이지가 정상적으로 로드되는지 확인
- SPA 라우팅이 정상 작동하는지 확인
- Cognito 로그인이 정상 작동하는지 확인

## 📝 체크리스트

### ✅ 완료해야 할 작업들
- [ ] AWS CLI 설치 및 설정
- [ ] S3 버킷 생성 (`hippo-project-frontend-2025`)
- [ ] S3 정적 웹사이트 호스팅 활성화
- [ ] S3 버킷 정책 설정 (공개 읽기 권한)
- [ ] CloudFront 배포 생성
- [ ] CloudFront 에러 페이지 설정 (SPA 라우팅 지원)
- [ ] `deploy-config.json` 파일 생성 및 설정
- [ ] `deploy.js` 스크립트 생성
- [ ] 환경 변수 설정
- [ ] 의존성 설치
- [ ] 프로젝트 빌드
- [ ] S3 + CloudFront 배포

---

**마지막 업데이트**: 2025년 8월 25일
