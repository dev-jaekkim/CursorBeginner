'use client';

type ViewMode = 'list' | 'map';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

/**
 * 모바일에서 리스트/지도 뷰를 토글하는 컴포넌트
 */
export default function ViewToggle({
  currentView,
  onViewChange,
}: ViewToggleProps) {
  return (
    <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
        <button
          onClick={() => onViewChange('list')}
          className={`
            px-6 py-3 font-medium text-sm transition-all
            ${
              currentView === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
          aria-label="리스트 보기"
          aria-pressed={currentView === 'list'}
        >
          📋 리스트
        </button>
        <button
          onClick={() => onViewChange('map')}
          className={`
            px-6 py-3 font-medium text-sm transition-all
            ${
              currentView === 'map'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
          aria-label="지도 보기"
          aria-pressed={currentView === 'map'}
        >
          🗺️ 지도
        </button>
      </div>
    </div>
  );
}

