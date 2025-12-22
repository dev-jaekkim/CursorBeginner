import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import type { ParkingLot } from '@/app/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const search = searchParams.get('search');

    let query = supabase.from('parking_lots').select('*');

    // 검색어 필터
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // 위치 기반 필터 (간단한 버전, 실제로는 더 정교한 계산 필요)
    if (lat && lng && radius) {
      // TODO: 반경 계산 로직 구현
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Supabase 에러:', error);
      return NextResponse.json(
        { error: '데이터 조회 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

