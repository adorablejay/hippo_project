import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const config = JSON.parse(readFileSync('./deploy-config.json', 'utf8'));

const s3Client = new S3Client({ region: config.s3.region });
const cloudfrontClient = new CloudFrontClient({ region: config.s3.region });

// 파일 타입별 캐시 컨트롤 헤더 설정
function getCacheControl(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  
  if (ext === 'html') return config.build.cacheControl.html;
  if (ext === 'css') return config.build.cacheControl.css;
  if (ext === 'js') return config.build.cacheControl.js;
  return config.build.cacheControl.assets;
}

// 디렉토리 재귀적으로 탐색하여 파일 목록 생성
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

// S3에 파일 업로드
async function uploadFile(filePath) {
  const fileContent = readFileSync(filePath);
  const key = relative(config.build.sourceDir, filePath).replace(/\\/g, '/');
  const contentType = getContentType(filePath);
  const cacheControl = getCacheControl(filePath);

  const command = new PutObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: cacheControl,
  });

  try {
    await s3Client.send(command);
    console.log(`✅ 업로드 완료: ${key}`);
  } catch (error) {
    console.error(`❌ 업로드 실패: ${key}`, error);
  }
}

// Content-Type 설정
function getContentType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const contentTypes = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject'
  };
  return contentTypes[ext] || 'application/octet-stream';
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

  try {
    await cloudfrontClient.send(command);
    console.log('✅ CloudFront 캐시 무효화 완료');
  } catch (error) {
    console.error('❌ CloudFront 캐시 무효화 실패:', error);
  }
}

// 메인 배포 함수
async function deploy() {
  console.log('🚀 배포 시작...');
  
  const files = getAllFiles(config.build.sourceDir);
  console.log(`📁 총 ${files.length}개 파일 배포 예정`);

  // 모든 파일 업로드
  for (const file of files) {
    await uploadFile(file);
  }

  // CloudFront 캐시 무효화
  await invalidateCache();
  
  console.log('🎉 배포 완료!');
  console.log(`🌐 사이트 URL: https://${config.cloudfront.domain}`);
}

deploy().catch(console.error);
