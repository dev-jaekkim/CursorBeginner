'use client';

import { useState } from 'react';

/**
 * 지도 범례 컴포넌트
 * 마커 색상이 무엇을 의미하는지 안내합니다.
 */
export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      color: '#6b7280',
      label: '일반 주차장',
      description: '주차장 마커',
    },
    {
      color: '#3b82f6',
      label: '선택된 주차장',
      description: '현재 선택된 주차장',
    },
  ];

  return (
    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-10">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 border border-gray-200 max-w-[180px] sm:max-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
              <span className="mr-1 text-sm">📍</span>
              <span>범례</span>
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
              aria-label="범례 접기"
            >
              ×
            </button>
          </div>
          <div className="space-y-1.5">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <p className="text-[10px] sm:text-xs font-medium text-gray-900">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-[9px] sm:text-[10px] text-gray-500">💡 숫자: 50대 이상</p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 hover:shadow-xl transition-shadow"
          aria-label="범례 보기"
          title="범례 보기"
        >
          <span className="text-lg">📍</span>
        </button>
      )}
    </div>
  );
}
