# 🚀 Railway 배포 가이드

네이버 부동산 크롤러를 Railway에 배포하는 완전한 가이드입니다.

## 📋 사전 준비

### 필요 사항
- ✅ GitHub 계정
- ✅ Railway 계정
- ✅ 프로젝트 코드가 준비되어 있음

---

## 1️⃣ Git 초기화 및 GitHub 업로드

### Step 1: Git 초기화

PowerShell을 열고 프로젝트 폴더로 이동:

```powershell
cd D:\Naver_Write
```

Git 저장소 초기화:

```powershell
git init
```

### Step 2: 파일 추가 및 커밋

```powershell
git add .
git commit -m "Railway 배포 준비"
```

### Step 3: GitHub에 새 저장소 생성

1. https://github.com 접속
2. 로그인
3. 오른쪽 위 **"+"** 클릭 → **"New repository"** 선택
4. 저장소 이름 입력 (예: `naver-crawler`)
5. **"Create repository"** 클릭

### Step 4: GitHub에 푸시

GitHub에서 생성한 저장소 페이지에서 표시되는 명령어를 사용하거나:

```powershell
# GitHub 연결 (URL은 실제 저장소 주소로 변경)
git remote add origin https://github.com/사용자명/저장소명.git

# 브랜치 이름 변경
git branch -M main

# 푸시
git push -u origin main
```

**성공 메시지 예시:**
```
Enumerating objects: 123, done.
...
To https://github.com/사용자명/naver-crawler.git
 * [new branch]      main -> main
```

---

## 2️⃣ Railway 계정 생성 및 프로젝트 생성

### Step 1: Railway 가입

1. https://railway.app 접속
2. **"Login"** 또는 **"Get Started"** 클릭
3. **"Continue with GitHub"** 선택
4. GitHub 계정 로그인

### Step 2: 새 프로젝트 생성

1. Railway 대시보드에서 **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. GitHub 저장소 목록에서 방금 만든 저장소 선택
4. **"Deploy Now"** 클릭

### Step 3: 배포 진행

- Railway가 자동으로 코드를 빌드하고 배포합니다
- 약 5-10분 정도 소요됩니다
- 배포가 시작되면 로그가 실시간으로 표시됩니다

---

## 3️⃣ 도메인 설정 및 확인

### Step 1: 공개 URL 생성

1. 배포 완료 후 프로젝트 화면에서 **"Settings"** 탭 클릭
2. 아래로 스크롤하여 **"Network"** 섹션 확인
3. **"Generate Domain"** 클릭
4. 공개 URL 생성 완료!

**예시 URL:**
```
https://naver-crawler-production.up.railway.app
```

### Step 2: 서비스 확인

1. 생성된 URL 클릭 또는 복사
2. 브라우저에서 열기
3. 네이버 부동산 크롤러가 정상 작동하는지 확인

---

## 4️⃣ 환경 변수 설정 (선택사항)

### 설정 방법

1. Railway 프로젝트에서 **"Variables"** 탭 클릭
2. **"New Variable"** 클릭
3. 필요에 따라 환경 변수 추가:

```
NODE_ENV=production
PORT=3000
```

### 현재는 기본 설정으로도 작동합니다!

---

## 5️⃣ 자동 배포 설정

### GitHub 변경사항 자동 반영

Railway는 GitHub의 `main` 브랜치에 푸시할 때마다 자동으로 재배포합니다.

```powershell
# 로컬에서 변경사항이 있다면
git add .
git commit -m "업데이트 내용"
git push
```

→ Railway가 자동으로 재배포합니다!

---

## 🔍 배포 상태 확인

### 로그 확인

1. Railway 프로젝트에서 **"Deployments"** 탭 클릭
2. 최신 배포의 **"View Logs"** 클릭
3. 실시간 로그 확인 가능

### 성공적인 배포 로그 예시:

```
==> Downloading buildpack
==> Node.js version: 18.x
==> Installing dependencies
==> npm install
==> Building application
==> Starting web server
🌐 네이버 부동산 크롤러 웹 서버가 시작되었습니다!
📱 브라우저에서 http://localhost:3000 를 열어주세요
```

---

## 🆘 문제 해결

### 1. 빌드 실패

**문제:** Playwright 설치 오류
**해결:** railway.json이 자동으로 설정합니다. 문제가 있다면:

```json
// railway.json 확인
{
  "deploy": {
    "startCommand": "npm run web"
  }
}
```

### 2. 배포 후 접속 안 됨

**확인사항:**
- 도메인이 제대로 생성되었는지 확인
- HealthcheckPath가 "/"로 설정되어 있는지 확인
- 포트가 환경변수 `PORT`를 사용하는지 확인 (web-server.js에서 자동 설정)

### 3. 메모리 부족

**해결:** Railway에서:
1. **"Settings"** → **"Resources"**
2. 메모리를 512MB → 1GB로 증가
3. 다시 배포

---

## 📊 배포 완료 후

### 접속 주소
- **공개 URL**: `https://프로젝트명-production.up.railway.app`
- 어디서든 이 주소로 접속하면 네이버 부동산 크롤러를 사용할 수 있습니다!

### 사용 방법
1. 브라우저에서 URL 열기
2. 단지번호 입력
3. 크롤링 시작
4. 엑셀 파일 다운로드

---

## 💰 비용 정보

### Railway 무료 플랜
- **$5 무료 크레딧 제공** (신규 사용자)
- 월 500시간 무료 실행 (소규모 사용 충분)
- 무료 크레딧 소진 후: $5/월

### 추정 비용
- **유휴 상태**: $0 (완전 무료)
- **월 100시간 사용**: 약 $1-2
- **전체 시간 사용**: $5/월

---

## ✅ 배포 체크리스트

배포 전 확인사항:

- [x] Git 저장소 초기화 완료
- [x] GitHub에 코드 업로드 완료
- [x] Railway 계정 생성 완료
- [x] 프로젝트 배포 시작
- [x] 도메인 생성 완료
- [x] 서비스 정상 접속 확인

---

## 🎉 완료!

축하합니다! 이제 전 세계 어디서나 네이버 부동산 크롤러를 사용할 수 있습니다.

**공유 방법:**
```
친구에게 URL만 보내주면 됩니다!
https://naver-crawler-production.up.railway.app
```

더 궁금한 점이 있으시면 언제든 질문해주세요!

