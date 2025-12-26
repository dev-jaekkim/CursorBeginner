import { NextRequest, NextResponse } from 'next/server';

import type { ParkingLot } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabase';
import {
  calculateDistance,
  calculateOneHourFee,
  isCurrentlyAvailable,
} from '@/app/lib/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * 단일 주차장 정보 조회 API
 * GET /api/parking/[id]
 * 
 * Query Parameters:
 * - lat: 사용자 위도 (선택, 거리 계산용)
 * - lng: 사용자 경도 (선택, 거리 계산용)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = params.id;
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // ID 유효성 검사
    const parkingId = parseInt(id, 10);
    if (isNaN(parkingId)) {
      return NextResponse.json(
        { error: '유효하지 않은 주차장 ID입니다.' },
        { status: 400 }
      );
    }

    // Supabase에서 주차장 정보 조회
    const { data, error } = await supabase
      .from('parking_lots')
      .select('*')
      .eq('id', parkingId)
      .single();

    if (error) {
      console.error('Supabase 에러:', error);
      
      // 데이터를 찾을 수 없는 경우
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '주차장을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: '데이터 조회 실패' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: '주차장을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const parkingLot: ParkingLot = data as ParkingLot;

    // 좌표를 숫자로 변환 (Supabase DECIMAL이 문자열로 반환될 수 있음)
    const latitude = parkingLot.latitude 
      ? typeof parkingLot.latitude === 'string' 
        ? parseFloat(parkingLot.latitude) 
        : Number(parkingLot.latitude)
      : null;
    const longitude = parkingLot.longitude 
      ? typeof parkingLot.longitude === 'string' 
        ? parseFloat(parkingLot.longitude) 
        : Number(parkingLot.longitude)
      : null;

    // 유효한 좌표인지 확인
    const hasValidCoordinates = 
      latitude !== null && 
      longitude !== null && 
      !isNaN(latitude) && 
      !isNaN(longitude) &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180;

    // 거리 계산 및 추가 정보 계산
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;

    const distance =
      userLat && userLng && hasValidCoordinates
        ? calculateDistance(userLat, userLng, latitude!, longitude!)
        : undefined;
    const oneHourFee = calculateOneHourFee(parkingLot);
    const isAvailable = isCurrentlyAvailable(parkingLot);

    const enrichedParkingLot: ParkingLot = {
      ...parkingLot,
      latitude: hasValidCoordinates ? latitude : undefined,
      longitude: hasValidCoordinates ? longitude : undefined,
      distance,
      oneHourFee,
      isAvailable,
    };

    return NextResponse.json({ data: enrichedParkingLot });
  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

