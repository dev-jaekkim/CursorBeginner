# 설치 및 설정 가이드

## 1. Node.js 설치 (필수)

현재 시스템에 Node.js가 설치되어 있지 않습니다. 다음 중 하나의 방법으로 설치하세요:

### macOS (Homebrew 사용)
```bash
brew install node
```

### 공식 웹사이트에서 설치
1. [Node.js 공식 웹사이트](https://nodejs.org/) 방문
2. LTS 버전 다운로드 및 설치
3. 터미널 재시작 후 확인:
```bash
node --version
npm --version
```

## 2. 의존성 설치

Node.js 설치 후 다음 명령어를 실행하세요:

```bash
cd /Users/jaekyungkim/CursorBeginner
npm install
```

## 3. GitHub 저장소 연결

### GitHub에서 저장소 생성
1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `seoul-parking-lot`)
4. Public 또는 Private 선택
5. **"Initialize this repository with a README" 체크 해제**
6. "Create repository" 클릭

### 로컬 저장소와 연결
GitHub에서 생성한 저장소의 URL을 복사한 후 다음 명령어를 실행하세요:

```bash
# 원격 저장소 추가 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 또는 SSH를 사용하는 경우
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# 원격 저장소에 푸시
git push -u origin main
```

## 4. 환경 변수 설정

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

## 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 현재 상태

✅ Git 저장소 초기화 완료
✅ 첫 커밋 완료
⏳ Node.js 설치 필요
⏳ 의존성 설치 필요 (Node.js 설치 후)
⏳ GitHub 원격 저장소 연결 필요

