# 자격증 커뮤니티 프로젝트

React + TypeScript + Vite로 구축된 자격증 커뮤니티 웹 애플리케이션입니다.

## 🚀 배포 가이드 (AWS S3 + CloudFront)

### 1. 사전 준비사항

1. **AWS CLI 설치 및 설정**
   ```bash
   # AWS CLI 설치
   npm install -g aws-cli
   
   # AWS 자격 증명 설정
   aws configure
   ```

2. **S3 버킷 생성**
   - AWS 콘솔에서 S3 버킷 생성
   - 정적 웹사이트 호스팅 활성화
   - 버킷 정책 설정 (공개 읽기 권한)

3. **CloudFront 배포 생성**
   - S3 버킷을 Origin으로 설정
   - 캐시 동작 설정
   - 에러 페이지 설정 (SPA 라우팅 지원)

### 2. 설정 파일 수정

`deploy-config.json` 파일에서 다음 정보를 수정하세요:

```json
{
  "s3": {
    "bucketName": "your-bucket-name",
    "region": "ap-northeast-2"
  },
  "cloudfront": {
    "distributionId": "your-distribution-id",
    "domain": "your-cloudfront-domain.cloudfront.net"
  }
}
```

### 3. 배포 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# S3 + CloudFront 배포
npm run deploy
```

### 4. S3 버킷 정책 예시

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

### 5. CloudFront 에러 페이지 설정

- **403 에러**: `/index.html`로 리다이렉트
- **404 에러**: `/index.html`로 리다이렉트

### 6. 환경 변수 설정

프로덕션 환경에서 필요한 환경 변수들을 설정하세요:

```bash
# .env.production 파일 생성
VITE_API_URL=https://your-api-domain.com
VITE_FIREBASE_CONFIG=your-firebase-config
```

## 📁 프로젝트 구조

```
hippo_project/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── styles/        # CSS 스타일
│   └── types/         # TypeScript 타입 정의
├── server/            # Express 서버
├── dist/              # 빌드 결과물
├── deploy-config.json # 배포 설정
├── deploy.js          # 배포 스크립트
└── package.json
```

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js
- **Deployment**: AWS S3 + CloudFront
- **Package Manager**: npm

## 📝 주의사항

1. **CORS 설정**: API 서버에서 CloudFront 도메인을 허용하도록 설정
2. **캐시 무효화**: 배포 후 CloudFront 캐시가 자동으로 무효화됩니다
3. **비용 최적화**: CloudFront 캐시 설정을 통해 전송 비용을 최적화할 수 있습니다
