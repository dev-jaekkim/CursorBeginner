# GitHub 저장소 연결 가이드

## 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `seoul-parking-lot`)
4. Public 또는 Private 선택
5. **"Initialize this repository with a README" 체크 해제** (이미 README.md가 있음)
6. "Create repository" 클릭

## 2. 로컬 Git 저장소 초기화 및 연결

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/jaekyungkim/CursorBeginner

# Git 저장소 초기화
git init

# 기본 브랜치를 main으로 변경 (선택사항)
git branch -M main

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 서울시 공영주차장 안내 웹 애플리케이션"

# GitHub 저장소 연결 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 원격 저장소에 푸시
git push -u origin main
```

## 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 카카오맵 API 키
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key

# 외부 API 설정
EXTERNAL_API_BASE_URL=http://115.84.165.40
```

**중요**: `.env.local` 파일은 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다.

## 4. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

## 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

