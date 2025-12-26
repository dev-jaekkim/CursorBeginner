/**
 * 주소를 좌표로 변환하는 유틸리티 (카카오맵 Geocoding API 사용)
 */

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

/**
 * 카카오맵 Geocoding API를 사용하여 주소를 좌표로 변환
 * @param address 주소
 * @returns 좌표 또는 null
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  // Geocoding API는 REST API 키가 필요합니다 (JavaScript 키 아님)
  // 서버 사이드에서만 사용하므로 NEXT_PUBLIC_ 접두사 없음
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  
  // REST API 키가 없으면 JavaScript 키로 대체 시도 (하위 호환성)
  const apiKey = restApiKey || process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  if (!apiKey || !address || !address.trim()) {
    if (!restApiKey) {
      console.warn('Geocoding API: REST API 키가 설정되지 않았습니다. KAKAO_REST_API_KEY 환경 변수를 설정해주세요.');
    }
    return null;
  }

  try {
    // 카카오맵 Geocoding API 호출
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `Geocoding API 오류: ${response.status} ${response.statusText}`,
        address,
        errorText.substring(0, 200)
      );
      
      // 401 또는 403 에러인 경우 API 키 문제일 가능성
      if (response.status === 401 || response.status === 403) {
        console.error(
          '⚠️ Geocoding API 인증 실패. REST API 키를 확인해주세요.\n' +
          '카카오 개발자 콘솔 → 앱 설정 → 앱 키 → REST API 키를 복사하여\n' +
          '.env.local 파일에 KAKAO_REST_API_KEY=your_rest_api_key 형식으로 추가하세요.'
        );
      }
      
      return null;
    }

    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      const firstResult = data.documents[0];
      return {
        latitude: parseFloat(firstResult.y), // 위도
        longitude: parseFloat(firstResult.x), // 경도
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding 오류:', error);
    return null;
  }
}

/**
 * 여러 주소를 일괄 변환 (배치 처리)
 * @param addresses 주소 배열
 * @returns 좌표 맵 (주소 -> 좌표)
 */
export async function geocodeAddresses(
  addresses: string[]
): Promise<Map<string, GeocodingResult>> {
  const results = new Map<string, GeocodingResult>();

  // 동시 요청 제한 (카카오맵 API 제한 고려)
  const batchSize = 5;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const promises = batch.map(async (address) => {
      const coords = await geocodeAddress(address);
      if (coords) {
        results.set(address, coords);
      }
      // API 제한을 고려한 딜레이
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    await Promise.all(promises);
  }

  return results;
}

