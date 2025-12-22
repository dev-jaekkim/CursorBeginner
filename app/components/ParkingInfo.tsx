'use client';

import type { ParkingLot } from '@/app/lib/types';

interface ParkingInfoProps {
  parkingLot: ParkingLot | null;
  onClose: () => void;
}

export default function ParkingInfo({ parkingLot, onClose }: ParkingInfoProps) {
  if (!parkingLot) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-6 max-h-[50vh] overflow-y-auto z-50">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">{parkingLot.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        {parkingLot.address && (
          <div>
            <span className="font-semibold">주소: </span>
            <span>{parkingLot.address}</span>
          </div>
        )}
        {parkingLot.capacity && (
          <div>
            <span className="font-semibold">주차 가능 대수: </span>
            <span>{parkingLot.capacity}대</span>
          </div>
        )}
        {parkingLot.operating_hours && (
          <div>
            <span className="font-semibold">운영 시간: </span>
            <span>{parkingLot.operating_hours}</span>
          </div>
        )}
        {parkingLot.fee_info && (
          <div>
            <span className="font-semibold">요금 정보: </span>
            <span>{parkingLot.fee_info}</span>
          </div>
        )}
        {parkingLot.phone && (
          <div>
            <span className="font-semibold">전화번호: </span>
            <span>{parkingLot.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

