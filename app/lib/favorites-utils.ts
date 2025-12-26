import type { ParkingLot } from './types';

const FAVORITES_STORAGE_KEY = 'parking_favorites';

/**
 * 로컬 스토리지에서 즐겨찾기 목록 가져오기
 */
export function getFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('즐겨찾기 로드 실패:', error);
    return [];
  }
}

/**
 * 즐겨찾기 변경 이벤트 발생
 */
function notifyFavoritesChange(): void {
  if (typeof window === 'undefined') return;
  // 같은 탭에서의 변경을 감지하기 위한 커스텀 이벤트
  window.dispatchEvent(new Event('favoritesUpdated'));
}

/**
 * 즐겨찾기 추가
 */
export function addFavorite(parkingId: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavorites();
    if (!favorites.includes(parkingId)) {
      favorites.push(parkingId);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      notifyFavoritesChange();
    }
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
  }
}

/**
 * 즐겨찾기 제거
 */
export function removeFavorite(parkingId: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavorites();
    const updated = favorites.filter((id) => id !== parkingId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    notifyFavoritesChange();
  } catch (error) {
    console.error('즐겨찾기 제거 실패:', error);
  }
}

/**
 * 즐겨찾기 여부 확인
 */
export function isFavorite(parkingId: number): boolean {
  const favorites = getFavorites();
  return favorites.includes(parkingId);
}

/**
 * 즐겨찾기 토글
 */
export function toggleFavorite(parkingId: number): boolean {
  if (isFavorite(parkingId)) {
    removeFavorite(parkingId);
    return false;
  } else {
    addFavorite(parkingId);
    return true;
  }
}

/**
 * 즐겨찾기된 주차장만 필터링
 */
export function getFavoriteParkingLots(
  parkingLots: ParkingLot[]
): ParkingLot[] {
  const favoriteIds = getFavorites();
  return parkingLots.filter((lot) => favoriteIds.includes(lot.id));
}

