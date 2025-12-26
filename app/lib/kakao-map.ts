// 카카오맵 유틸리티 함수

declare global {
  interface Window {
    kakao: any;
  }
}

export const loadKakaoMapScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      console.log('카카오맵이 이미 로드되어 있습니다.');
      resolve();
      return;
    }

    // 이미 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com/v2/maps/sdk.js"]'
    );
    if (existingScript) {
      console.log('카카오맵 스크립트가 이미 로드 중입니다.');
      // 스크립트 로드 완료를 기다림
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // 타임아웃 (10초)
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.kakao || !window.kakao.maps) {
          reject(new Error('카카오맵 스크립트 로드 타임아웃'));
        }
      }, 10000);
      return;
    }

    // API 키 유효성 검사
    if (!apiKey || apiKey.trim() === '') {
      reject(new Error('카카오맵 API 키가 비어있습니다.'));
      return;
    }

    // 프로토콜 명시적으로 https 사용
    const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    
    // URL이 올바른지 확인
    try {
      new URL(scriptUrl);
    } catch (e) {
      reject(new Error('스크립트 URL 형식이 올바르지 않습니다.'));
      return;
    }
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.defer = false;
    // crossOrigin 속성 제거 (스크립트 태그는 CORS 체크를 하지 않음)
    
    // 타임아웃 설정 (15초)
    const timeoutId = setTimeout(() => {
      reject(new Error('카카오맵 스크립트 로드 타임아웃 (15초)'));
    }, 15000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      try {
        if (!window.kakao || !window.kakao.maps) {
          reject(new Error('카카오맵 객체를 찾을 수 없습니다.'));
          return;
        }
        
        window.kakao.maps.load(() => {
          resolve();
        });
      } catch (error: any) {
        reject(new Error(`카카오맵 초기화 실패: ${error?.message || error}`));
      }
    };
    
    script.onerror = (_error) => {
      clearTimeout(timeoutId);
      
      // 더 자세한 에러 메시지
      const errorMessage = `
카카오맵 스크립트 로드 실패

가능한 원인:
1. 플랫폼 설정 미등록: 카카오 개발자 콘솔에서 Web 플랫폼에 http://localhost:3000 등록 필요
2. 잘못된 API 키: JavaScript 키를 사용해야 함 (REST API 키 아님)
3. 네트워크 문제: 인터넷 연결 확인

확인 사항:
- 카카오 개발자 콘솔: https://developers.kakao.com
- 앱 설정 → 플랫폼 → Web 플랫폼에 http://localhost:3000 등록
- 앱 설정 → 앱 키 → JavaScript 키 확인
      `.trim();
      
      reject(new Error(errorMessage));
    };
    
    document.head.appendChild(script);
  });
};

