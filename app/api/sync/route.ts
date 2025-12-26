import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/app/lib/supabase';

import type { ParkingLot } from '@/app/lib/types';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'http://115.84.165.40';

export async function POST(_request: NextRequest) {
  try {
    const apiUrl = `${EXTERNAL_API_BASE_URL}/dataList/OA-13122/S/1/datasetView.do`;
    console.log('=== 외부 API 호출 시작 ===');
    console.log('API URL:', apiUrl);
    console.log('EXTERNAL_API_BASE_URL:', EXTERNAL_API_BASE_URL);
    
    // 외부 API에서 데이터 가져오기
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        // 타임아웃 설정 (30초)
        signal: AbortSignal.timeout(30000),
        // SSL 검증 우회 (개발 환경에서만, 프로덕션에서는 사용하지 마세요)
        // @ts-expect-error - SSL 검증 우회 옵션
        rejectUnauthorized: false,
      });
    } catch (fetchError: any) {
      console.error('❌ Fetch 요청 실패');
      console.error('에러 타입:', fetchError?.constructor?.name);
      console.error('에러 메시지:', fetchError?.message);
      console.error('에러 코드:', fetchError?.code);
      console.error('전체 에러:', fetchError);
      
      // 네트워크 에러인지 확인
      if (fetchError?.message?.includes('fetch failed') || fetchError?.code === 'ECONNREFUSED') {
        throw new Error(
          `외부 API 서버에 연결할 수 없습니다. URL을 확인하세요: ${apiUrl}`
        );
      }
      
      throw fetchError;
    }

    console.log('✅ API 응답 받음');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '응답 본문을 읽을 수 없음');
      console.error('❌ API 호출 실패');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('응답 본문 (처음 500자):', errorText.substring(0, 500));
      
      throw new Error(
        `외부 API 호출 실패: ${response.status} ${response.statusText}. 응답: ${errorText.substring(0, 200)}`
      );
    }

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    console.log('응답 Content-Type:', contentType);
    
    if (!contentType?.includes('application/json')) {
      // JSON이 아닌 경우 텍스트로 파싱 시도
      const text = await response.text();
      console.warn('⚠️ 응답이 JSON이 아닙니다. Content-Type:', contentType);
      console.warn('응답 내용 (처음 500자):', text.substring(0, 500));
      
      // HTML 응답인 경우 (에러 페이지일 수 있음)
      if (contentType?.includes('text/html')) {
        console.error('❌ HTML 응답을 받았습니다. API 엔드포인트가 올바른지 확인하세요.');
        throw new Error('API가 HTML을 반환했습니다. 엔드포인트를 확인하세요.');
      }
      
      throw new Error(`API 응답이 JSON 형식이 아닙니다. Content-Type: ${contentType}`);
    }

    const data = await response.json();
    console.log('✅ API 응답 받음');
    console.log('API 응답 구조 (처음 1000자):', JSON.stringify(data).substring(0, 1000));
    console.log('API 응답 키:', Object.keys(data));

    // 데이터 가공 및 Supabase에 저장
    const parkingLots = transformData(data);

    if (parkingLots.length === 0) {
      return NextResponse.json(
        { error: '변환된 데이터가 없습니다', dataStructure: data },
        { status: 400 }
      );
    }

    // 기존 데이터 삭제 후 새 데이터 삽입
    const { error: deleteError } = await supabase
      .from('parking_lots')
      .delete()
      .neq('id', 0); // 모든 데이터 삭제

    if (deleteError) {
      console.error('데이터 삭제 에러:', deleteError);
      // 삭제 실패해도 계속 진행 (새 데이터 삽입 시도)
    }

    const { data: insertedData, error: insertError } = await supabase
      .from('parking_lots')
      .insert(parkingLots)
      .select();

    if (insertError) {
      console.error('데이터 삽입 에러:', insertError);
      return NextResponse.json(
        {
          error: '데이터 동기화 실패',
          details: insertError.message,
          sampleData: parkingLots.slice(0, 2), // 디버깅용 샘플 데이터
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: insertedData?.length || 0,
      message: `${insertedData?.length || 0}개의 주차장 데이터가 동기화되었습니다.`,
    });
  } catch (error) {
    console.error('=== 동기화 에러 발생 ===');
    console.error('에러 타입:', error?.constructor?.name);
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
    console.error('에러 스택:', error instanceof Error ? error.stack : '스택 없음');
    console.error('전체 에러 객체:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

    return NextResponse.json(
      {
        error: '동기화 중 오류가 발생했습니다.',
        details: errorMessage,
        errorType: error?.constructor?.name || 'Unknown',
      },
      { status: 500 }
    );
  }
}

/**
 * 외부 API 데이터를 내부 형식으로 변환
 * 다양한 API 응답 구조를 처리할 수 있도록 유연하게 구현
 */
