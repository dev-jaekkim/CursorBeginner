# 서울시 공영주차장 안내정보 웹 애플리케이션 설계

## 프로젝트 개요
서울시 공영주차장 정보를 카카오맵에 표시하는 웹 애플리케이션

## 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: React
- **스타일링**: Tailwind CSS
- **지도**: 카카오맵 API
- **데이터베이스**: Supabase (PostgreSQL)
- **배포**: 클라우드 플랫폼 (Vercel, AWS 등)

## 아키텍처 설계

### 1. 데이터 흐름
```
외부 API (115.84.165.40)
    ↓
Next.js API Route (프록시/캐싱)
    ↓
Supabase (데이터 저장/캐싱)
    ↓
프론트엔드 (카카오맵 표시)
```

### 2. 클라우드와 Supabase가 필요한 이유

#### 클라우드 프리티어가 필요한 이유:
1. **CORS 문제 해결**: 외부 API를 브라우저에서 직접 호출하면 CORS 에러 발생 가능
2. **API 프록시 서버**: Next.js API Routes를 클라우드에 배포하여 프록시 역할
3. **환경 변수 관리**: API 키 등 민감한 정보를 안전하게 관리
4. **무료 호스팅**: Vercel 등은 Next.js 프로젝트를 무료로 호스팅 제공

#### Supabase가 필요한 이유:
1. **데이터 캐싱**: 외부 API 호출을 최소화하여 성능 향상
2. **데이터 가공**: 원본 데이터를 가공하여 저장 (검색 최적화 등)
3. **실시간 업데이트**: 주기적으로 데이터를 동기화
4. **사용자 기능 확장**: 나중에 즐겨찾기, 리뷰 등 기능 추가 가능
5. **무료 티어**: PostgreSQL 데이터베이스를 무료로 제공

**대안**: Supabase 없이도 Next.js API Routes에서 직접 외부 API를 호출하고 캐싱할 수 있지만, 데이터베이스가 있으면 더 유연한 확장이 가능합니다.

## 프로젝트 구조

```
CursorBeginner/
├── app/
│   ├── api/
│   │   ├── parking/route.ts          # 주차장 데이터 API
│   │   └── sync/route.ts              # 데이터 동기화 API
│   ├── components/
│   │   ├── Map.tsx                    # 카카오맵 컴포넌트
│   │   ├── Marker.tsx                 # 마커 컴포넌트
│   │   ├── ParkingList.tsx            # 주차장 리스트
│   │   └── ParkingInfo.tsx            # 주차장 상세 정보
│   ├── lib/
│   │   ├── supabase.ts                # Supabase 클라이언트
│   │   ├── kakao-map.ts               # 카카오맵 유틸리티
│   │   └── types.ts                   # TypeScript 타입 정의
│   ├── layout.tsx
│   └── page.tsx                       # 메인 페이지
├── public/
├── .env.local                         # 환경 변수
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 주요 기능

### 1. 데이터 수집
- 외부 API에서 주차장 데이터 가져오기
- 주기적으로 데이터 동기화 (선택사항)

### 2. 지도 표시
- 카카오맵 초기화
- 주차장 위치에 마커 표시
- 마커 클릭 시 상세 정보 표시

### 3. 주차장 정보
- 주차장 이름, 주소, 운영 시간
- 주차 가능 대수
- 요금 정보
- 전화번호 등

## 데이터베이스 스키마 (Supabase)

```sql
-- 주차장 정보 테이블
CREATE TABLE parking_lots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  operating_hours VARCHAR(100),
  fee_info TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_parking_lots_location ON parking_lots(latitude, longitude);
CREATE INDEX idx_parking_lots_name ON parking_lots(name);
```

## API 설계

### GET /api/parking
주차장 목록 조회
- Query Parameters:
  - `lat`: 위도 (선택)
  - `lng`: 경도 (선택)
  - `radius`: 반경 (선택, km)
  - `search`: 검색어 (선택)

### GET /api/parking/[id]
특정 주차장 정보 조회

### POST /api/sync
외부 API에서 데이터 동기화 (관리자용)

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 카카오맵
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key

# 외부 API
EXTERNAL_API_BASE_URL=http://115.84.165.40
```

## 구현 단계

1. **프로젝트 초기 설정**
   - Next.js 프로젝트 생성
   - TypeScript, Tailwind CSS 설정
   - 필요한 패키지 설치

2. **Supabase 설정**
   - Supabase 프로젝트 생성
   - 데이터베이스 스키마 생성
   - 환경 변수 설정

3. **API 구현**
   - 외부 API 연동
   - 데이터 동기화 로직
   - API Routes 구현

4. **카카오맵 연동**
   - 카카오맵 API 키 발급
   - 지도 컴포넌트 구현
   - 마커 표시 로직

5. **UI 구현**
   - 메인 페이지 레이아웃
   - 주차장 리스트 컴포넌트
   - 상세 정보 모달/사이드바

6. **배포**
   - Vercel 또는 다른 클라우드 플랫폼에 배포
   - 환경 변수 설정

## GitHub 배포 고려사항

### 보안 주의사항
1. **환경 변수 파일 제외**: `.env.local`, `.env` 등은 절대 커밋하지 않음
2. **.gitignore 설정**: 민감한 정보가 포함된 파일들을 제외
3. **환경 변수 템플릿**: `.env.example` 파일을 제공하여 필요한 환경 변수 명시
4. **README 작성**: 프로젝트 설정 방법과 환경 변수 설정 가이드 포함

### GitHub Actions (선택사항)
- 자동 배포 파이프라인 설정
- 테스트 자동화
- 코드 품질 검사

## 선택사항 고려사항

### Supabase 없이 구현하는 경우:
- Next.js API Routes에서 직접 외부 API 호출
- 메모리 캐싱 또는 Redis 사용
- 더 간단하지만 확장성은 낮음

### 클라우드 없이 로컬 개발만 하는 경우:
- `next dev`로 로컬 개발 가능
- 배포 시에만 클라우드 필요

