import { NextRequest, NextResponse } from 'next/server';

import type { ParkingLot, SortOption } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabase';
import {
  calculateDistance,
  calculateOneHourFee,
  isCurrentlyAvailable,
  sortParkingLots,
} from '@/app/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const search = searchParams.get('search');
    const sort = (searchParams.get('sort') as SortOption) || 'name';
    const availableOnly = searchParams.get('availableOnly') === 'true';

    let query = supabase.from('parking_lots').select('*', { count: 'exact' });

    // 검색어 필터
    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
    }

    // 기본 정렬 (이름순)
    query = query.order('name', { ascending: true });

    // Supabase 기본 제한(1000개)을 초과하여 모든 데이터 가져오기
    const { data, error, count } = await query.range(0, 10000);

    if (error) {
      console.error('Supabase 에러:', error);
      return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 });
    }

    // 디버깅: 실제 조회된 데이터 개수 확인
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] DB 총 개수: ${count}, 조회된 데이터: ${(data || []).length}개`);
    }

    let parkingLots: ParkingLot[] = (data || []) as ParkingLot[];

    // 주차 가능 여부 필터링
    if (availableOnly) {
      parkingLots = parkingLots.filter((lot) => isCurrentlyAvailable(lot));
    }

    // 거리 계산 및 추가 정보 계산
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;

    parkingLots = parkingLots.map((lot) => {
      // 좌표를 숫자로 변환 (Supabase DECIMAL이 문자열로 반환될 수 있음)
      const latitude =
        lot.latitude !== null && lot.latitude !== undefined
          ? typeof lot.latitude === 'string'
            ? parseFloat(lot.latitude)
            : Number(lot.latitude)
          : null;
      const longitude =
        lot.longitude !== null && lot.longitude !== undefined
          ? typeof lot.longitude === 'string'
            ? parseFloat(lot.longitude)
            : Number(lot.longitude)
          : null;

      // 유효한 좌표인지 확인
      const hasValidCoordinates =
        latitude !== null &&
        longitude !== null &&
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      const distance =
        userLat && userLng && hasValidCoordinates
          ? calculateDistance(userLat, userLng, latitude!, longitude!)
          : undefined;
      const oneHourFee = calculateOneHourFee(lot);
      const isAvailable = isCurrentlyAvailable(lot);

      return {
        ...lot,
        latitude: hasValidCoordinates ? latitude : undefined,
        longitude: hasValidCoordinates ? longitude : undefined,
        distance,
        oneHourFee,
        isAvailable,
      };
    });

    // 클라이언트 측 정렬
    parkingLots = sortParkingLots(parkingLots, sort, userLat, userLng);

    // 디버깅: 위도/경도가 있는 주차장 개수 확인
    const withCoordinates = parkingLots.filter((lot) => {
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

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] 위도/경도가 있는 주차장: ${withCoordinates}개 / 전체: ${parkingLots.length}개`);
    }

    return NextResponse.json({ data: parkingLots });
  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
