import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  ChevronDown,
  Search,
  Bell,
  User,
  Plus,
  Eye,
  MessageCircle,
  Calendar,
  MapPin,
  Users,
  Heart,
  ChevronLeft,
} from "lucide-react";

// Global CSS for the marquee animation
const marqueeStyle = `
  @keyframes marquee-v-posts {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
`;

// 게시판(드롭다운) 카테고리
type BoardKey = "notice" | "free" | "jobs" | "reviews" | "counsel";

// AuthStatus 컴포넌트
const AuthStatus = () => {
  const { isAuthenticated, user, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    try {
      // 간단한 테스트용 로그인 (실제로는 Cognito 호출)
      await signIn('testuser', 'password123');
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // API 테스트 함수들
  const handleTestAPI = async () => {
    const { testAPI } = await import('../api/client');
    
    // 1. 인증 없이 테스트
    await testAPI.testWithoutAuth();
    
    // 2. CORS 테스트
    await testAPI.testCORS();
    
    // 3. 인증과 함께 테스트 (로그인된 경우에만)
    if (isAuthenticated) {
      await testAPI.testWithAuth();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <User className="text-gray-600 hover:text-gray-900 cursor-pointer" size={20} />
      {isAuthenticated ? (
        <>
          <span className="text-gray-700 text-sm">{user?.username || '사용자'}</span>
          <button 
            onClick={handleLogout} 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300"
          >
            로그아웃
          </button>
          <button 
            onClick={handleTestAPI} 
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            API 테스트
          </button>
        </>
      ) : (
        <>
          <button 
            onClick={handleLogin} 
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            로그인
          </button>
          <button 
            onClick={handleTestAPI} 
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            API 테스트
          </button>
        </>
      )}
    </div>
  );
};

// TodayTomorrowJobsCard 컴포넌트
const TodayTomorrowJobsCard = ({ limit = 10, className = "" }) => {
  const [jobs, setJobs] = useState<
    {
      id: number;
      title: string;
      company: string;
      deadline: string;
      hot: boolean;
      type: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // This function simulates a real API call.
  useEffect(() => {
    const demoJobs = [
      { id: 1, title: '웹 개발자 (React)', company: '테크스타', deadline: '오늘 마감', hot: true, type: '신입' },
      { id: 2, title: '데이터 분석가', company: '데이터랩', deadline: '오늘 마감', type: '경력' },
      { id: 3, title: 'UX/UI 디자이너', company: '디자인포', deadline: '내일 마감', type: '신입' },
      { id: 4, title: 'DevOps 엔지니어', company: '클라우드원', deadline: '내일 마감', type: '경력' },
    ];
    setJobs(demoJobs);
    setLoading(false);
  }, []);

  if (loading) return <div className="text-gray-500">불러오는 중...</div>;
  if (jobs.length === 0) return <div className="text-gray-500">오늘·내일 마감 공고가 없어요.</div>;

  return (
    <div className={`space-y-4 ${className}`}>
      {jobs.slice(0, limit).map((job) => (
        <div key={job.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {job.title}
              {job.hot && <span className="text-red-500 text-xs">🔥</span>}
            </h3>
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
          <span className="text-sm font-medium text-red-500">{job.deadline}</span>
        </div>
      ))}
    </div>
  );
};


// JobKoreaCalendar 컴포넌트 재작성: 주간 달력 UI 직접 구현
const JobKoreaCalendar = () => {
  // 데모 데이터 (실제 API로 대체 가능)
  const weekData = {
    '월': [
      { company: '네이버', title: '클라우드 개발자', deadline: 'D-3' },
      { company: '카카오', title: 'AI 엔지니어', deadline: 'D-1' },
    ],
    '화': [
      { company: '라인', title: '프론트엔드', deadline: 'D-5' },
    ],
    '수': [
      { company: '삼성', title: '백엔드 개발자', deadline: 'D-7' },
    ],
    '목': [
      { company: '현대', title: '자율주행 R&D', deadline: 'D-2' },
      { company: 'SK', title: '데이터 분석가', deadline: 'D-2' },
    ],
    '금': [
      { company: 'LG', title: '머신러닝 엔지니어', deadline: 'D-4' },
    ],
    '토': [],
    '일': [],
  };

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();
  const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=일, 1=월 -> 0=월
  const startOfWeek = new Date(today.setDate(today.getDate() - currentDay));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-left table-fixed">
        <thead>
          <tr className="bg-gray-50 border-b">
            {days.map((day, index) => {
              const dayDate = new Date(startOfWeek);
              dayDate.setDate(startOfWeek.getDate() + index);
              const isToday = dayDate.toDateString() === new Date().toDateString();

              return (
                <th key={day} className={`p-2 text-center text-xs font-semibold ${isToday ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>
                  <div>{day}</div>
                  <div className={`mt-1 font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>{dayDate.getDate()}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr className="align-top">
            {days.map((day) => (
              <td key={day} className="p-2 border-r last:border-r-0">
                <ul className="space-y-1">
                  {weekData[day]?.map((job, index) => (
                    <li key={index}>
                      <button
                        className="w-full text-left p-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => window.open("https://www.jobkorea.co.kr/starter/calendar/sub/month", '_blank')}
                      >
                        <div className="font-semibold truncate">{job.company}</div>
                        <div className="text-gray-600 truncate">{job.title}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};


const BOARD_LIST: { key: BoardKey; label: string }[] = [
  { key: "notice", label: "공지사항" },
  { key: "free", label: "자유게시판" },
  { key: "jobs", label: "채용공고 게시판" },
  { key: "reviews", label: "취업 후기·면접" },
  { key: "counsel", label: "진로 상담" },
];

/* =========================
   메인 컴포넌트
   ========================= */
const CertificationCommunity = () => {
  const [activeBoard, setActiveBoard] = useState<BoardKey>("notice");
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    "home" | "board" | "portfolio" | "study" | "jobsNews" | "readPost" | "aiSearch"
  >("home");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showHotPostsRolling, setShowHotPostsRolling] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [selectedPost, setSelectedPost] = useState<{ id: number; title: string; content: string; author: string; time: string; views: number; comments: any[]; likes: number; } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);


  // 데모 데이터: 인기글
  const [posts, setPosts] = useState(() => [
    {
      id: 1,
      board: "notice",
      title: "사이트 이용 공지 및 규칙",
      author: "운영팀",
      time: "2시간 전",
      views: 342,
      comments: [{ id: 1, author: "익명1", text: "좋은 정보 감사합니다!", time: "1시간 전" }],
      likes: 45,
      isHot: true,
      content: "사이트 이용에 대한 공지사항 및 규칙을 안내해 드립니다. 모든 회원은 이 규칙을 준수해야 합니다."
    },
    {
      id: 2,
      board: "free",
      title: "SQLD 합격 수기 & 꿀팁 공유",
      author: "익명",
      time: "4시간 전",
      views: 189,
      comments: [{ id: 1, author: "익명2", text: "덕분에 합격했어요!", time: "2시간 전" }],
      likes: 32,
      isHot: false,
      content: "SQLD 자격증에 합격한 후기입니다. 공부 방법과 팁을 공유해 드려요. 궁금한 점이 있으시면 댓글 남겨주세요."
    },
    {
      id: 3,
      board: "reviews",
      title: "대기업 면접 후기 (백엔드 1차) — 과제/코테 포함",
      author: "익명",
      time: "1일 전",
      views: 567,
      comments: [{ id: 1, author: "익명3", text: "정말 상세하네요. 감사합니다.", time: "12시간 전" }],
      likes: 78,
      isHot: true,
      content: "대기업 백엔드 면접 후기입니다. 코딩 테스트와 과제 전형에 대한 상세한 내용을 포함하고 있습니다."
    },
    {
      id: 4,
      board: "jobs",
      title: "[채용] 클라우드 엔지니어 (주니어) — 서울",
      author: "HR",
      time: "2일 전",
      views: 234,
      comments: [],
      likes: 41,
      isHot: false,
      content: "클라우드 엔지니어 신입/주니어 채용 공고입니다. 많은 지원 바랍니다. "
    },
    {
      id: 5,
      board: "free",
      title: "정보처리기사 실기 합격 후기",
      author: "익명",
      time: "10분 전",
      views: 120,
      comments: [{ id: 1, author: "익명4", text: "축하드립니다!", time: "5분 전" }],
      likes: 15,
      isHot: true,
      content: "정보처리기사 실기 시험에 합격했습니다! 어떻게 공부했는지 공유하고 싶어서 글을 올립니다. "
    },
    {
      id: 6,
      board: "reviews",
      title: "IT 스타트업 면접 후기 (프론트엔드)",
      author: "익명",
      time: "5시간 전",
      views: 310,
      comments: [],
      likes: 50,
      isHot: true,
      content: "프론트엔드 개발자 포지션으로 IT 스타트업 면접을 본 후기입니다. 실무 면접 위주였고 기술 스택 질문이 많았습니다. "
    },
  ]);

  // 데모 데이터: 스터디
  const studies = useMemo(() => [
    {
      id: 1,
      title: "정보처리기사 실기 스터디 모집",
      location: "서울 강남",
      type: "오프라인",
      members: "4/8",
      date: "매주 토요일 14:00",
      tags: ["정보처리기사", "실기"],
    },
    {
      id: 2,
      title: "AWS 자격증 온라인 스터디",
      location: "온라인",
      type: "온라인",
      members: "6/10",
      date: "매주 수, 금 20:00",
      tags: ["AWS", "클라우드"],
    },
    {
      id: 3,
      title: "SQLD 자격증 취득 스터디",
      location: "온/오프라인 병행",
      type: "온/오프라인 병행",
      members: "2/5",
      date: "매주 일요일 10:00",
      tags: ["SQLD", "데이터"],
    },
  ], []);

  const handleWritePost = () => {
    const newPostItem = {
      id: posts.length + 1,
      board: activeBoard,
      title: newPost.title,
      content: newPost.content,
      author: userId || "익명", // 로그인 상태에 따라 작성자 표시
      time: "방금 전",
      views: 0,
      comments: [],
      likes: 0,
      isHot: false,
    };
    
    setPosts([newPostItem, ...posts]);
    setNewPost({ title: '', content: '' });
    setShowWriteModal(false);
  };
  
  const handlePostClick = (post) => {
    const updatedPosts = posts.map(p => 
      p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p
    );
    setPosts(updatedPosts);
    setSelectedPost(post);
    setCurrentPage("readPost");
  };

  const handleLikeClick = (postId) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
    );
    setPosts(updatedPosts);
    setSelectedPost(updatedPosts.find(p => p.id === postId) || null);
  };

  const handleCommentSubmit = (postId, commentText) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    if (commentText.trim()) {
      const updatedPosts = posts.map(p => {
        if (p.id === postId) {
          const newComment = { id: (p.comments?.length || 0) + 1, author: userId || '익명', text: commentText, time: '방금 전' };
          return { ...p, comments: [...(p.comments || []), newComment] };
        }
        return p;
      });
      setPosts(updatedPosts);
      setSelectedPost(updatedPosts.find(p => p.id === postId) || null);
    }
  };
  
  const handleLogin = () => {
    // 임시 userId 생성 (Firebase 익명 로그인 대체)
    const tempUserId = "user-" + Math.random().toString(36).substring(2, 9);
    setIsLoggedIn(true);
    setUserId(tempUserId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
  };

  // Helper function for time formatting
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "달 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    return Math.floor(seconds) + "초 전";
  };

  /* 공지 롤링 */
  const Announcements = () => {
    const items = useMemo(
      () => [
        "2024년 하반기 시험일정 안내",
        "스터디 모임 개설 가이드",
        "포트폴리오 업로드 이벤트",
      ],
      []
    );
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
        <div className="flex items-center px-4 py-2">
          <span className="text-red-500 font-bold mr-3 text-sm">공지</span>
          <div className="flex-1 overflow-hidden relative h-6">
            <style>
              {`
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                  animation: marquee 10s linear infinite;
                }
              `}
            </style>
            <div className="absolute top-0 animate-marquee whitespace-nowrap">
              {items.map((t, i) => (
                <span
                  key={i}
                  className="mr-8 text-red-700 text-sm hover:text-red-900 cursor-pointer"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 실시간 인기글 롤링 컴포넌트
  const HotPostsRolling = ({ hotPosts }) => {
    if (hotPosts.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-gray-500 text-center">인기 게시글이 없어요.</div>
        </div>
      );
    }
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-hidden relative">
        <div className="h-40 overflow-hidden relative">
          <style>{marqueeStyle}</style>
          <div className="absolute top-0 animate-marquee-v-posts">
            {[...hotPosts, ...hotPosts].map((post, idx) => (
              <div key={idx} className="block py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{idx % hotPosts.length + 1}</span>
                  <span className="text-red-500 text-xs">🔥</span>
                  <span className="text-gray-500 text-xs">{post.time}</span>
                </div>
                <h3 className="text-sm text-gray-900 hover:text-blue-600 font-medium mb-1 line-clamp-1">
                  {post.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 홈 우측: 취업 뉴스 컴팩트 위젯 (데모)
  const CompactJobsNews = ({ limit = 10 }: { limit?: number }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"latest" | "popular">("latest");

    useEffect(() => {
      // API call placeholder for job news
      const demoNews = [
        { title: '상반기 신입 채용, 핵심은 “직무 역량”', link: '#', source: '데일리뉴스', publishedAt: new Date(Date.now() - 3600000).toISOString(), views: 250, score: 50 },
        { title: 'IT 개발자 취업, 이 자격증이 필수!', link: '#', source: '잡포털', publishedAt: new Date(Date.now() - 7200000).toISOString(), views: 180, score: 40 },
        { title: '면접관이 가장 선호하는 포트폴리오 스타일', link: '#', source: '커리어매거진', publishedAt: new Date(Date.now() - 10800000).toISOString(), views: 300, score: 60 },
        { title: '인공지능 자격증, 취업 시장에서 뜨는 이유', link: '#', source: '테크뉴스', publishedAt: new Date(Date.now() - 14400000).toISOString(), views: 220, score: 45 },
      ];
      setItems(demoNews);
      setLoading(false);
    }, []);

    const sorted = useMemo(() => {
      if (tab === "latest") {
        return [...items].sort((a, b) => {
          const ta = a.publishedAt ? +new Date(a.publishedAt) : 0;
          const tb = b.publishedAt ? +new Date(b.publishedAt) : 0;
          return tb - ta;
        });
      }
      return [...items].sort((a, b) => {
        const as = a.score ?? a.views ?? 0;
        const bs = b.score ?? b.views ?? 0;
        if (bs !== as) return bs - as;
        return (a.title || "").localeCompare(b.title || "");
      });
    }, [items, tab]);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-gray-900">📰 취업 뉴스</div>
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setTab("latest")}
              className={`px-2 py-1 rounded ${
                tab === "latest" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setTab("popular")}
              className={`px-2 py-1 rounded ${
                tab === "popular" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              인기순
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : sorted.length === 0 ? (
          <div className="text-sm text-gray-500">표시할 뉴스가 없어요.</div>
        ) : (
          <ul className="space-y-3 max-h-[540px] overflow-auto pr-1">
            {sorted.slice(0, limit).map((n, i) => (
              <li key={i} className="group">
                <a
                  href={n.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-900 group-hover:text-blue-600 font-medium line-clamp-2"
                >
                  {n.title}
                </a>
                <div className="text-xs text-gray-500">
                  {n.source ?? "출처"} ·{" "}
                  {n.publishedAt ? timeAgo(new Date(n.publishedAt)) : ""}
                </div>
                <div className="mt-2 h-px bg-gray-100" />
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setCurrentPage("jobsNews")}
          className="mt-4 text-sm text-blue-600 hover:underline self-end"
        >
          전체 보기 →
        </button>
      </div>
    );
  };

  /* =========================
     페이지: 홈
     ========================= */
  const renderHome = () => {
    const hotPosts = posts.filter(p => p.isHot);

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              animation: marquee 10s linear infinite;
            }
            @keyframes marquee-v-posts {
                0% { transform: translateY(0); }
                100% { transform: translateY(-50%); }
            }
            .animate-marquee-v-posts {
                animation: marquee-v-posts 15s linear infinite;
            }
          `}
        </style>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 왼쪽: 배너 + 공지 + (인기글/스터디) + 오늘·내일 공고(길게) */}
          <div className="md:col-span-2 space-y-6">
            {/* 배너 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-6 py-5 md:px-8 md:py-6 min-h-[120px]">
              <h1 className="text-3xl font-bold mb-2">Study Smart, Get Certified Faster</h1>
              <p className="text-blue-100">AI의 힘으로 하는 자격증 준비 플랫폼</p>
            </div>

            {/* 공지 */}
            <Announcements />

            {/* 인기글 / 스터디 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 🔥 실시간 인기글 */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">🔥 실시간 인기글</h2>
                  <button onClick={() => setShowHotPostsRolling(!showHotPostsRolling)} className="text-sm text-blue-600 hover:underline">
                    {showHotPostsRolling ? "닫기" : "더보기"}
                  </button>
                </div>
                {showHotPostsRolling ? (
                    <HotPostsRolling hotPosts={posts.filter(p => p.isHot)} />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {posts.filter(p => p.isHot).length > 0 ? (
                        posts.filter(p => p.isHot).slice(0, 4).map((post, idx) => (
                          <div key={post.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-bold text-gray-900">{idx + 1}</span>
                              {post.isHot && <span className="text-red-500 text-xs">🔥</span>}
                              <span className="text-gray-500 text-xs">{post.time}</span>
                            </div>
                            <h3 
                              onClick={() => handlePostClick(post)}
                              className="text-gray-900 hover:text-blue-600 font-medium mb-2"
                            >
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {post.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                {post.comments.length}
                              </span>
                              <span>👍 {post.likes}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                        <div className="px-6 py-4 text-gray-500 text-center">인기 게시글이 없어요.</div>
                    )}
                  </div>
                )}
              </div>

              {/* 📚 스터디 모임(요약) */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">📚 스터디 모임</h2>
                  <button
                    onClick={() => setShowStudyModal(true)}
                    className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                  >
                    모집하기
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {studies.length > 0 ? (
                      studies.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{s.title}</h4>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                s.type === "온라인"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {s.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {s.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {s.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {s.members}명
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {s.tags.map((t, i) => (
                              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                  ) : (
                      <div className="text-gray-500 text-center">모집 중인 스터디가 없어요.</div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100">
                  <button onClick={() => setCurrentPage("study")} className="text-sm text-blue-600 hover:underline w-full text-center">
                    전체 보기 →
                  </button>
                </div>
              </div>
            </div>

            {/* 오늘·내일 공고 (길게) */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">🗂 오늘·내일 마감 공고</h2>
                <a href="/boards/jobs" className="text-sm text-blue-600 hover:underline">
                  더보기
                </a>
              </div>
              <div className="p-6">
                <TodayTomorrowJobsCard limit={20} className="w-full" />
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바: (달력/검색/버튼) ↑  /  취업 뉴스 ↓ */}
          <aside className="md:col-span-1 h-full flex flex-col gap-4 sticky top-20">
            {/* 취업 공고 달력 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
              <div className="font-bold text-gray-900 mb-2">🗓 취업 공고 달력</div>
              <div className="rounded overflow-hidden">
                <JobKoreaCalendar />
              </div>
              
              {/* AI 버튼 모음 */}
              <div className="grid grid-cols-1 gap-2">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  AI 자격증 검색
                </button>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  AI 포트폴리오 만들기
                </button>
              </div>
            </div>

            {/* 취업 뉴스(컴팩트) */}
            <CompactJobsNews limit={12} />
          </aside>
        </div>
      </div>
    );
  };

  /* =========================
     페이지: 게시판 (5개 보드)
     ========================= */
  const renderBoard = () => {
    const hotPosts = posts.filter(p => p.isHot);

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* 보드 사이드바 */}
          <aside className="col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg sticky top-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">📋 게시판 목록</h3>
              </div>
              <div className="p-2">
                {BOARD_LIST.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => setActiveBoard(b.key)}
                    className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors ${
                      activeBoard === b.key
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 게시글 목록 (데모) */}
          <section className="col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {BOARD_LIST.find((b) => b.key === activeBoard)?.label}
                  </h2>
                  <button onClick={() => setShowWriteModal(true)} disabled={!isLoggedIn} className={`px-4 py-2 rounded flex items-center gap-2 text-sm ${isLoggedIn ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                    <Plus size={16} />
                    글쓰기
                  </button>
                </div>
                <div className="relative max-w-md mt-4">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
              
              {/* 자유게시판(free)일 때만 인기글 롤링 표시 */}
              {activeBoard === 'free' && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">🔥 실시간 인기글</h3>
                  <HotPostsRolling hotPosts={posts.filter(p => p.isHot && p.board === 'free')} />
                </div>
              )}

              {/* 테이블 헤더 */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-1">번호</div>
                  <div className="col-span-7">제목</div>
                  <div className="col-span-2">작성자</div>
                  <div className="col-span-1">조회</div>
                  <div className="col-span-1">시간</div>
                </div>
              </div>

              {/* 게시글 리스트 (데모) */}
              <div className="divide-y divide-gray-100">
                  {posts.filter(p => p.board === activeBoard).length > 0 ? (
                      posts.filter(p => p.board === activeBoard).map((p, idx) => (
                        <div key={p.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1 text-sm text-gray-500">
                              {idx + 1}
                            </div>
                            <div className="col-span-7">
                              <div className="flex items-center gap-2">
                                {p.isHot && <span className="text-red-500 text-sm">🔥</span>}
                                <span 
                                  onClick={() => handlePostClick(p)}
                                  className="text-gray-900 hover:text-blue-600 font-medium"
                                >
                                  {p.title}
                                </span>
                                {p.comments.length > 0 && (
                                  <span className="text-blue-600 text-sm">[{p.comments.length}]</span>
                                )}
                              </div>
                            </div>
                            <div className="col-span-2 text-sm text-gray-600">{p.author}</div>
                            <div className="col-span-1 text-sm text-gray-500">{p.views}</div>
                            <div className="col-span-1 text-sm text-gray-500">{p.time}</div>
                          </div>
                        </div>
                      ))
                  ) : (
                      <div className="px-6 py-4 text-gray-500 text-center">게시글이 없어요.</div>
                  )}
              </div>

              {/* 페이지네이션 (데모) */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-700">
                    이전
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm">1</button>
                  <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-700">
                    2
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-700">
                    3
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-700">
                    다음
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };

  /* =========================
     페이지: 스터디 모임
     ========================= */
  const renderStudy = () => (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">📚 스터디 모임</h2>
          <button
            onClick={() => setShowStudyModal(true)}
            className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            모집하기
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {studies.length > 0 ? (
              studies.slice(0, 2).map((s) => (
                <div
                  key={s.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{s.title}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        s.type === "온라인"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {s.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {s.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {s.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {s.members}명
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {s.tags.map((t, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))
          ) : (
              <div className="text-gray-500 text-center col-span-2">모집 중인 스터디가 없어요.</div>
          )}
        </div>
      </div>
    </div>
  );

  /* =========================
     페이지: 취업 뉴스 (풀 페이지)
     ========================= */
  const JobsNewsPage = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"latest" | "popular">("latest");

    useEffect(() => {
      // API call placeholder for job news
      const demoNews = [
        { title: '상반기 신입 채용, 핵심은 “직무 역량”', link: '#', source: '데일리뉴스', publishedAt: new Date(Date.now() - 3600000).toISOString(), views: 250, score: 50 },
        { title: 'IT 개발자 취업, 이 자격증이 필수!', link: '#', source: '잡포털', publishedAt: new Date(Date.now() - 7200000).toISOString(), views: 180, score: 40 },
        { title: '면접관이 가장 선호하는 포트폴리오 스타일', link: '#', source: '커리어매거진', publishedAt: new Date(Date.now() - 10800000).toISOString(), views: 300, score: 60 },
        { title: '인공지능 자격증, 취업 시장에서 뜨는 이유', link: '#', source: '테크뉴스', publishedAt: new Date(Date.now() - 14400000).toISOString(), views: 220, score: 45 },
      ];
      setItems(demoNews);
      setLoading(false);
    }, []);

    const sorted = useMemo(() => {
      if (tab === "latest") {
        return [...items].sort((a, b) => {
          const ta = a.publishedAt ? +new Date(a.publishedAt) : 0;
          const tb = b.publishedAt ? +new Date(b.publishedAt) : 0;
          return tb - ta;
        });
      }
      return [...items].sort((a, b) => {
        const as = a.score ?? a.views ?? 0;
        const bs = b.score ?? b.views ?? 0;
        if (bs !== as) return bs - as;
        return (a.title || "").localeCompare(b.title || "");
      });
    }, [items, tab]);

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">📰 취업 뉴스</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab("latest")}
                className={`px-3 py-1 text-sm rounded ${
                  tab === "latest" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setTab("popular")}
                className={`px-3 py-1 text-sm rounded ${
                  tab === "popular" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                인기순
              </button>
              <span className="text-sm text-gray-500">{items.length}건</span>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-sm text-gray-500">불러오는 중…</div>
            ) : sorted.length === 0 ? (
              <div className="text-sm text-gray-500">표시할 뉴스가 없어요.</div>
            ) : (
              <ul className="space-y-4">
                {sorted.map((n, i) => (
                  <li key={i} className="group">
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base text-gray-900 group-hover:text-blue-600 font-medium"
                    >
                      {n.title}
                    </a>
                    <div className="text-xs text-gray-500">
                      {n.source ?? "출처"} ·{" "}
                      {n.publishedAt ? timeAgo(new Date(n.publishedAt)) : ""}
                    </div>
                    <div className="mt-2 h-px bg-gray-100" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* 스터디 모달 */
  const StudyModal = () => {
    const [title, setTitle] = useState('');
    const [studyType, setStudyType] = useState('');
    const [location, setLocation] = useState('');
    const [members, setMembers] = useState(2);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');

    const handleCreateStudy = async () => {
      // This is a placeholder since Firebase is not used
      console.log("스터디 모임 생성 (데모):", { title, studyType, location, members, description, tags });
      setShowStudyModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">스터디 모임 만들기</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="스터디 제목 *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={studyType}
              onChange={(e) => setStudyType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">진행 방식 *</option>
              <option value="온라인">온라인</option>
              <option value="오프라인">오프라인</option>
              <option value="온/오프라인 병행">온/오프라인 병행</option>
            </select>
            {studyType !== '온라인' && (
              <input
                type="text"
                placeholder="지역 (오프라인 시)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <input
              type="number"
              min={2}
              max={20}
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              placeholder="모집 인원 *"
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              rows={4}
              placeholder="스터디 설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="text"
                placeholder="태그 (쉼표로 구분, 예: #정보처리기사, #실기)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowStudyModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleCreateStudy}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              만들기
            </button>
          </div>
        </div>
      </div>
    );
  };

  const WritePostModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handlePostSubmit = () => {
      const newPostItem = {
        id: posts.length + 1,
        board: activeBoard,
        title: title,
        content: content,
        author: userId || "익명",
        time: "방금 전",
        views: 0,
        comments: [],
        likes: 0,
        isHot: false,
      };

      setPosts([newPostItem, ...posts]);
      
      setShowWriteModal(false);
      
      setTitle('');
      setContent('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">글쓰기</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              rows={10}
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowWriteModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handlePostSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const ReadPostPage = ({ post }) => {
    const [comment, setComment] = useState('');

    const handleLikeClick = () => {
      if (!isLoggedIn) {
        alert("로그인 후 이용해 주세요.");
        return;
      }
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes: (p.likes || 0) + 1 } : p));
      if(selectedPost) {
        setSelectedPost({ ...selectedPost, likes: (selectedPost.likes || 0) + 1 });
      }
    };

    const handleCommentSubmit = () => {
      if (!isLoggedIn) {
        alert("로그인 후 이용해 주세요.");
        return;
      }
      if (comment.trim()) {
        const newComment = { id: (post.comments?.length || 0) + 1, author: userId || '익명', text: comment, time: '방금 전' };
        setPosts(posts.map(p => {
          if (p.id === post.id) {
            return { ...p, comments: [...(p.comments || []), newComment] };
          }
          return p;
        }));
        if(selectedPost) {
          setSelectedPost({ ...selectedPost, comments: [...(selectedPost.comments || []), newComment] });
        }
        setComment('');
      }
    };
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* 보드 사이드바 */}
          <aside className="col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg sticky top-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">📋 게시판 목록</h3>
              </div>
              <div className="p-2">
                {BOARD_LIST.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => {
                        setActiveBoard(b.key);
                        setCurrentPage("board");
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors ${
                      activeBoard === b.key
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          
          {/* 글 내용 + 댓글 */}
          <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-6">
            <button
              onClick={() => setCurrentPage('board')}
              className="mb-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <ChevronLeft size={16} /> 목록으로
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="flex items-center text-sm text-gray-500 border-b pb-4 mb-4">
                <span className="flex items-center mr-4">
                  <User size={14} className="mr-1" /> {post.author}
                </span>
                <span className="flex items-center mr-4">
                  <Eye size={14} className="mr-1" /> {post.views}
                </span>
                <span className="flex items-center">
                  <MessageCircle size={14} className="mr-1" /> {post.comments.length}
                </span>
              </div>
              
              <div className="prose max-w-none text-gray-700 leading-relaxed mb-6">
                <p>{post.content}</p>
              </div>
              
              <div className="flex items-center gap-4 border-t pt-4">
                <button 
                  onClick={() => handleLikeClick(post.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                >
                  <Heart size={20} /> {post.likes} 공감
                </button>
              </div>
              
              <div className="mt-8">
                <h4 className="text-xl font-bold mb-4">댓글 ({post.comments.length})</h4>
                <div className="space-y-4">
                  {post.comments.length > 0 ? (
                    post.comments.map((c) => (
                      <div key={c.id} className="border-b pb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <span>{c.author}</span>
                          <span className="text-gray-500 text-xs">· {c.time}</span>
                        </div>
                        <p className="mt-1 text-gray-700">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">아직 댓글이 없어요.</div>
                  )}
                </div>

                <div className="mt-6 flex items-start gap-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isLoggedIn ? "댓글을 남겨보세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                    rows={2}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isLoggedIn}
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id, comment)}
                    className={`px-4 py-2 rounded text-sm self-stretch ${isLoggedIn ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    disabled={!isLoggedIn}
                  >
                    등록
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  /* 헤더 + 라우팅 */
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {/* 로고 = 홈 */}
              <button
                onClick={() => setCurrentPage("home")}
                className="flex items-center gap-2 cursor-pointer"
                title="홈"
              >
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📚</span>
                </div>
                <span className="text-xl font-bold text-gray-900">CertifyMe</span>
              </button>

              <nav className="flex items-center">
                {/* 게시판 드롭다운 */}
                <div className="relative">
                  <button
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                      currentPage === "board" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
                    }`}
                    onClick={() => setShowCategoryDropdown((v) => !v)}
                  >
                    게시판
                    <ChevronDown size={14} />
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56 z-50">
                      {BOARD_LIST.map((b) => (
                        <button
                          key={b.key}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            setActiveBoard(b.key);
                            setCurrentPage("board");
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 스터디 모임 */}
                <button
                  onClick={() => setCurrentPage("study")}
                  className={`px-4 py-2 text-sm font-medium ${
                    currentPage === "study" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  스터디 모임
                </button>

                {/* 취업 뉴스 */}
                <button
                  onClick={() => setCurrentPage("jobsNews")}
                  className={`px-4 py-2 text-sm font-medium ${
                    currentPage === "jobsNews" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  취업 뉴스
                </button>
                
                {/* AI 자격증 검색 */}
                <button
                  onClick={() => setCurrentPage("aiSearch")}
                  className={`px-4 py-2 text-sm font-medium ${
                    currentPage === "aiSearch" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  포트폴리오
                </button>

                {/* 포트폴리오 */}
                <button
                  onClick={() => setCurrentPage("portfolio")}
                  className={`px-4 py-2 text-sm font-medium ${
                    currentPage === "portfolio" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  AI 자격증 검색
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="통합검색"
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <Bell className="text-gray-600 hover:text-gray-900 cursor-pointer" size={20} />
              <AuthStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main>
        {currentPage === "home" && renderHome()}
        {currentPage === "board" && renderBoard()}
        {currentPage === "study" && renderStudy()}
        {currentPage === "jobsNews" && <JobsNewsPage />}
        {currentPage === "aiSearch" && (
          <div className="max-w-7xl mx-auto px-4 py-10 text-gray-500">(AI 자격증 검색 페이지 — 구성 예정)</div>
        )}
        {currentPage === "portfolio" && (
          <div className="max-w-7xl mx-auto px-4 py-10 text-gray-500">(포트폴리오 페이지 — 구성 예정)</div>
        )}
        {currentPage === "readPost" && selectedPost && <ReadPostPage post={selectedPost} />}
      </main>

      {/* Study Modal */}
      {showStudyModal && <StudyModal />}
      {showWriteModal && <WritePostModal />}
    </div>
  );
};

export default CertificationCommunity;
