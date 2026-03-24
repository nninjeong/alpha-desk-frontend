'use client';

import { useEffect, useState } from 'react';
import StockSummaryCard from '../components/StockSummaryCard';
import { MOCK_SUMMARIES } from '../mocks/summaryMocks';
import { summaryApi, StockSummaryItem } from '@/infrastructure/api/summaryApi';

type Tab = 'news' | 'report';

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<StockSummaryItem[]>([]);
  const [reportSummaries, setReportSummaries] = useState<StockSummaryItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const [news, reports] = await Promise.all([
        summaryApi.getSummaries(),
        summaryApi.getReportSummaries(),
      ]);
      setSummaries(news.length > 0 ? news : MOCK_SUMMARIES);
      setReportSummaries(reports);
    } catch (e) {
      console.error('[summaries] fetch error:', e);
      setSummaries(MOCK_SUMMARIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleRunPipeline = async () => {
    setRunning(true);
    setError(null);
    try {
      await summaryApi.runPipeline();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchSummaries();
    } catch (e) {
      console.error('[pipeline] error:', e);
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const displayItems = activeTab === 'news' ? summaries : reportSummaries;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10">

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">관심종목 요약 정보</p>
        </div>
        <button
          onClick={handleRunPipeline}
          disabled={running}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 transition-colors flex items-center gap-2"
        >
          {running && (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {running ? 'AI 분석 중... (30초~1분 소요)' : '최신 분석 실행'}
        </button>
      </header>

      {running && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300">
          AI가 관심종목 뉴스·공시·재무리포트를 수집하고 분석 중입니다. 잠시만 기다려주세요...
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'news'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          뉴스 분석
          {summaries.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {summaries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'report'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          공시·재무리포트
          {reportSummaries.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              {reportSummaries.length}
            </span>
          )}
        </button>
      </div>

      <section>
        {loading ? (
          <p className="text-gray-500 py-8 text-center">불러오는 중...</p>
        ) : displayItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-base">
              {activeTab === 'report'
                ? '재무리포트 분석 결과가 없습니다.'
                : '뉴스 분석 결과가 없습니다.'}
            </p>
            <p className="text-sm mt-1">위의 &quot;최신 분석 실행&quot; 버튼을 눌러 분석을 시작하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.map((stock) => (
              <StockSummaryCard
                key={`${stock.symbol}-${stock.source_type}`}
                symbol={stock.symbol}
                name={stock.name}
                summary={stock.summary}
                tags={stock.tags}
                sentiment={stock.sentiment}
                sentiment_score={stock.sentiment_score}
                confidence={stock.confidence}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
