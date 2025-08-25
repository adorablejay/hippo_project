# 2025-08-25 AWS 리소스 재생성 가이드

## 📋 개요
이 문서는 삭제된 AWS 리소스들을 처음부터 다시 생성하는 상세한 가이드입니다.
**추천 순서**: Cognito → API Gateway → 환경변수 → 테스트 → 프론트엔드 배포

---

## 🎯 1단계: AWS Cognito User Pool 생성

### 1.1 AWS 콘솔에서 Cognito 접속
1. AWS 콘솔 로그인
2. 검색창에 "Cognito" 입력
3. **Amazon Cognito** 선택

### 1.2 User Pool 생성
1. **User Pools** → **Create user pool** 클릭
2. **Step 1: Configure sign-in experience**
   - ✅ **Cognito user pool sign-in options**: `Email` 선택
   - ✅ **User name requirements**: `Allow email addresses` 선택
   - **Next** 클릭

3. **Step 2: Configure security requirements**
   - ✅ **Password policy**: 기본값 유지
   - ✅ **Multi-factor authentication**: `No MFA` 선택 (테스트용)
   - **Next** 클릭

4. **Step 3: Configure sign-up experience**
   - ✅ **Self-service account recovery**: `Enabled` 선택
   - **Next** 클릭

5. **Step 4: Configure message delivery**
   - ✅ **Email provider**: `Send email with Cognito` 선택
   - ✅ **From email address**: `no-reply@verificationemail.com` 입력
   - **Next** 클릭

6. **Step 5: Integrate your app**
   - ✅ **User pool name**: `hippo-project-user-pool` 입력
   - **Next** 클릭

7. **Step 6: Review and create**
   - 설정 확인 후 **Create user pool** 클릭

### 1.3 App Client 생성
1. 생성된 User Pool 선택 → **App clients** 탭
2. **App clients and analytics** → **Create app client**
3. **App client name**: `hippo-project-client` 입력
4. ✅ **Confidential client**: `No` 선택
5. **OAuth 2.0 settings**:
   - ✅ **Authorization code grant**: 체크
   - ✅ **Implicit grant**: 체크
   - ✅ **Callback URLs**: `http://localhost:5173,http://localhost:5174` 입력
   - ✅ **Logout URLs**: `http://localhost:5173,http://localhost:5174` 입력
6. **Create app client** 클릭

### 1.4 Cognito Domain 생성
1. **브랜딩** 탭에서 **도메인** 클릭 
2. **Domain prefix**: `hippo-project-auth` 입력
3. **Save** 클릭

### 1.5 Cognito 정보 수집
생성 완료 후 다음 정보들을 메모해두세요:
- **User Pool ID**: `ap-northeast-2_xxxxxxxxx`
- **App Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Domain Prefix**: `hippo-project-auth`

---

## 🔧 2단계: AWS API Gateway 생성

### 2.1 API 생성
1. AWS 콘솔 → **API Gateway** → **Create API**
2. **REST API** → **Build** 클릭
3. **API name**: `hippo-project-api` 입력
4. **Endpoint Type**: `Regional` 선택
5. **Create API** 클릭

### 2.2 리소스 생성
1. **Actions** → **Create Resource**
   - **Resource Name**: `api` 입력
   - **Create Resource** 클릭

2. **Actions** → **Create Resource**
   - **Resource Name**: `jobs` 입력
   - **Create Resource** 클릭

### 2.3 GET 메서드 생성
1. **Actions** → **Create Method**
   - **HTTP Method**: `GET` 선택
   - **Integration type**: `Mock` 선택
   - **Create Method** 클릭

### 2.4 Mock 응답 설정
1. **GET** 메서드 선택 → **Integration Request** 클릭
2. **Mapping Templates** → **Add mapping template**:
   - **Content-Type**: `application/json`
   - **Template**:
       ```json
       {
         "statusCode": 200,
         "headers": {
           "Content-Type": "application/json",
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Methods": "GET,OPTIONS",
           "Access-Control-Allow-Headers": "Content-Type,Authorization"
         },
         "body": "{\"message\":\"Hello from API Gateway!\",\"jobs\":[{\"id\":1,\"title\":\"Frontend Developer\"},{\"id\":2,\"title\":\"Backend Developer\"}]}"
       }
       ```

### 2.5 OPTIONS 메서드 생성 (CORS)
1. **Actions** → **Create Method**
   - **HTTP Method**: `OPTIONS` 선택
   - **Integration type**: `Mock` 선택
   - **Create Method** 클릭