function transformData(apiData: any): ParkingLot[] {
  try {
    // API 응답 구조에 따라 데이터 배열 추출
    let items: any[] = [];

    // 다양한 응답 구조 처리
    if (Array.isArray(apiData)) {
      items = apiData;
    } else if (apiData?.data && Array.isArray(apiData.data)) {
      items = apiData.data;
    } else if (apiData?.result && Array.isArray(apiData.result)) {
      items = apiData.result;
    } else if (apiData?.list && Array.isArray(apiData.list)) {
      items = apiData.list;
    } else if (apiData?.items && Array.isArray(apiData.items)) {
      items = apiData.items;
    } else if (apiData?.response?.body?.items) {
      // 공공데이터 API 형식
      items = Array.isArray(apiData.response.body.items)
        ? apiData.response.body.items
        : apiData.response.body.items.item
        ? Array.isArray(apiData.response.body.items.item)
          ? apiData.response.body.items.item
          : [apiData.response.body.items.item]
        : [];
    } else {
      console.warn('알 수 없는 API 응답 구조:', Object.keys(apiData));
      return [];
    }

    if (items.length === 0) {
      console.warn('변환할 데이터가 없습니다.');
      return [];
    }

    // 첫 번째 아이템의 구조 확인 (디버깅용)
    console.log('샘플 데이터 구조:', JSON.stringify(items[0]).substring(0, 300));

    // 데이터 변환
    const parkingLots: ParkingLot[] = items
      .map((item: any, index: number) => {
        try {
          // 다양한 필드명 패턴 처리
          const name =
            item.주차장명 ||
            item.name ||
            item.주차장이름 ||
            item.parkingName ||
            item.PARKING_NAME ||
            '';

          const address =
            item.주소 ||
            item.address ||
            item.ADDRESS ||
            item.소재지지번주소 ||
            '';

          // 위도/경도 파싱 (다양한 필드명 처리)
          const latStr =
            item.위도 ||
            item.latitude ||
            item.LAT ||
            item.LATITUDE ||
            item.위도좌표 ||
            '';
          const lngStr =
            item.경도 ||
            item.longitude ||
            item.LNG ||
            item.LONGITUDE ||
            item.경도좌표 ||
            '';

          const latitude = latStr ? parseFloat(String(latStr)) : undefined;
          const longitude = lngStr ? parseFloat(String(lngStr)) : undefined;

          // 유효한 좌표인지 확인
          if (
            latitude !== undefined &&
            (isNaN(latitude) || latitude < -90 || latitude > 90)
          ) {
            console.warn(`잘못된 위도: ${latStr} (인덱스: ${index})`);
          }
          if (
            longitude !== undefined &&
            (isNaN(longitude) || longitude < -180 || longitude > 180)
          ) {
            console.warn(`잘못된 경도: ${lngStr} (인덱스: ${index})`);
          }

          // 주차 대수 파싱
          const capacityStr =
            item.주차가능대수 ||
            item.capacity ||
            item.CAPACITY ||
            item.주차대수 ||
            '';
          const capacity = capacityStr
            ? parseInt(String(capacityStr), 10)
            : undefined;

          // 운영 시간
          const operatingHours =
            item.운영시간 ||
            item.operatingHours ||
            item.OPERATING_HOURS ||
            item.운영시간정보 ||
            '';

          // 요금 정보
          const feeInfo =
            item.요금정보 ||
            item.feeInfo ||
            item.FEE_INFO ||
            item.주차요금 ||
            item.요금 ||
            '';

          // 전화번호
          const phone =
            item.전화번호 ||
            item.phone ||
            item.PHONE ||
            item.연락처 ||
            '';

          // 필수 필드 검증
          if (!name || name.trim() === '') {
            console.warn(`이름이 없는 항목 건너뜀 (인덱스: ${index})`);
            return null;
          }

          return {
            name: name.trim(),
            address: address?.trim() || undefined,
            latitude: latitude && !isNaN(latitude) ? latitude : undefined,
            longitude:
              longitude && !isNaN(longitude) ? longitude : undefined,
            capacity: capacity && !isNaN(capacity) ? capacity : undefined,
            operating_hours: operatingHours?.trim() || undefined,
            fee_info: feeInfo?.trim() || undefined,
            phone: phone?.trim() || undefined,
          } as ParkingLot;
        } catch (error) {
          console.error(`데이터 변환 실패 (인덱스: ${index}):`, error);
          return null;
        }
      })
      .filter((item): item is ParkingLot => item !== null);

    console.log(
      `변환 완료: ${items.length}개 중 ${parkingLots.length}개 성공`
    );

    return parkingLots;
  } catch (error) {
    console.error('데이터 변환 중 오류:', error);
    return [];
  }
}

