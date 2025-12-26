/**
 * 에러 타입 판별 유틸리티
 */

export type ErrorType = 
  | 'network'      // 네트워크 오류
  | 'server'       // 서버 오류
  | 'not-found'    // 데이터 없음
  | 'unknown';     // 알 수 없는 오류

/**
 * 에러 메시지에서 에러 타입을 판별합니다.
 */
export function getErrorType(error: string | Error | unknown): ErrorType {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // 네트워크 오류
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('networkerror')
  ) {
    return 'network';
  }

  // 서버 오류
  if (
    lowerMessage.includes('server') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('internal server') ||
    lowerMessage.includes('서버 오류')
  ) {
    return 'server';
  }

  // 데이터 없음
  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('404') ||
    lowerMessage.includes('찾을 수 없') ||
    lowerMessage.includes('없습니다')
  ) {
    return 'not-found';
  }

  return 'unknown';
}

/**
 * 에러 메시지를 사용자 친화적으로 변환합니다.
 */
export function formatErrorMessage(error: string | Error | unknown): string {
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : String(error);
  
  // 너무 긴 에러 메시지는 축약
  if (errorMessage.length > 200) {
    return errorMessage.substring(0, 200) + '...';
  }

  return errorMessage;
}

