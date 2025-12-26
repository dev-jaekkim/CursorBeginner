'use client';

import type { ParkingLot } from '@/app/lib/types';

interface ParkingListProps {
  parkingLots: ParkingLot[];
  selectedId?: number;
  onSelect: (parkingLot: ParkingLot) => void;
  searchTerm?: string;
}

// 검색어 하이라이트 함수
function highlightText(text: string, searchTerm: string): JSX.Element {
  if (!searchTerm || !text) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-400 text-gray-900 font-bold px-0.5 rounded"
            style={{ backgroundColor: '#facc15', color: '#111827' }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function ParkingList({
  parkingLots,
  selectedId,
  onSelect,
  searchTerm = '',
}: ParkingListProps) {
  if (parkingLots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-gray-500">주차장 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-3 p-4">
        {parkingLots.map((lot) => (
          <div
            key={lot.id}
            onClick={() => onSelect(lot)}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all
              ${
                selectedId === lot.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <h3 className="font-bold text-lg mb-2 text-gray-900">
              {highlightText(lot.name, searchTerm)}
            </h3>
            {lot.address && (
              <p className="text-sm text-gray-600 mb-2">{highlightText(lot.address, searchTerm)}</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
              {lot.total_parking_spaces && (
                <span className="flex items-center">
                  <span className="mr-1">🚗</span>
                  {lot.total_parking_spaces}대
                </span>
              )}
              {lot.distance !== undefined && (
                <span className="flex items-center text-blue-600 font-medium">
                  <span className="mr-1">📍</span>
                  {lot.distance < 1
                    ? `${Math.round(lot.distance * 1000)}m`
                    : `${lot.distance.toFixed(1)}km`}
                </span>
              )}
              {lot.oneHourFee !== undefined && lot.oneHourFee !== null && lot.oneHourFee > 0 && (
                <span className="flex items-center text-green-600 font-medium">
                  <span className="mr-1">💰</span>
                  {lot.oneHourFee.toLocaleString()}원/1시간
                </span>
              )}
              {lot.oneHourFee !== undefined && lot.oneHourFee !== null && lot.oneHourFee === 0 && (
                <span className="flex items-center text-green-600 font-medium">
                  <span className="mr-1">💰</span>
                  무료
                </span>
              )}
              {lot.isAvailable && (
                <span className="flex items-center text-green-600 font-medium">
                  <span className="mr-1">✅</span>
                  주차 가능
                </span>
              )}
            </div>
            {lot.phone && <p className="text-xs text-gray-500">📞 {lot.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
