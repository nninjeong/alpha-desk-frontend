interface StockSummaryCardProps {
  symbol: string;
  name: string;
  summary: string;
  tags: string[];
}

export default function StockSummaryCard({ symbol, name, summary, tags }: StockSummaryCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col gap-3 bg-background">

      {/* 종목명 영역 */}
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-foreground">{symbol}</span>
        <span className="text-sm text-gray-500">{name}</span>
      </div>

      {/* 요약 텍스트 영역 */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{summary}</p>

      {/* 태그 영역 */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950 dark:text-blue-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
