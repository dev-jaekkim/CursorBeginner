'use client';

import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript } from '@/app/lib/kakao-map';
import type { ParkingLot } from '@/app/lib/types';

interface MapProps {
  parkingLots: ParkingLot[];
  onMarkerClick?: (parkingLot: ParkingLot) => void;
}

export default function Map({ parkingLots, onMarkerClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      console.error('카카오맵 API 키가 설정되지 않았습니다.');
      return;
    }

    loadKakaoMapScript(apiKey)
      .then(() => {
        if (mapRef.current) {
          // 서울시청 좌표를 기본 중심으로 설정
          const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
          const options = {
            center,
            level: 6,
          };
          const map = new window.kakao.maps.Map(mapRef.current, options);
          mapInstanceRef.current = map;
          setIsLoaded(true);
        }
      })
      .catch((error) => {
        console.error('카카오맵 로드 실패:', error);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새로운 마커 추가
    parkingLots.forEach((lot) => {
      if (lot.latitude && lot.longitude) {
        const position = new window.kakao.maps.LatLng(
          lot.latitude,
          lot.longitude
        );
        const marker = new window.kakao.maps.Marker({
          position,
          title: lot.name,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (onMarkerClick) {
            onMarkerClick(lot);
          }
        });

        marker.setMap(mapInstanceRef.current);
        markersRef.current.push(marker);
      }
    });
  }, [isLoaded, parkingLots, onMarkerClick]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full min-h-[600px]" />
    </div>
  );
}

