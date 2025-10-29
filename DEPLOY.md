# 배포 가이드

## 🚫 Vercel 배포 제한사항

이 프로젝트는 **Express 서버**와 **Playwright 브라우저 자동화**를 사용하기 때문에, Vercel의 serverless 환경에서는 제대로 작동하지 않습니다.

### Vercel 문제점:
- ❌ Playwright 브라우저는 serverless 환경에서 실행 불가
- ❌ Express 서버는 지속적으로 실행되어야 함
- ❌ 파일 시스템 접근이 제한적
- ❌ API 요청 타임아웃 (최대 60초)

## ✅ 추천 배포 방법: Render.com

### Render.com 장점:
- ✅ Express 서버 완벽 지원
- ✅ 지속적으로 실행되는 서버
- ✅ Playwright 브라우저 지원
- ✅ 무료 플랜 제공
- ✅ GitHub 연동 자동 배포

## 📦 Render.com 배포 단계

### 1단계: GitHub에 푸시
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2단계: Render.com 가입
1. [Render.com](https://render.com) 방문
2. "Get Started for Free" 클릭
3. GitHub 계정으로 로그인

### 3단계: 새 Web Service 생성
1. Dashboard에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 선택
4. 설정 입력:
   - **Name**: naver-land-crawler
   - **Region**: Singapore (또는 가장 가까운 지역)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run web`
   - **Plan**: Free

5. "Create Web Service" 클릭

### 4단계: 환경 변수 설정 (선택사항)
```bash
NODE_ENV=production
```

### 5단계: 배포 완료
- Render.com이 자동으로 빌드하고 배포합니다
- 완료되면 `https://your-app.onrender.com` URL이 생성됩니다

## 🎯 배포 후 확인
1. 브라우저에서 제공된 URL 접속
2. 페이지가 정상적으로 로드되는지 확인
3. 크롤링 기능 테스트

## 🔧 문제 해결

### 포트 설정
Render.com은 자동으로 `PORT` 환경변수를 제공하므로 현재 코드는 자동으로 감지합니다.

### 플레이라이트 설치
Playwright 브라우저가 서버에 자동 설치됩니다. 첫 실행 시 약간의 시간이 걸릴 수 있습니다.

### 빌드 실패
- `package.json`에 필요한 의존성이 모두 포함되어 있는지 확인
- Node 버전이 18 이상인지 확인

## 📝 참고사항

### 무료 플랜 제한
- 15분간 요청이 없으면 서버가 sleep 상태로 전환
- 첫 요청 시 약 30초 정도 깨어나는데 시간이 걸릴 수 있음
- 항상 실행하려면 유료 플랜 필요 ($7/월)

### 대안 플랫폼
1. **Railway**: 간단한 설정, 좋은 무료 티어
2. **Fly.io**: 빠른 응답 속도
3. **DigitalOcean App Platform**: 안정적인 성능
4. **Heroku**: 검증된 플랫폼

## 🔄 업데이트 배포
GitHub에 푸시하면 Render.com이 자동으로 재배포합니다:
```bash
git add .
git commit -m "Update features"
git push origin main
```

