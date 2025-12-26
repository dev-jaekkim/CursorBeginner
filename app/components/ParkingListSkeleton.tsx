'use client';

interface ParkingListSkeletonProps {
  count?: number;
}

/**
 * 주차장 리스트 로딩 스켈레톤 UI
 * 실제 주차장 카드와 유사한 구조로 로딩 상태를 표시합니다.
 */
export default function ParkingListSkeleton({
  count = 6,
}: ParkingListSkeletonProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-3 p-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border-2 border-gray-200 bg-white animate-pulse"
          >
            {/* 주차장 이름 스켈레톤 */}
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>

            {/* 주소 스켈레톤 */}
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>

            {/* 정보 태그들 스켈레톤 */}
            <div className="flex flex-wrap gap-3 mb-2">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>

            {/* 전화번호 스켈레톤 */}
            <div className="h-3 bg-gray-200 rounded w-32 mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

