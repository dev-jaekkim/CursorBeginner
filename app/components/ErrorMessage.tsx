'use client';

export type ErrorType = 
  | 'network'      // 네트워크 오류
  | 'server'       // 서버 오류
  | 'not-found'    // 데이터 없음
  | 'unknown';     // 알 수 없는 오류

interface ErrorMessageProps {
  error: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  onReload?: () => void;
}

/**
 * 에러 메시지 컴포넌트
 * 에러 타입에 따라 다른 UI를 표시합니다.
 */
export default function ErrorMessage({
  error,
  errorType = 'unknown',
  onRetry,
  onReload,
}: ErrorMessageProps) {
  const errorConfig = {
    network: {
      icon: '📡',
      title: '네트워크 연결 오류',
      description: '인터넷 연결을 확인해주세요.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    server: {
      icon: '⚠️',
      title: '서버 오류',
      description: '서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    'not-found': {
      icon: '🔍',
      title: '데이터를 찾을 수 없습니다',
      description: '요청하신 정보를 찾을 수 없습니다.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    unknown: {
      icon: '❌',
      title: '오류가 발생했습니다',
      description: '예상치 못한 오류가 발생했습니다.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
  };

  const config = errorConfig[errorType];

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className={`text-center max-w-md p-6 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}>
        <div className="text-6xl mb-4">{config.icon}</div>
        <h3 className={`text-lg font-semibold ${config.color} mb-2`}>
          {config.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{config.description}</p>
        
        {/* 상세 에러 메시지 */}
        <div className="mb-4 p-3 bg-white rounded border border-gray-200">
          <p className="text-xs text-gray-500 font-mono break-words">
            {error}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`px-6 py-2 ${config.color.replace('text-', 'bg-').replace('-600', '-500')} text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm`}
            >
              다시 시도
            </button>
          )}
          {onReload && (
            <button
              onClick={onReload}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              페이지 새로고침
            </button>
          )}
          {!onRetry && !onReload && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
            >
              새로고침
            </button>
          )}
        </div>

        {/* 도움말 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            문제가 계속되면 브라우저를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

