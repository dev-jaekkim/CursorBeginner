import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://115.84.165.40';

export async function POST(request: NextRequest) {
  try {
    // 외부 API에서 데이터 가져오기
    // 실제 API 엔드포인트는 데이터 구조를 확인한 후 수정 필요
    const response = await fetch(`${EXTERNAL_API_BASE_URL}/dataList/OA-13122/S/1/datasetView.do`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('외부 API 호출 실패');
    }

    const data = await response.json();
    
    // 데이터 가공 및 Supabase에 저장
    // 실제 데이터 구조에 맞게 파싱 필요
    const parkingLots = transformData(data);

    // 기존 데이터 삭제 후 새 데이터 삽입
    const { error: deleteError } = await supabase
      .from('parking_lots')
      .delete()
      .neq('id', 0); // 모든 데이터 삭제

    if (deleteError) {
      console.error('데이터 삭제 에러:', deleteError);
    }

    const { data: insertedData, error: insertError } = await supabase
      .from('parking_lots')
      .insert(parkingLots)
      .select();

    if (insertError) {
      console.error('데이터 삽입 에러:', insertError);
      return NextResponse.json(
        { error: '데이터 동기화 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: insertedData?.length || 0,
    });
  } catch (error) {
    console.error('동기화 에러:', error);
    return NextResponse.json(
      { error: '동기화 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 외부 API 데이터를 내부 형식으로 변환
function transformData(apiData: any): any[] {
  // TODO: 실제 API 응답 구조에 맞게 데이터 변환 로직 구현
  // 예시:
  // return apiData.map((item: any) => ({
  //   name: item.주차장명,
  //   address: item.주소,
  //   latitude: parseFloat(item.위도),
  //   longitude: parseFloat(item.경도),
  //   ...
  // }));
  
  return [];
}

