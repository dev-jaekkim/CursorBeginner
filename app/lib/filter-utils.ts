import type { FilterOptions } from '@/app/components/FilterPanel';
import type { ParkingLot } from './types';

import { isCurrentlyAvailable } from './utils';

/**
 * 운영 시간 필터링
 * isCurrentlyAvailable 함수를 재사용하여 로직 단순화
 */
function filterByOperatingHours(
  lot: ParkingLot,
  operatingHours: FilterOptions['operatingHours']
): boolean {
  if (operatingHours === 'all') {
    return true;
  }

  const now = new Date();
  // const currentTime = now.getHours() * 100 + now.getMinutes(); // 사용하지 않는 변수 제거

  switch (operatingHours) {
    case '24h':
      // 24시간 운영: 시작시간이 0000이고 종료시간이 2359인 경우
      return (
        lot.weekday_start_time === '0000' &&
        lot.weekday_end_time === '2359'
      );

    case 'daytime':
      // 주간 운영: 현재 시간이 운영 시간 내에 있고, 6시~22시 사이
      const isAvailable = isCurrentlyAvailable(lot);
      const hour = now.getHours();
      return isAvailable && hour >= 6 && hour < 22;

    case 'night':
      // 야간 운영: 현재 시간이 운영 시간 내에 있고, 22시~6시 사이
      const isAvailableNight = isCurrentlyAvailable(lot);
      const nightHour = now.getHours();
      return isAvailableNight && (nightHour >= 22 || nightHour < 6);

    default:
      return true;
  }
}

/**
 * 주차 대수 필터링
 */
function filterByCapacity(lot: ParkingLot, minCapacity?: number): boolean {
  if (!minCapacity) {
    return true;
  }
  return (lot.total_parking_spaces || 0) >= minCapacity;
}

/**
 * 유무료 구분 필터링
 */
function filterByPaidFreeType(
  lot: ParkingLot,
  paidFreeType: FilterOptions['paidFreeType']
): boolean {
  if (paidFreeType === 'all') {
    return true;
  }

  const isFree =
    lot.paid_free_type === '무료' || lot.paid_free_type_name === '무료' || lot.oneHourFee === 0;

  if (paidFreeType === 'free') {
    return isFree;
  } else if (paidFreeType === 'paid') {
    return !isFree;
  }

  return true;
}

/**
 * 주차장 종류 필터링
 */
function filterByParkingType(lot: ParkingLot, parkingType: FilterOptions['parkingType']): boolean {
  if (parkingType === 'all') {
    return true;
  }
  return lot.parking_type_name === parkingType;
}

/**
 * 주차장 목록 필터링
 */
export function filterParkingLots(lots: ParkingLot[], filters: FilterOptions): ParkingLot[] {
  return lots.filter((lot) => {
    return (
      filterByOperatingHours(lot, filters.operatingHours) &&
      filterByCapacity(lot, filters.minCapacity) &&
      filterByPaidFreeType(lot, filters.paidFreeType) &&
      filterByParkingType(lot, filters.parkingType)
    );
  });
}
