# 서울시 공영주차장 안내정보 웹 애플리케이션

서울시 공영주차장 정보를 카카오맵에 표시하는 웹 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: React
- **스타일링**: Tailwind CSS
- **지도**: 카카오맵 API
- **데이터베이스**: Supabase (PostgreSQL)
- **배포**: Vercel (권장)

## 시작하기

### 1. 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone https://github.com/dev-jaekkim/CursorBeginner.git
cd CursorBeginner

# 의존성 설치
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
cp .env.example .env.local
```

`.env.local` 파일에 다음 정보를 입력하세요:

- **Supabase**: [Supabase](https://app.supabase.com)에서 프로젝트를 생성하고 URL과 API 키를 가져오세요
- **카카오맵 API**: [카카오 개발자 콘솔](https://developers.kakao.com)에서 JavaScript 키를 발급받으세요

### 3. Supabase 데이터베이스 설정

Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행하세요:

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

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
CursorBeginner/
├── app/
│   ├── api/              # API Routes
│   ├── components/       # React 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   ├── layout.tsx        # 레이아웃
│   └── page.tsx          # 메인 페이지
├── public/               # 정적 파일
├── .env.example          # 환경 변수 예시
├── .gitignore
├── package.json
└── README.md
```

## 주요 기능

- 🗺️ 카카오맵에 서울시 공영주차장 위치 표시
- 📍 마커 클릭 시 주차장 상세 정보 표시
- 🔍 주차장 검색 기능
- 📱 반응형 디자인

## 배포

### Vercel에 배포하기

1. [Vercel](https://vercel.com)에 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정 (Vercel 대시보드에서)
4. 자동 배포 완료

### 환경 변수 설정 (배포 시)

Vercel 대시보드의 프로젝트 설정에서 다음 환경 변수를 추가하세요:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
- `EXTERNAL_API_BASE_URL`

## 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

## 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [카카오맵 API 문서](https://apis.map.kakao.com)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