2. **OPTIONS** 메서드 선택 → **Integration Request** 클릭
3. **Mapping Templates** → **Add mapping template**:
   - **Content-Type**: `application/json`
   - **Template**:
       ```json
       {
         "statusCode": 200,
         "headers": {
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Methods": "GET,OPTIONS",
           "Access-Control-Allow-Headers": "Content-Type,Authorization",
           "Access-Control-Max-Age": "3600"
         }
       }
       ```

### 2.6 Cognito Authorizer 생성
1. **Authorizers** → **Create New Authorizer**
2. **Name**: `cognito-authorizer`
3. **Type**: `Cognito`
4. **User Pool**: 생성한 User Pool 선택
5. **Token Source**: `Authorization` (기본값)
6. **Create** 클릭

### 2.7 GET 메서드에 Authorizer 적용
1. **GET** 메서드 선택 → **Method Request** 클릭
2. **Authorization**: `cognito-authorizer` 선택
3. **✓** 체크 표시 클릭

### 2.8 API 배포
1. **Actions** → **Deploy API**
2. **Deployment stage**: `New Stage` 선택
3. **Stage name**: `dev` 입력
4. **Deploy** 클릭

### 2.9 API 정보 수집
배포 완료 후 다음 정보들을 메모해두세요:
- **API ID**: `xxxxxxxxxx`
- **Invoke URL**: `https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev`

---

## ⚙️ 3단계: 환경변수 설정

### 3.1 .env.development 파일 생성
프로젝트 루트에 `.env.development` 파일을 생성하고 다음 내용을 입력하세요:

```bash
VITE_API_URL=https://[API_ID].execute-api.ap-northeast-2.amazonaws.com/dev
VITE_APP_ENV=development
VITE_COGNITO_USER_POOL_ID=[USER_POOL_ID]
VITE_COGNITO_CLIENT_ID=[APP_CLIENT_ID]
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_DOMAIN=https://[DOMAIN_PREFIX].auth.ap-northeast-2.amazoncognito.com
```

**실제 값 예시**:
```bash
VITE_API_URL=https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev
VITE_APP_ENV=development
VITE_COGNITO_USER_POOL_ID=ap-northeast-2_VrMMVwNd8
VITE_COGNITO_CLIENT_ID=2b797ioh6lhc571p8k463n3fmt
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_DOMAIN=https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com
```

---

## 🧪 4단계: 테스트 및 문제 해결

### 4.1 개발 서버 실행
```bash
npm run dev
```

### 4.2 로그인 테스트
1. 브라우저에서 `http://localhost:5173` 접속
2. **로그인** 버튼 클릭
3. Cognito Hosted UI에서 로그인/회원가입
4. 로그인 성공 후 리다이렉트 확인

### 4.3 API 호출 테스트
1. **API 테스트** 버튼 클릭
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. API 응답 확인

---

## 🚀 5단계: 프론트엔드 S3+CloudFront 배포

### 5.1 AWS CLI 확인
```bash
# AWS CLI 설치 (이미 설치되어 있다면 생략)
npm install -g aws-cli

# AWS 자격 증명 확인
aws sts get-caller-identity

# 자격 증명이 없다면 설정
aws configure
```

### 5.2 S3 버킷 생성
1. AWS 콘솔 → S3 → **버킷 만들기**

#### 5.2.1 기본 설정
2. **버킷 이름**: `hippo-project-frontend` (전역적으로 고유해야 함)
3. **리전**: `아시아 태평양 (서울) ap-northeast-2`

#### 5.2.2 퍼블릭 액세스 설정
4. **퍼블릭 액세스 차단**: **해제** (정적 웹사이트 호스팅을 위해)
   - ✅ 모든 퍼블릭 액세스 차단 해제
   - ✅ 새 퍼블릭 액세스 차단 설정 해제
   - ✅ 퍼블릭 액세스 차단 해제 확인

#### 5.2.3 버킷 소유권 설정
5. **버킷 소유권**: `ACL 비활성화됨` 선택
   - ✅ **ACL 비활성화됨**: `ACL 비활성화됨` 선택
   - ✅ **버킷 소유자 권한**: `버킷 소유자가 소유권을 가짐` 선택

#### 5.2.4 버킷 버전 관리
6. **버킷 버전 관리**: `비활성화` 선택
   - ✅ **버킷 버전 관리**: `비활성화` 선택
   - **용도**: 테스트용이므로 불필요, 비용 절약

