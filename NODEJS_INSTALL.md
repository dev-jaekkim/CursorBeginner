# Node.js 설치 가이드 (macOS)

## 방법 1: 공식 웹사이트에서 설치 (가장 쉬운 방법) ⭐ 추천

1. **Node.js 공식 웹사이트 방문**
   - https://nodejs.org/ 접속
   - 또는 직접 다운로드: https://nodejs.org/ko/download/

2. **LTS 버전 다운로드**
   - "LTS" 버전 선택 (Long Term Support, 안정적인 버전)
   - macOS Installer (.pkg) 다운로드

3. **설치 실행**
   - 다운로드한 `.pkg` 파일 더블클릭
   - 설치 마법사 따라하기
   - 기본 설정으로 설치 진행

4. **터미널 재시작**
   - 터미널을 완전히 종료하고 다시 열기
   - 또는 새 터미널 창 열기

5. **설치 확인**
   ```bash
   node --version
   npm --version
   ```
   버전 번호가 출력되면 설치 완료!

## 방법 2: Homebrew로 설치 (고급 사용자용)

### Homebrew 설치 (아직 설치 안 했다면)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Node.js 설치
```bash
brew install node
```

## 방법 3: nvm 사용 (여러 버전 관리가 필요한 경우)

### nvm 설치
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 터미널 재시작 후
```bash
nvm install --lts
nvm use --lts
```

## 설치 후 확인

터미널에서 다음 명령어로 확인하세요:

```bash
# Node.js 버전 확인
node --version
# 예상 출력: v20.x.x 또는 v18.x.x

# npm 버전 확인
npm --version
# 예상 출력: 10.x.x 또는 9.x.x
```

## 문제 해결

### 여전히 "command not found" 오류가 나는 경우

1. **터미널 완전히 재시작**
   - 모든 터미널 창 닫기
   - 새 터미널 열기

2. **PATH 확인**
   ```bash
   echo $PATH
   ```
   `/usr/local/bin` 또는 `/opt/homebrew/bin`이 포함되어 있는지 확인

3. **수동으로 PATH 추가** (필요한 경우)
   `~/.zshrc` 파일에 다음 추가:
   ```bash
   export PATH="/usr/local/bin:$PATH"
   ```
   그 다음:
   ```bash
   source ~/.zshrc
   ```

4. **설치 위치 확인**
   ```bash
   ls -la /usr/local/bin/node
   ls -la /usr/local/bin/npm
   ```
   또는
   ```bash
   ls -la /opt/homebrew/bin/node
   ls -la /opt/homebrew/bin/npm
   ```

## 설치 완료 후

Node.js 설치가 완료되면 프로젝트 디렉토리에서 다음을 실행하세요:

```bash
cd /Users/jaekyungkim/CursorBeginner
npm install
```

## 참고

- **LTS 버전**: 안정적이고 장기 지원되는 버전 (일반 사용자 추천)
- **Current 버전**: 최신 기능이 포함된 버전 (개발자용)
- 프로젝트는 Node.js 18 이상을 권장합니다.

