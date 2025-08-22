import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('=== Vite Config 환경변수 디버깅 ===');
  console.log('Mode:', mode);
  console.log('Loaded env:', env);
  console.log('VITE_API_URL:', env.VITE_API_URL);
  console.log('VITE_APP_ENV:', env.VITE_APP_ENV);
  console.log('=====================================');
  
  return {
    plugins: [react()],
    base: '/',
    
    // 개발 서버 설정
    server: {
      port: 5173,
      host: true,
    },
    
    // 빌드 설정
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
  }
})