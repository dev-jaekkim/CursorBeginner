'use client';

import { memo } from 'react';

import FavoriteButton from './FavoriteButton';

import type { ParkingLot } from '@/app/lib/types';


interface ParkingInfoProps {
  parkingLot: ParkingLot | null;
  onClose: () => void;
}

// HHMM 형식을 HH:MM 형식으로 변환
function formatTime(timeStr: string): string {
  if (!timeStr || timeStr.length !== 4) {
    return timeStr;
  }
  return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
}

function ParkingInfo({ parkingLot, onClose }: ParkingInfoProps) {
  if (!parkingLot) {
    return null;
  }

  return (
    <div className="flex flex-col bg-white p-4 sm:p-5 border-l-4 border-blue-500">
      {/* 헤더 */}
      <div className="flex-shrink-0 flex justify-between items-start mb-2 sm:mb-3">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2">
              {parkingLot.name}
            </h2>
            <FavoriteButton parkingId={parkingLot.id} size="sm" />
          </div>
          {parkingLot.address && (
            <p className="text-xs text-gray-600 line-clamp-1">{parkingLot.address}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none w-6 h-6 flex items-center justify-center"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {/* 내용 */}
      <div className="overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {parkingLot.total_parking_spaces && (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-base">🚗</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">총 주차면</p>
              <p className="text-sm font-semibold text-gray-900">
                {parkingLot.total_parking_spaces}대
              </p>
            </div>
          </div>
        )}

        {parkingLot.distance !== undefined && (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-base">📍</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">거리</p>
              <p className="text-sm font-semibold text-gray-900">
                {parkingLot.distance < 1
                  ? `${Math.round(parkingLot.distance * 1000)}m`
                  : `${parkingLot.distance.toFixed(1)}km`}
              </p>
            </div>
          </div>
        )}

        {parkingLot.oneHourFee !== undefined && parkingLot.oneHourFee !== null && (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-base">💰</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">1시간 요금</p>
              <p className="text-sm font-semibold text-gray-900">
                {parkingLot.oneHourFee === 0
                  ? '무료'
                  : `${parkingLot.oneHourFee.toLocaleString()}원`}
              </p>
            </div>
          </div>
        )}

        {parkingLot.isAvailable !== undefined && (
          <div className="flex items-center space-x-2">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              parkingLot.isAvailable 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              <span className="text-base">{parkingLot.isAvailable ? '✅' : '❌'}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">현재 주차 가능 여부</p>
              <p className={`text-sm font-semibold ${
                parkingLot.isAvailable 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>
                {parkingLot.isAvailable ? '가능' : '불가능'}
              </p>
            </div>
          </div>
        )}

        {parkingLot.weekday_start_time && parkingLot.weekday_end_time && (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-base">🕐</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">평일 운영 시간</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatTime(parkingLot.weekday_start_time)} -{' '}
                {formatTime(parkingLot.weekday_end_time)}
              </p>
            </div>
          </div>
        )}

        {parkingLot.phone && (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-base">📞</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">전화번호</p>
              <a
                href={`tel:${parkingLot.phone}`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                {parkingLot.phone}
              </a>
            </div>
          </div>
        )}

        {parkingLot.paid_free_type_name && (
          <div className="flex items-center space-x-2">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              parkingLot.paid_free_type_name === '무료' || parkingLot.paid_free_type_name?.includes('무료')
                ? 'bg-green-100' 
                : 'bg-orange-100'
            }`}>
              <span className="text-base">💳</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">유무료 구분</p>
              <p className={`text-sm font-semibold ${
                parkingLot.paid_free_type_name === '무료' || parkingLot.paid_free_type_name?.includes('무료')
                  ? 'text-green-700' 
                  : 'text-orange-700'
              }`}>
                {parkingLot.paid_free_type_name}
              </p>
            </div>
          </div>
        )}

        {parkingLot.parking_type_name && (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-base">🏢</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">주차장 종류</p>
              <p className="text-sm font-semibold text-gray-900">
                {parkingLot.parking_type_name}
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// React.memo로 메모이제이션하여 불필요한 리렌더링 방지
export default memo(ParkingInfo);

