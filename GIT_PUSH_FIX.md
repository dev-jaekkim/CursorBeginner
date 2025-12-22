# Git Push 문제 해결 가이드

## 문제: "could not read Username for 'https://github.com'"

이 오류는 GitHub 인증 문제입니다. 다음 중 하나의 방법으로 해결할 수 있습니다.

## 해결 방법 1: Personal Access Token 사용 (추천) ⭐

### 1. GitHub Personal Access Token 생성
1. GitHub에 로그인
2. 우측 상단 프로필 클릭 → **Settings**
3. 왼쪽 메뉴에서 **Developer settings** 클릭
4. **Personal access tokens** → **Tokens (classic)** 클릭
5. **Generate new token** → **Generate new token (classic)** 클릭
6. Note: "CursorBeginner Project" (원하는 이름)
7. Expiration: 원하는 기간 선택
8. Scopes: **repo** 체크 (전체 체크)
9. **Generate token** 클릭
10. **토큰을 복사** (한 번만 보여줌!)

### 2. Push 시 토큰 사용
```bash
git push -u origin main
```

사용자 이름: `dev-jaekkim` (또는 본인의 GitHub 사용자명)
비밀번호: **복사한 Personal Access Token** (비밀번호가 아님!)

## 해결 방법 2: SSH 키 사용 (더 편리함) ⭐⭐

### 1. SSH 키 생성 (이미 있다면 생략)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
엔터를 여러 번 눌러 기본 설정 사용

### 2. SSH 키를 GitHub에 추가
```bash
# 공개 키 복사
cat ~/.ssh/id_ed25519.pub
# 또는
cat ~/.ssh/id_rsa.pub
```

1. GitHub → Settings → **SSH and GPG keys**
2. **New SSH key** 클릭
3. Title: "MacBook" (원하는 이름)
4. Key: 복사한 공개 키 붙여넣기
5. **Add SSH key** 클릭

### 3. 원격 저장소를 SSH로 변경
```bash
git remote set-url origin git@github.com:dev-jaekkim/CursorBeginner.git
```

### 4. Push 시도
```bash
git push -u origin main
```

## 해결 방법 3: GitHub CLI 사용

### 1. GitHub CLI 설치
```bash
brew install gh
```

### 2. 로그인
```bash
gh auth login
```

### 3. Push
```bash
git push -u origin main
```

## 해결 방법 4: Git Credential Helper 사용

### macOS Keychain 사용
```bash
git config --global credential.helper osxkeychain
```

그 다음 push 시도:
```bash
git push -u origin main
```

사용자 이름과 토큰을 입력하면 Keychain에 저장됩니다.

## 빠른 해결 (가장 쉬운 방법)

1. **Personal Access Token 생성** (위의 방법 1 참고)
2. Push 시도:
   ```bash
   git push -u origin main
   ```
3. 사용자 이름: `dev-jaekkim`
4. 비밀번호: **Personal Access Token** (복사한 토큰)

## 현재 상태

✅ 원격 저장소 설정 완료: `https://github.com/dev-jaekkim/CursorBeginner.git`
✅ 커밋 완료
⏳ GitHub 인증 필요

## 참고

- Personal Access Token은 비밀번호처럼 사용하되, **절대 공유하지 마세요**
- SSH 키를 사용하면 매번 토큰을 입력할 필요가 없어 더 편리합니다
- GitHub는 2021년 8월부터 비밀번호 인증을 중단했으므로 Personal Access Token이 필요합니다

