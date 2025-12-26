'use client';

import { memo } from 'react';

interface AvailableToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  count: number;
}

function AvailableToggle({
  isEnabled,
  onToggle,
  count,
}: AvailableToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isEnabled)}
      className={`
        flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
        transition-all whitespace-nowrap flex-shrink-0
        ${
          isEnabled
            ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
      aria-label={isEnabled ? '현재 주차 가능 필터 비활성화' : '현재 주차 가능 필터 활성화'}
      aria-pressed={isEnabled}
    >
      <span className="text-sm sm:text-base">{isEnabled ? '✅' : '⚪'}</span>
      <span className="hidden sm:inline">현재 주차 가능</span>
      <span className="sm:hidden">주차 가능</span>
      {isEnabled && count > 0 && (
        <span className="ml-1 text-xs bg-white text-green-600 px-1.5 sm:px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

// React.memo로 메모이제이션
export default memo(AvailableToggle);

