'use client';

/**
 * 지도 로딩 스켈레톤 UI
 * 지도가 로딩되는 동안 표시됩니다.
 */
export default function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 relative">
      {/* 배경 그리드 패턴 */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #000 1px, transparent 1px),
            linear-gradient(#000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* 로딩 스피너 및 메시지 */}
      <div className="text-center z-10">
        <div className="mb-4">
          {/* 회전 링 */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
        </div>
        <p className="text-gray-600 font-medium">지도를 불러오는 중...</p>
        <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

