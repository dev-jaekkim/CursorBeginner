'use client';

import { useEffect, useRef, useState, memo } from 'react';

import { loadKakaoMapScript } from '@/app/lib/kakao-map';
import { getMarkerImageForParkingLot } from '@/app/lib/marker-utils';

import type { ParkingLot } from '@/app/lib/types';

import MapLegend from './MapLegend';

interface MapProps {
  parkingLots: ParkingLot[];
  onMarkerClick?: (parkingLot: ParkingLot) => void;
  center?: { lat: number; lng: number };
  selectedLocation?: { lat: number; lng: number } | null;
  selectedParkingLotId?: number | null;
}

function Map({
  parkingLots,
  onMarkerClick,
  center,
  selectedLocation,
  selectedParkingLotId,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const selectedMarkerRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('카카오맵 API 키가 설정되지 않았습니다. 지도가 표시되지 않습니다.');
      }
      return;
    }

    loadKakaoMapScript(apiKey)
      .then(() => {
        if (mapRef.current) {
          // center prop이 있으면 사용, 없으면 서울시청 좌표를 기본 중심으로 설정
          const mapCenter = center
            ? new window.kakao.maps.LatLng(center.lat, center.lng)
            : new window.kakao.maps.LatLng(37.5665, 126.978);
          const options = {
            center: mapCenter,
            level: 6,
          };
          const map = new window.kakao.maps.Map(mapRef.current, options);
          mapInstanceRef.current = map;
          setIsLoaded(true);
        }
      })
      .catch((error) => {
        // 에러는 개발 모드에서만 로그
        if (process.env.NODE_ENV === 'development') {
          console.error('카카오맵 로드 실패:', error);
        }
      });
  }, []);

  // 지도 중심 이동 (초기 위치 설정)
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !center) {
      return;
    }

    const mapCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapInstanceRef.current.setCenter(mapCenter);
  }, [isLoaded, center]);

  // 선택된 주차장 위치로 지도 이동 (부드러운 애니메이션)
  // 마커를 지도의 2/3 지점에 위치시킴 (상세 정보 팝업 때문에 가려지지 않도록)
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedLocation) {
      return;
    }

    try {
      // 유효한 좌표인지 확인
      if (
        typeof selectedLocation.lat !== 'number' ||
        typeof selectedLocation.lng !== 'number' ||
        isNaN(selectedLocation.lat) ||
        isNaN(selectedLocation.lng)
      ) {
        return;
      }

      // 지도 경계를 가져와서 너비 계산
      const mapBounds = mapInstanceRef.current.getBounds();
      const swLatLng = mapBounds.getSouthWest();
      const neLatLng = mapBounds.getNorthEast();

      // 지도 너비 계산 (경도 차이)
      const mapWidth = neLatLng.getLng() - swLatLng.getLng();

      // 마커를 화면의 2/3 지점(오른쪽에서 1/3)에 위치시키려면
      // 지도 중심을 마커보다 왼쪽으로 이동시켜야 함
      // 오프셋 = 지도 너비 * (1/6) 정도 (2/3 지점에 위치시키기 위해)
      const offsetRatio = 1 / 6; // 마커를 2/3 지점에 위치시키기 위한 오프셋 비율
      const offsetLng = mapWidth * offsetRatio;

      // 지도 중심을 마커보다 왼쪽으로 이동
      const adjustedCenter = new window.kakao.maps.LatLng(
        selectedLocation.lat,
        selectedLocation.lng - offsetLng
      );

      // panTo를 사용하여 부드럽게 이동
      mapInstanceRef.current.panTo(adjustedCenter);

      // 줌 레벨 조정 (선택사항: 더 가까이 보기)
      mapInstanceRef.current.setLevel(4);
    } catch (error) {
      // 에러는 개발 모드에서만 로그
      if (process.env.NODE_ENV === 'development') {
        console.error('지도 이동 중 오류 발생:', error);
      }
    }
  }, [isLoaded, selectedLocation]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) {
      return;
    }

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 기존 선택된 마커 제거
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null);
      selectedMarkerRef.current = null;
    }

    // let markerCount = 0; // 사용하지 않는 변수 제거

    // 새로운 마커 추가 (좌표가 유효한 경우에만)
    parkingLots.forEach((lot) => {
      // 좌표 유효성 검증
      const lat =
        typeof lot.latitude === 'number' ? lot.latitude : parseFloat(String(lot.latitude || ''));
      const lng =
        typeof lot.longitude === 'number' ? lot.longitude : parseFloat(String(lot.longitude || ''));

      // 좌표가 없거나 유효하지 않은 경우 건너뜀
      if (
        !lat ||
        !lng ||
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return; // 좌표가 없거나 유효하지 않으면 마커 생성하지 않음
      }

      try {
        const position = new window.kakao.maps.LatLng(lat, lng);

        // 선택된 주차장인지 확인
        const isSelected = selectedParkingLotId === lot.id;

        // 커스텀 마커 이미지 생성 (선택 여부에 따라 색상 변경)
        const imageSrc = getMarkerImageForParkingLot(lot, isSelected);
        const hasLabel = lot.total_parking_spaces && lot.total_parking_spaces >= 50;
        const imageSize = new window.kakao.maps.Size(40, hasLabel ? 56 : 40);
        const imageOption = { offset: new window.kakao.maps.Point(20, hasLabel ? 28 : 20) };
        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const marker = new window.kakao.maps.Marker({
          position,
          image: markerImage,
          title: lot.name,
          zIndex: isSelected ? 1000 : 1, // 선택된 마커를 위에 표시
        });

        // 선택된 마커인 경우 강조 표시
        if (isSelected) {
          selectedMarkerRef.current = marker;
          marker.setZIndex(1000);
        }

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (onMarkerClick) {
            onMarkerClick(lot);
          }
        });

        marker.setMap(mapInstanceRef.current);
        markersRef.current.push(marker);
        // markerCount++; // 사용하지 않는 변수 제거
      } catch (error) {
        // 마커 생성 실패는 조용히 처리 (개발 모드에서만 로그)
        if (process.env.NODE_ENV === 'development') {
          console.error('마커 생성 실패:', lot.name, error);
        }
      }
    });
  }, [isLoaded, parkingLots, onMarkerClick, selectedParkingLotId]);

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">카카오맵 API 키가 필요합니다</h3>
          <p className="text-gray-500 mb-4">
            환경 변수에 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 설정해주세요.
          </p>
          <div className="bg-white rounded-lg p-4 shadow-sm text-left max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-2">
              현재 목 데이터로 주차장 리스트는 확인할 수 있습니다.
            </p>
            <p className="text-xs text-gray-500">주차장 위치: {parkingLots.length}개</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full min-h-[600px]" />
      {/* 범례 표시 */}
      {isLoaded && <MapLegend />}
    </div>
  );
}

// React.memo로 메모이제이션하여 불필요한 리렌더링 방지
export default memo(Map);
