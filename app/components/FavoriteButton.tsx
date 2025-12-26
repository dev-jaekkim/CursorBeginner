'use client';

import { useState, useEffect } from 'react';

import {
  isFavorite,
  toggleFavorite,
} from '@/app/lib/favorites-utils';

interface FavoriteButtonProps {
  parkingId: number;
  onToggle?: (isFavorite: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 즐겨찾기 버튼 컴포넌트
 */
export default function FavoriteButton({
  parkingId,
  onToggle,
  size = 'md',
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(parkingId));
  }, [parkingId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소의 클릭 이벤트 방지
    const newFavorite = toggleFavorite(parkingId);
    setFavorite(newFavorite);
    if (onToggle) {
      onToggle(newFavorite);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full transition-all
        ${favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}
        hover:scale-110 active:scale-95
      `}
      aria-label={favorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}
      title={favorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}
    >
      {favorite ? '⭐' : '☆'}
    </button>
  );
}

