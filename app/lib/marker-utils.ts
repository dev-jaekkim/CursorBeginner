import type { ParkingLot } from './types';

/**
 * 주차장 상태에 따른 마커 색상 결정
 */
export function getMarkerColor(lot: ParkingLot): string {
  // 주차 가능 여부 확인
  if (lot.isAvailable === true) {
    return '#22c55e'; // 초록색 - 주차 가능
  } else if (lot.isAvailable === false) {
    return '#ef4444'; // 빨간색 - 주차 불가능
  } else {
    return '#6b7280'; // 회색 - 정보 없음
  }
}

/**
 * SVG 마커 이미지 생성
 * @param color 마커 색상
 * @param label 마커에 표시할 라벨 (선택사항)
 * @returns Data URL 형식의 SVG 이미지
 */
export function createMarkerImage(color: string, label?: string): string {
  const size = 40;
  const labelSize = label ? 16 : 0;
  const totalHeight = size + labelSize;

  const svg = `
    <svg width="${size}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <!-- 원형 마커 배경 -->
      <circle cx="${size / 2}" 
              cy="${size / 2}" 
              r="${size / 2 - 2}" 
              fill="${color}" 
              stroke="#ffffff" 
              stroke-width="3"/>
      <!-- 주차장 아이콘 (P) -->
      <text x="${size / 2}" 
            y="${size / 2}" 
            font-family="Arial, sans-serif" 
            font-size="18" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle" 
            dominant-baseline="central">P</text>
      ${
        label
          ? `
      <!-- 라벨 배경 -->
      <rect x="${(size - label.length * 8) / 2}" 
            y="${size + 2}" 
            width="${label.length * 8}" 
            height="14" 
            fill="${color}" 
            rx="2"/>
      <!-- 라벨 텍스트 -->
      <text x="${size / 2}" 
            y="${size + 11}" 
            font-family="Arial, sans-serif" 
            font-size="10" 
            fill="white" 
            text-anchor="middle" 
            dominant-baseline="middle">${label}</text>
      `
          : ''
      }
    </svg>
  `.trim();

  // SVG를 직접 data URL로 사용 (base64 인코딩 대신)
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
}

/**
 * 주차장 정보에 맞는 마커 이미지 생성
 * @param lot 주차장 정보
 * @param isSelected 선택된 마커인지 여부
 */
export function getMarkerImageForParkingLot(lot: ParkingLot, isSelected: boolean = false): string {
  // 선택된 마커는 파란색으로 표시
  const color = isSelected ? '#3b82f6' : '#6b7280'; // 선택: 파란색, 기본: 회색

  // 주차 가능 대수 표시 (50대 이상이면 표시)
  const label =
    lot.total_parking_spaces && lot.total_parking_spaces >= 50
      ? `${lot.total_parking_spaces}`
      : undefined;

  return createMarkerImage(color, label);
}
