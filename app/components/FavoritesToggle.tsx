'use client';

interface FavoritesToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  count: number;
}

/**
 * 즐겨찾기만 보기 토글 버튼
 */
export default function FavoritesToggle({
  isEnabled,
  onToggle,
  count,
}: FavoritesToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isEnabled)}
      className={`
        flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
        transition-all whitespace-nowrap flex-shrink-0
        ${
          isEnabled
            ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
      aria-label={isEnabled ? '즐겨찾기 필터 비활성화' : '즐겨찾기 필터 활성화'}
      aria-pressed={isEnabled}
    >
      <span className="text-sm sm:text-base">{isEnabled ? '⭐' : '☆'}</span>
      <span className="hidden sm:inline">즐겨찾기만</span>
      <span className="sm:hidden">즐겨찾기</span>
      {isEnabled && count > 0 && (
        <span className="ml-1 text-xs bg-white text-yellow-600 px-1.5 sm:px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

