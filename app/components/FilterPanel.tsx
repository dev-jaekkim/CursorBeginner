'use client';

import { useState } from 'react';

export type FilterOptions = {
  operatingHours: 'all' | '24h' | 'daytime' | 'night';
  minCapacity?: number;
  paidFreeType: 'all' | 'paid' | 'free';
  parkingType: 'all' | '노외 주차장' | '노상 주차장';
};

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose?: () => void;
}

export default function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="relative">
      {/* 필터 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all whitespace-nowrap"
        aria-label="필터 옵션 열기"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>🔍</span>
        <span className="hidden sm:inline">필터</span>
        {(filters.operatingHours !== 'all' ||
          filters.minCapacity ||
          filters.paidFreeType !== 'all' ||
          filters.parkingType !== 'all') && (
          <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
            활성
          </span>
        )}
      </button>

      {/* 필터 패널 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* 필터 패널 */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[280px] sm:min-w-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">필터</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* 운영 시간 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">운영 시간</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: '전체' },
                    { value: '24h', label: '24시간 운영' },
                    { value: 'daytime', label: '주간 운영' },
                    { value: 'night', label: '야간 운영' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="operatingHours"
                        value={option.value}
                        checked={filters.operatingHours === option.value}
                        onChange={(e) =>
                          handleFilterChange(
                            'operatingHours',
                            e.target.value as FilterOptions['operatingHours']
                          )
                        }
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 주차 대수 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 주차 대수
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={filters.minCapacity || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'minCapacity',
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleFilterChange('minCapacity', undefined)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    초기화
                  </button>
                </div>
              </div>

              {/* 유무료 구분 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">유무료 구분</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: '전체' },
                    { value: 'paid', label: '유료' },
                    { value: 'free', label: '무료' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paidFreeType"
                        value={option.value}
                        checked={filters.paidFreeType === option.value}
                        onChange={(e) =>
                          handleFilterChange(
                            'paidFreeType',
                            e.target.value as FilterOptions['paidFreeType']
                          )
                        }
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 주차장 종류 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주차장 종류</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: '전체' },
                    { value: '노외 주차장', label: '노외 주차장' },
                    { value: '노상 주차장', label: '노상 주차장' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="parkingType"
                        value={option.value}
                        checked={filters.parkingType === option.value}
                        onChange={(e) =>
                          handleFilterChange(
                            'parkingType',
                            e.target.value as FilterOptions['parkingType']
                          )
                        }
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 필터 초기화 버튼 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onFiltersChange({
                    operatingHours: 'all',
                    paidFreeType: 'all',
                    parkingType: 'all',
                  });
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
