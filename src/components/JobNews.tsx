// src/components/JobNews.tsx
import { useEffect, useMemo, useState } from "react";

type News = {
  title: string;
  link: string;
  source?: string;
  publishedAt?: string | null;
};

type SortBy = "popular" | "latest";

function normalizeTitle(t: string) {
  return (t || "")
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function JobsNews() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("popular"); // 기본: 인기순

  useEffect(() => {
    fetch("/api/jobs-news")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // 중복(같은 뉴스 제목) 집계해서 '인기순' 기준으로 사용
  const prepared = useMemo(() => {
    const map = new Map<
      string,
      { item: News; count: number; latestAt: number }
    >();

    for (const it of items) {
      const key = normalizeTitle(it.title);
      const at = it.publishedAt ? new Date(it.publishedAt).getTime() : 0;

      if (!map.has(key)) {
        map.set(key, {
          item: it,
          count: 1,
          latestAt: at,
        });
      } else {
        const v = map.get(key)!;
        v.count += 1;
        if (at > v.latestAt) {
          v.latestAt = at;
          v.item = it; // 최신 항목을 대표로
        }
      }
    }

    const unique = [...map.values()].map((v) => ({
      ...v.item,
      __count: v.count,
      __latestAt: v.latestAt,
    })) as (News & { __count: number; __latestAt: number })[];

    // 정렬
    if (sortBy === "latest") {
      unique.sort(
        (a, b) =>
          (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) -
          (a.publishedAt ? new Date(a.publishedAt).getTime() : 0)
      );
    } else {
      // 인기순: 중복 개수 우선 → 최신순 보조
      unique.sort((a, b) => {
        if (b.__count !== a.__count) return b.__count - a.__count;
        return b.__latestAt - a.__latestAt;
      });
    }

    return unique;
  }, [items, sortBy]);

  return (
    // 카드 전체: 세로 플렉스 (헤더 고정, 리스트 가변)
    <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">📰 취업 뉴스</h3>

        {/* 정렬 탭 */}
        <div className="flex items-center gap-3 text-xs">
          <button
            aria-pressed={sortBy === "popular"}
            onClick={() => setSortBy("popular")}
            className={`${
              sortBy === "popular"
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            인기순
          </button>
          <span className="text-gray-300">|</span>
          <button
            aria-pressed={sortBy === "latest"}
            onClick={() => setSortBy("latest")}
            className={`${
              sortBy === "latest"
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            최신순
          </button>
        </div>
      </div>

      {/* 리스트 영역: 최소 높이 + 스크롤 */}
      <div className="p-4 flex-1 overflow-y-auto min-h-[320px]">
        {loading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : prepared.length === 0 ? (
          <div className="text-sm text-gray-500">표시할 뉴스가 없어요.</div>
        ) : (
          <ul className="space-y-3">
            {prepared.map((n, i) => (
              <li key={i} className="text-sm">
                <a
                  href={n.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-900 hover:underline line-clamp-2"
                  title={n.title}
                >
                  {n.title}
                </a>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{n.source ?? "출처"}</span>
                  {n.publishedAt && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
                    </>
                  )}
                  {/* 중복 수(=다수 소스 동일 기사) 표시 */}
                  {"__count" in n && (n as any).__count > 1 && (
                    <span className="ml-1 inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      × {(n as any).__count}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
