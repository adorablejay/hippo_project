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
    
    // 모든 파일 업로드 (dist/ 경로 제거하여 루트에 맞춰 업로드)
    for (const file of files) {
      // dist/ 경로를 제거하고 상대 경로로 변환 (Windows 경로 구분자 처리)
      const key = file.replace(sourceDir + '/', '').replace(/\\/g, '/').replace(/^dist\//, '');
      console.log(`📤 업로드 중: ${key}`);
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
