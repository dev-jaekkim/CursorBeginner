'use client';

import { memo } from 'react';

import type { SortOption } from '@/app/lib/types';

interface SortOptionsProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'distance', label: '거리순', icon: '📍' },
  { value: 'fee', label: '요금순', icon: '💰' },
  { value: 'available', label: '주차 가능 자리순', icon: '🚗' },
  { value: 'name', label: '이름순', icon: '🔤' },
];

function SortOptions({
  sortOption,
  onSortChange,
}: SortOptionsProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={`
            flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
            whitespace-nowrap transition-all flex-shrink-0
            ${
              sortOption === option.value
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          aria-label={`${option.label}로 정렬`}
          aria-pressed={sortOption === option.value}
        >
          <span className="text-sm sm:text-base">{option.icon}</span>
          <span className="hidden sm:inline">{option.label}</span>
          <span className="sm:hidden">{option.label.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
}

// React.memo로 메모이제이션
export default memo(SortOptions);

