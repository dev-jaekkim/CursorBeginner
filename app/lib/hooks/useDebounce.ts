import { useState, useEffect } from 'react';

/**
 * Debounce 훅
 * 연속된 값 변경 중 마지막 값만 반환합니다.
 * 
 * @param value - debounce할 값
 * @param delay - 대기 시간 (밀리초, 기본값: 500ms)
 * @returns debounce된 값
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // debouncedSearchTerm이 변경될 때만 실행
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 시간 후에 값 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 값이 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