#### 5.2.5 기본 암호화
7. **기본 암호화**: `활성화` 선택
   - ✅ **기본 암호화**: `활성화` 선택
   - ✅ **암호화 유형**: `Amazon S3 관리형 키(SSE-S3)` 선택
   - **용도**: 저장된 데이터의 보안 강화

#### 5.2.6 버킷 키
8. **버킷 키**: `활성화` 선택
   - ✅ **버킷 키**: `활성화` 선택
   - **용도**: 암호화 성능 향상 및 비용 절약

#### 5.2.7 고급 설정
9. **Object Lock**: `비활성화` (기본값)
   - **용도**: 정적 웹사이트 호스팅에는 불필요

10. **버킷 만들기** 클릭

### 5.2.8 S3 버킷 설정 상세 설명

#### ACL (Access Control List)
- **ACL 비활성화됨**: 버킷 정책으로만 권한 제어
- **용도**: 버킷 정책을 통한 간단한 권한 관리
- **정적 웹사이트 호스팅**: 버킷 정책으로 공개 읽기 권한 설정

#### 버킷 버전 관리
- **비활성화 시**: 파일 덮어쓰기 시 이전 버전 삭제
- **장점**: 
  - 스토리지 비용 절약
  - 간단한 파일 관리
- **단점**: 실수로 삭제된 파일 복구 불가
- **테스트용**: 충분히 적합한 설정

#### 기본 암호화 (SSE-S3)
- **Amazon S3 관리형 키**: AWS가 암호화 키 관리
- **장점**: 
  - 추가 비용 없음
  - 자동 암호화/복호화
  - AWS 보안 표준 준수
- **보안**: 저장된 모든 데이터가 암호화됨

#### 버킷 키
- **활성화 시**: 버킷 수준에서 암호화 키 관리
- **장점**: 
  - 암호화 성능 향상
  - API 호출 비용 절약
  - 키 관리 오버헤드 감소
- **권장**: 대부분의 경우 활성화 권장

#### Object Lock
- **비활성화**: 정적 웹사이트 호스팅에는 불필요
- **용도**: 규정 준수나 데이터 보존 정책이 필요한 경우
- **비용**: 추가 비용 발생 가능

### 5.3 S3 정적 웹사이트 호스팅 활성화
1. 생성된 버킷 선택 → **속성** 탭
2. **정적 웹사이트 호스팅** → **편집**
3. **정적 웹사이트 호스팅** → **활성화**
4. **인덱스 문서**: `index.html`
5. **오류 문서**: `index.html` (SPA 라우팅 지원)
6. **변경 사항 저장**

### 5.4 S3 버킷 정책 설정
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

**⚠️ ACL 비활성화 시 주의사항:**
- ACL이 비활성화된 경우 버킷 정책만으로 권한 제어
- 버킷 이름이 정확히 일치하는지 확인
- 정책 저장 후 **권한 거부** 오류가 발생할 수 있음

**🔧 문제 해결:**
만약 "Policy has invalid resource" 오류가 발생하면:
1. 버킷 이름이 정확한지 확인
2. 리전이 올바른지 확인
3. 버킷이 실제로 생성되었는지 확인

### 5.5 CloudFront 배포 생성
1. AWS 콘솔 → CloudFront → **배포 생성**
2. **Origin Domain**: `hippo-project-frontend.s3.ap-northeast-2.amazonaws.com` 선택
3. **Origin Path**: 비워두기
4. **Origin ID**: 자동 생성됨

### 5.6 CloudFront 캐시 동작 설정
1. **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
2. **Cache Policy**: `CachingOptimized`
3. **Origin Request Policy**: `CORS-S3Origin`

### 5.7 CloudFront 에러 페이지 설정 (SPA 라우팅 지원)
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

### 5.8 CloudFront 배포 완료
1. **배포 생성** 클릭
2. 배포가 완료될 때까지 대기 (보통 5-10분)
3. **배포 ID**와 **도메인 이름** 기록

### 5.9 배포 설정 파일 생성
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

### 5.10 배포 스크립트 생성
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

### 5.11 package.json 스크립트 추가
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

### 5.12 프로덕션 환경변수 설정
`.env.production` 파일을 생성하세요:

```bash
# 프로덕션 환경 환경변수
VITE_API_URL=https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev
VITE_APP_ENV=production
VITE_COGNITO_USER_POOL_ID=ap-northeast-2_VrMMVwNd8
VITE_COGNITO_CLIENT_ID=2b797ioh6lhc571p8k463n3fmt
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_DOMAIN=https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com
```

