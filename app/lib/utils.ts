import type { ParkingLot, SortOption } from './types';

// 페이게이트 회사 위치 (서울시청 좌표를 기본값으로 사용)
export const DEFAULT_LOCATION = {
  latitude: 37.5665,
  longitude: 126.9780,
};

/**
 * 두 좌표 간의 거리를 계산 (Haversine 공식)
 * @param lat1 첫 번째 위도
 * @param lng1 첫 번째 경도
 * @param lat2 두 번째 위도
 * @param lng2 두 번째 경도
 * @returns 거리 (km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 주차장의 1시간 요금 계산
 * @param lot 주차장 정보
 * @returns 1시간 요금 (원)
 */
export function calculateOneHourFee(lot: ParkingLot): number {
  // 무료인 경우
  if (lot.paid_free_type === '무료' || lot.paid_free_type_name === '무료') {
    return 0;
  }

  // 기본 요금 정보가 없는 경우
  if (!lot.basic_parking_fee || !lot.basic_parking_time) {
    return 0;
  }

  const basicFee = lot.basic_parking_fee;
  const basicTime = lot.basic_parking_time; // 분 단위
  const additionalFee = lot.additional_unit_fee || 0;
  const additionalTime = lot.additional_unit_time || 0; // 분 단위

  // 1시간(60분) 이내인 경우
  if (basicTime >= 60) {
    return basicFee;
  }

  // 1시간을 초과하는 경우
  const remainingTime = 60 - basicTime;
  if (remainingTime <= 0) {
    return basicFee;
  }

  // 추가 시간 단위가 없으면 기본 요금만 반환
  if (!additionalTime || additionalTime <= 0) {
    return basicFee;
  }

  // 추가 요금 계산
  const additionalUnits = Math.ceil(remainingTime / additionalTime);
  return basicFee + additionalUnits * additionalFee;
}

/**
 * 공휴일인지 확인하는 간단한 체크 (한국의 주요 공휴일)
 * 실제로는 API나 라이브러리를 사용하는 것이 더 정확함
 * @param date 확인할 날짜
 * @returns 공휴일 여부
 */
function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  // const year = date.getFullYear(); // 사용하지 않는 변수 제거

  // 고정 공휴일
  const fixedHolidays: Array<[number, number]> = [
    [1, 1], // 신정
    [3, 1], // 삼일절
    [5, 5], // 어린이날
    [6, 6], // 현충일
    [8, 15], // 광복절
    [10, 3], // 개천절
    [10, 9], // 한글날
    [12, 25], // 크리스마스
  ];

  if (fixedHolidays.some(([m, d]) => m === month && d === day)) {
    return true;
  }

  // 설날, 추석은 음력이라 복잡하므로 간단히 처리
  // 실제로는 라이브러리 사용 권장

  return false;
}

/**
 * 현재 시간이 주차장 운영 시간 내인지 확인
 * @param lot 주차장 정보
 * @returns 현재 주차 가능 여부
 */
export function isCurrentlyAvailable(lot: ParkingLot): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM 형식

  let startTime: string | undefined;
  let endTime: string | undefined;

  // 공휴일 체크
  const isHolidayToday = isHoliday(now);

  // 공휴일인 경우
  if (isHolidayToday && lot.holiday_start_time && lot.holiday_end_time) {
    startTime = lot.holiday_start_time;
    endTime = lot.holiday_end_time;
  }
  // 주말 (토요일: 6, 일요일: 0)
  else if (dayOfWeek === 0 || dayOfWeek === 6) {
    startTime = lot.weekend_start_time;
    endTime = lot.weekend_end_time;
  } else {
    // 평일
    startTime = lot.weekday_start_time;
    endTime = lot.weekday_end_time;
  }

  // 운영 시간 정보가 없는 경우
  if (!startTime || !endTime) {
    return true; // 정보가 없으면 가능한 것으로 간주
  }

  // HHMM 형식 유효성 검증
  if (!/^\d{4}$/.test(startTime) || !/^\d{4}$/.test(endTime)) {
    return true; // 형식이 잘못되었으면 가능한 것으로 간주
  }

  // HHMM 형식을 숫자로 변환
  const start = parseInt(startTime, 10);
  const end = parseInt(endTime, 10);

  // 유효한 시간 범위인지 확인
  if (isNaN(start) || isNaN(end) || start < 0 || start > 2359 || end < 0 || end > 2359) {
    return true; // 유효하지 않으면 가능한 것으로 간주
  }

  // 24시간 운영인 경우 (0000-2359)
  if (start === 0 && end === 2359) {
    return true;
  }

  // 시간 범위 확인
  if (start <= end) {
    // 같은 날 내 범위 (예: 0900-1800)
    return currentTime >= start && currentTime <= end;
  } else {
    // 자정을 넘어가는 경우 (예: 2200-0600)
    return currentTime >= start || currentTime <= end;
  }
}

/**
 * 주차장 목록을 정렬
 * @param lots 주차장 목록
 * @param sortOption 정렬 옵션
 * @param userLat 사용자 위도
 * @param userLng 사용자 경도
 * @returns 정렬된 주차장 목록
 */
export function sortParkingLots(
  lots: ParkingLot[],
  sortOption: SortOption | string,
  userLat?: number,
  userLng?: number
): ParkingLot[] {
  const sorted = [...lots];

  switch (sortOption) {
    case 'distance':
      if (userLat && userLng) {
        return sorted.sort((a, b) => {
          if (!a.latitude || !a.longitude) {
            return 1;
          }
          if (!b.latitude || !b.longitude) {
            return -1;
          }
          const distA = calculateDistance(
            userLat,
            userLng,
            a.latitude,
            a.longitude
          );
          const distB = calculateDistance(
            userLat,
            userLng,
            b.latitude,
            b.longitude
          );
          return distA - distB;
        });
      }
      return sorted;

    case 'fee':
      return sorted.sort((a, b) => {
        const feeA = calculateOneHourFee(a);
        const feeB = calculateOneHourFee(b);
        return feeA - feeB;
      });

    case 'available':
      return sorted.sort((a, b) => {
        const spacesA = a.total_parking_spaces || 0;
        const spacesB = b.total_parking_spaces || 0;
        return spacesB - spacesA; // 내림차순 (많은 순)
      });

    case 'name':
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }
}

/**
 * 사용자 위치 가져오기
 * @returns 사용자 위치 또는 기본 위치
 */
export async function getUserLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation을 지원하지 않습니다. 기본 위치를 사용합니다.');
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log('위치 정보를 가져올 수 없습니다:', error);
        console.log('기본 위치를 사용합니다.');
        resolve(DEFAULT_LOCATION);
      },
      {
        timeout: 5000,
        maximumAge: 60000, // 1분간 캐시된 위치 사용
      }
    );
  });
}

