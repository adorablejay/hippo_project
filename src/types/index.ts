// types/index.ts

// 전역 환경변수 타입 선언
declare global {
  const __API_URL__: string;
  const __APP_ENV__: string;
  const __COGNITO_USER_POOL_ID__: string;
  const __COGNITO_CLIENT_ID__: string;
  const __COGNITO_DOMAIN__: string;
}

// 환경변수 타입 정의 (기존 방식)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly VITE_COGNITO_REGION: string;
  readonly VITE_COGNITO_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export type BoardKey = "notice" | "free" | "jobs" | "reviews" | "counsel";

export const BOARD_LIST: { key: BoardKey; label: string }[] = [
  { key: "notice", label: "공지사항" },
  { key: "free", label: "자유게시판" },
  { key: "jobs", label: "채용공고 게시판" },
  { key: "reviews", label: "취업 후기·면접" },
  { key: "counsel", label: "진로 상담" },
];

export interface Post {
  id: number;
  board: BoardKey;
  title: string;
  content: string;
  author: string;
  time: string;
  views: number;
  comments: Comment[];
  likes: number;
  isHot: boolean;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

export interface Study {
  id: number;
  title: string;
  location: string;
  type: string;
  members: string;
  date: string;
  tags: string[];
}