### 5.13 배포 실행
```bash
# 1단계: 프로젝트 빌드
npm run build

# 2단계: S3 + CloudFront 배포
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

---

## 📊 생성된 리소스 정보

### Cognito 리소스
- **User Pool ID**: `ap-northeast-2_VrMMVwNd8`
- **App Client ID**: `2b797ioh6lhc571p8k463n3fmt`
- **Domain Prefix**: `hippo-project-auth`
- **Domain URL**: `https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com`

### API Gateway 리소스
- **API ID**: `w9dfgfhcm6`
- **API Name**: `hippo-project-api`
- **Stage**: `dev`
- **Invoke URL**: `https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev`
- **Resource Path**: `/api/jobs`
- **Methods**: `GET`, `OPTIONS`

### S3 + CloudFront 리소스
- **S3 Bucket**: `hippo-project-frontend-2025`
- **CloudFront Distribution ID**: `YOUR_NEW_DISTRIBUTION_ID`
- **CloudFront Domain**: `YOUR_NEW_CLOUDFRONT_DOMAIN`
- **배포 URL**: `https://YOUR_NEW_CLOUDFRONT_DOMAIN`

### 환경변수
- **VITE_API_URL**: `https://w9dfgfhcm6.execute-api.ap-northeast-2.amazonaws.com/dev`
- **VITE_COGNITO_USER_POOL_ID**: `ap-northeast-2_VrMMVwNd8`
- **VITE_COGNITO_CLIENT_ID**: `2b797ioh6lhc571p8k463n3fmt`
- **VITE_COGNITO_DOMAIN**: `https://hippo-project-auth.auth.ap-northeast-2.amazoncognito.com`

---

## 🎉 완료 후 확인사항

1. **모든 AWS 리소스가 정상적으로 생성되었는지 확인**
2. **환경변수가 올바르게 설정되었는지 확인**
3. **개발 서버가 정상적으로 실행되는지 확인**
4. **로그인/회원가입이 정상적으로 작동하는지 확인**
5. **API 호출이 인증과 함께 정상적으로 작동하는지 확인**
6. **프론트엔드 배포가 정상적으로 완료되었는지 확인**
7. **배포된 사이트에서 모든 기능이 정상 작동하는지 확인**

**모든 단계가 완료되면 자격증 커뮤니티 프로젝트의 전체 시스템이 완전히 복구됩니다!** 🚀

---

## ⭐ 핵심 해결사항: 401 Unauthorized 에러 해결

### 🔍 문제 상황
- **증상**: Cognito 로그인은 성공했지만 API 호출 시 401 Unauthorized 에러 발생
- **로그**: 토큰이 정상적으로 저장되고 전송되는데도 401 에러

### 🎯 원인 분석
**잘못된 토큰 사용**:
```typescript
// ❌ 잘못된 코드 (이전)
localStorage.setItem('authToken', tokenData.access_token);
```

**문제점**:
- Cognito에서 발급하는 토큰은 3가지: `id_token`, `access_token`, `refresh_token`
- API Gateway Cognito Authorizer는 **`id_token`만 인식**
- `access_token`을 전송하면 Cognito Authorizer가 인식하지 못해 401 에러

### ✅ 해결 방법
**올바른 토큰 사용**:
```typescript
// ✅ 올바른 코드 (수정 후)
localStorage.setItem('authToken', tokenData.id_token);
```

### 📊 토큰 종류별 사용법
| 토큰 종류 | 용도 | 사용 예시 |
|-----------|------|-----------|
| **id_token** | API Gateway Cognito Authorizer 인증 | `Authorization: Bearer ${id_token}` |
| **access_token** | 사용자 정보 조회, 다른 API 호출 | `/oauth2/userInfo` 엔드포인트 |
| **refresh_token** | 토큰 갱신 | 토큰 만료 시 새로운 토큰 발급 |

### 🚀 결과
- **이전**: 401 Unauthorized 에러
- **수정 후**: 200 OK 정상 응답
- **인증 플로우**: 완전히 정상 작동

### 💡 교훈
**AWS Cognito + API Gateway 인증에서는 반드시 `id_token`을 사용해야 합니다!**

---

## 📝 참고사항

- 이 가이드는 2025년 8월 25일 기준으로 작성되었습니다
- AWS 콘솔 UI가 변경될 수 있으니 최신 UI에 맞게 조정하세요
- 문제 발생 시 AWS 공식 문서를 참고하세요
- 모든 리소스 정보는 안전하게 보관하고 공유하지 마세요
- 프론트엔드 배포 후 CloudFront 캐시 무효화가 필요할 수 있습니다
- SPA 라우팅을 위해 CloudFront 에러 페이지 설정이 중요합니다
