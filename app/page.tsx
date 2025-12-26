'use client';

import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';

import AvailableToggle from '@/app/components/AvailableToggle';
import ErrorMessage from '@/app/components/ErrorMessage';
import FavoritesToggle from '@/app/components/FavoritesToggle';
import MapSkeleton from '@/app/components/MapSkeleton';
import ParkingList from '@/app/components/ParkingList';
import ParkingListSkeleton from '@/app/components/ParkingListSkeleton';
import SearchBar from '@/app/components/SearchBar';
import SortOptions from '@/app/components/SortOptions';
import ViewToggle from '@/app/components/ViewToggle';

import type { FilterOptions } from '@/app/components/FilterPanel';

import { getErrorType, formatErrorMessage } from '@/app/lib/error-utils';
import { getFavoriteParkingLots, getFavorites } from '@/app/lib/favorites-utils';
import { filterParkingLots } from '@/app/lib/filter-utils';
import { useDebounce } from '@/app/lib/hooks/useDebounce';
import { getUserLocation } from '@/app/lib/utils';

import type { ParkingLot, SortOption } from '@/app/lib/types';

// 코드 스플리팅: 큰 컴포넌트들을 lazy loading
const Map = lazy(() => import('@/app/components/Map'));
const ParkingInfo = lazy(() => import('@/app/components/ParkingInfo'));
const FilterPanel = lazy(() => import('@/app/components/FilterPanel'));

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  // 검색어 debounce 적용 (500ms 지연)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedParkingLot, setSelectedParkingLot] = useState<ParkingLot | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'not-found' | 'unknown'>(
    'unknown'
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('distance');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<FilterOptions>({
    operatingHours: 'all',
    paidFreeType: 'all',
    parkingType: 'all',
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 초기 로드: 사용자 위치 가져오기 및 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 사용자 위치 가져오기
        const location = await getUserLocation();
        setUserLocation(location);

        // API 호출
        const params = new URLSearchParams({
          lat: location.latitude.toString(),
          lng: location.longitude.toString(),
          sort: 'distance', // 처음에는 거리순으로 정렬
        });

        const response = await fetch(`/api/parking?${params}`);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '알 수 없는 오류');
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }

          const errorMessage = errorData.error || `서버 오류 (${response.status})`;
          setError(formatErrorMessage(errorMessage));
          setErrorType(getErrorType(errorMessage));
          return;
        }

        const result = await response.json();

        if (result.error) {
          setError(formatErrorMessage(result.error));
          setErrorType(getErrorType(result.error));
          return;
        }

        const parkingData = result.data || [];
        setParkingLots(parkingData);
        setError(null);

        // 첫 번째 주차장이 있으면 자동으로 선택 (지도에 표시)
        if (parkingData.length > 0 && parkingData[0].latitude && parkingData[0].longitude) {
          const firstLot = parkingData[0];
          setSelectedParkingLot(firstLot);
          setShowInfo(true);
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        const errorMessage =
          err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
        setError(formatErrorMessage(errorMessage));
        setErrorType(getErrorType(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 즐겨찾기 목록 로드
  useEffect(() => {
    setFavoriteIds(getFavorites());

    // 로컬 스토리지 변경 감지
    const handleStorageChange = () => {
      setFavoriteIds(getFavorites());
    };

    window.addEventListener('storage', handleStorageChange);
    // 같은 탭에서의 변경도 감지하기 위한 커스텀 이벤트
    window.addEventListener('favoritesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
    };
  }, []);

  // 검색, 정렬, 필터 변경 시 데이터 다시 로드
  // debouncedSearchTerm을 사용하여 검색 최적화
  useEffect(() => {
    const loadData = async () => {
      if (!userLocation) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          lat: userLocation.latitude.toString(),
          lng: userLocation.longitude.toString(),
          sort: sortOption,
          availableOnly: availableOnly.toString(),
        });

        // debounce된 검색어 사용
        if (debouncedSearchTerm.trim()) {
          params.append('search', debouncedSearchTerm.trim());
        }

        const response = await fetch(`/api/parking?${params}`);
        const result = await response.json();

        if (result.error) {
          setError(result.error);
          return;
        }

        const parkingData = result.data || [];
        setParkingLots(parkingData);
        setError(null); // 성공 시 에러 초기화

        // 첫 번째 주차장이 있고 아직 선택된 주차장이 없으면 자동으로 선택
        if (
          !selectedParkingLot &&
          parkingData.length > 0 &&
          parkingData[0].latitude &&
          parkingData[0].longitude
        ) {
          const firstLot = parkingData[0];
          setSelectedParkingLot(firstLot);
          setShowInfo(true);
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        const errorMessage =
          err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
        setError(formatErrorMessage(errorMessage));
        setErrorType(getErrorType(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [debouncedSearchTerm, sortOption, availableOnly, userLocation]);

  // 재시도 함수
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // 데이터 다시 로드 (useEffect가 자동으로 트리거됨)
    if (userLocation) {
      const loadData = async () => {
        try {
          const params = new URLSearchParams({
            lat: userLocation.latitude.toString(),
            lng: userLocation.longitude.toString(),
            sort: sortOption,
            availableOnly: availableOnly.toString(),
          });

          if (debouncedSearchTerm.trim()) {
            params.append('search', debouncedSearchTerm.trim());
          }

          const response = await fetch(`/api/parking?${params}`);
          const result = await response.json();

          if (result.error) {
            setError(formatErrorMessage(result.error));
            setErrorType(getErrorType(result.error));
            return;
          }

          setParkingLots(result.data || []);
          setError(null);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
          setError(formatErrorMessage(errorMessage));
          setErrorType(getErrorType(err));
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  };

  // 필터링된 주차장 목록
  const filteredParkingLots = useMemo(() => {
    let filtered = parkingLots;

    // 즐겨찾기만 보기 필터
    if (showFavoritesOnly) {
      filtered = getFavoriteParkingLots(filtered);
    }

    // 추가 필터 적용
    filtered = filterParkingLots(filtered, filters);

    // 주차 가능 여부 필터
    if (availableOnly) {
      filtered = filtered.filter((lot) => lot.isAvailable);
    }

    return filtered;
  }, [parkingLots, filters, availableOnly, showFavoritesOnly]);

  // 주차 가능한 주차장 개수 계산
  const availableCount = useMemo(() => {
    return filteredParkingLots.filter((lot) => lot.isAvailable).length;
  }, [filteredParkingLots]);

  // 위도/경도가 있는 주차장 개수 계산 (필터링 전 원본 데이터에서)
  const parkingLotsWithCoordinates = useMemo(() => {
    return parkingLots.filter((lot) => {
      const lat =
        typeof lot.latitude === 'number'
          ? lot.latitude
          : parseFloat(String(lot.latitude || ''));
      const lng =
        typeof lot.longitude === 'number'
          ? lot.longitude
          : parseFloat(String(lot.longitude || ''));

      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    }).length;
  }, [parkingLots]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredParkingLots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedParkingLots = filteredParkingLots.slice(startIndex, endIndex);

  // 필터나 검색어 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, sortOption, availableOnly, filters, showFavoritesOnly]);

  // 주차장 선택 핸들러 (useCallback으로 메모이제이션)
  const handleSelectParkingLot = useCallback((lot: ParkingLot) => {
    setSelectedParkingLot(lot);
    setShowInfo(true);
    // 지도 이동을 위한 위치 설정 (위도/경도가 있는 경우만)
    if (lot.latitude && lot.longitude) {
      // Map 컴포넌트의 selectedLocation prop으로 전달됨
    }
  }, []);

  // 마커 클릭 핸들러 (useCallback으로 메모이제이션)
  const handleMarkerClick = useCallback(
    (lot: ParkingLot) => {
      handleSelectParkingLot(lot);
    },
    [handleSelectParkingLot]
  );

  // 정보 닫기 핸들러 (useCallback으로 메모이제이션)
  const handleCloseInfo = useCallback(() => {
    setShowInfo(false);
    setSelectedParkingLot(null);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            서울시 공영주차장 안내
          </h1>
          <div className="w-full sm:max-w-md mb-2 sm:mb-3">
            <SearchBar onSearch={setSearchTerm} placeholder="주차장 이름 또는 주소로 검색..." />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <SortOptions sortOption={sortOption} onSortChange={setSortOption} />
            <AvailableToggle
              isEnabled={availableOnly}
              onToggle={setAvailableOnly}
              count={availableCount}
            />
            <FavoritesToggle
              isEnabled={showFavoritesOnly}
              onToggle={setShowFavoritesOnly}
              count={favoriteIds.length}
            />
            <Suspense fallback={<div className="px-3 sm:px-4 py-1.5 sm:py-2">로딩...</div>}>
              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </Suspense>
          </div>
          {(debouncedSearchTerm ||
            filters.operatingHours !== 'all' ||
            filters.minCapacity ||
            filters.paidFreeType !== 'all' ||
            filters.parkingType !== 'all') && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              검색 결과: {parkingLotsWithCoordinates}개
              {searchTerm !== debouncedSearchTerm && (
                <span className="ml-2 text-gray-400 text-xs">(검색 중...)</span>
              )}
            </p>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 왼쪽: 주차장 리스트 */}
        <aside
          className={`
            bg-gray-50 border-r border-gray-200 flex-shrink-0
            ${mobileView === 'list' ? 'flex' : 'hidden'}
            md:flex md:flex-col
            w-full md:w-96
          `}
        >
          <div className="p-3 sm:p-4 bg-white border-b border-gray-200">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              주차장 목록 ({parkingLotsWithCoordinates})
            </h2>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <ParkingListSkeleton count={8} />
            ) : error ? (
              <ErrorMessage
                error={error}
                errorType={errorType}
                onRetry={handleRetry}
                onReload={() => window.location.reload()}
              />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <ParkingList
                    parkingLots={paginatedParkingLots}
                    selectedId={selectedParkingLot?.id}
                    onSelect={handleSelectParkingLot}
                    searchTerm={debouncedSearchTerm}
                  />
                </div>
                {/* 페이지네이션 */}
                {totalPages > 1 && (() => {
                  // 현재 페이지가 속한 그룹의 시작 페이지 계산 (5개씩 그룹)
                  const groupSize = 5;
                  const currentGroup = Math.floor((currentPage - 1) / groupSize);
                  const startPage = currentGroup * groupSize + 1;
                  const endPage = Math.min(startPage + groupSize - 1, totalPages);
                  const pagesInGroup = endPage - startPage + 1;

                  // 이전 그룹의 마지막 페이지
                  const prevGroupLastPage = startPage > 1 ? startPage - 1 : null;
                  // 다음 그룹의 첫 페이지
                  const nextGroupFirstPage = endPage < totalPages ? endPage + 1 : null;

                  return (
                    <div className="flex items-center justify-center gap-0.5 p-2 bg-white border-t border-gray-200">
                      {/* 이전 버튼 */}
                      {prevGroupLastPage !== null && (
                        <button
                          onClick={() => setCurrentPage(prevGroupLastPage)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          이전
                        </button>
                      )}
                      {/* 페이지 번호들 */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: pagesInGroup }, (_, i) => startPage + i).map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-2 py-1 text-xs font-medium rounded border min-w-[28px] ${
                                currentPage === page
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>
                      {/* 다음 버튼 */}
                      {nextGroupFirstPage !== null && (
                        <button
                          onClick={() => setCurrentPage(nextGroupFirstPage)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          다음
                        </button>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </aside>

        {/* 주차장 상세 정보 팝업 (목록 우측, 데스크톱) */}
        {showInfo && selectedParkingLot && (
          <div className="hidden md:block absolute left-96 top-4 w-80 lg:w-96 bg-white shadow-2xl border border-gray-200 rounded-lg z-40 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <Suspense fallback={<div className="p-4">로딩 중...</div>}>
              <ParkingInfo parkingLot={selectedParkingLot} onClose={handleCloseInfo} />
            </Suspense>
          </div>
        )}

        {/* 오른쪽: 지도 */}
        <main
          className={`
            flex-1 relative
            ${mobileView === 'map' ? 'flex' : 'hidden'}
            md:flex
          `}
        >
          {loading && !userLocation ? (
            <MapSkeleton />
          ) : userLocation ? (
            <Suspense fallback={<MapSkeleton />}>
              <Map
                parkingLots={filteredParkingLots}
                onMarkerClick={handleMarkerClick}
                center={{
                  lat: userLocation.latitude,
                  lng: userLocation.longitude,
                }}
                selectedLocation={
                  selectedParkingLot?.latitude && selectedParkingLot?.longitude
                    ? (() => {
                        // 좌표를 숫자로 변환 (문자열일 수 있음)
                        const lat =
                          typeof selectedParkingLot.latitude === 'number'
                            ? selectedParkingLot.latitude
                            : parseFloat(String(selectedParkingLot.latitude || ''));
                        const lng =
                          typeof selectedParkingLot.longitude === 'number'
                            ? selectedParkingLot.longitude
                            : parseFloat(String(selectedParkingLot.longitude || ''));

                        // 유효한 좌표인지 확인
                        if (
                          !isNaN(lat) &&
                          !isNaN(lng) &&
                          lat >= -90 &&
                          lat <= 90 &&
                          lng >= -180 &&
                          lng <= 180
                        ) {
                          return { lat, lng };
                        }
                        return null;
                      })()
                    : null
                }
                selectedParkingLotId={selectedParkingLot?.id || null}
              />
            </Suspense>
          ) : (
            <MapSkeleton />
          )}
        </main>
      </div>

      {/* 모바일 뷰 토글 버튼 */}
      <ViewToggle currentView={mobileView} onViewChange={setMobileView} />

      {/* 모바일: 하단 주차장 상세 정보 */}
      {showInfo && selectedParkingLot && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-xl z-50 border-t-4 border-blue-500 max-h-[60vh] overflow-y-auto">
          <Suspense fallback={<div className="p-4">로딩 중...</div>}>
            <ParkingInfo parkingLot={selectedParkingLot} onClose={handleCloseInfo} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
