import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, ChevronRight } from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  deadline?: string | null; // yyyy-mm-dd
};

type Props = {
  keyword?: string;
  region?: string;
  limit?: number;
  className?: string;
  onOpenMonth?: () => void; // 월간 달력(iframe) 모달 열기
};

export default function TodayTomorrowJobsCard({
  keyword = "",
  region = "",
  limit = 12,
  className = "",
  onOpenMonth,
}: Props) {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = new URLSearchParams({
      keyword,
      region,
      limit: String(limit),
    }).toString();

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/today-tomorrow?${q}`);
        const json = await res.json();
        setItems(json.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [keyword, region, limit]);

  const groups = useMemo(() => {
    const g: Record<string, Job[]> = {};
    for (const j of items) {
      const k = j.deadline ?? "알수없음";
      (g[k] ||= []).push(j);
    }
    return Object.entries(g).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [items]);

  const fmt = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString() : "날짜 미정";

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">📅 오늘·내일 채용 공고</h3>
        {onOpenMonth && (
          <button onClick={onOpenMonth} className="text-xs text-blue-600 hover:underline">
            월간 달력
          </button>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">오늘·내일 공고가 없어요.</div>
        ) : (
          <div className="space-y-5">
            {groups.map(([date, rows]) => (
              <section key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {date === new Date().toISOString().slice(0, 10) ? "오늘" : "내일"} • {fmt(date)}
                  </span>
                </div>
                <ul className="space-y-2">
                  {rows.map((j) => (
                    <li key={j.id} className="border border-gray-200 rounded-lg hover:bg-gray-50">
                      <a href={j.url} target="_blank" rel="noreferrer" className="flex items-start justify-between p-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{j.title}</div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                            <span>{j.company}</span>
                            {j.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} /> {j.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 shrink-0 mt-1" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
