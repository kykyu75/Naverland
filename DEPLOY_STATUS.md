# Vercel 배포 상태

## 현재 배포 문제

### 증상
- 404 에러 발생

### 원인 분석
1. Vercel이 index.html을 찾지 못함
2. API 함수 경로 문제

## 해결 방법

### 1단계: 최소 구성으로 배포
```bash
git add api/ index.html package.json package-lock.json
git commit -m "Vercel deployment fix"
git push origin main
```

### 2단계: 배포 확인
- Vercel 대시보드에서 배포 상태 확인
- 로그에서 오류 메시지 확인

### 3단계: 테스트
```
https://your-app.vercel.app/api/test
```
응답:
```json
{
  "message": "API is working!",
  "timestamp": "..."
}
```

### 4단계: 메인 페이지 테스트
```
https://your-app.vercel.app/
```
HTML 페이지가 표시되어야 함

## 필요한 파일

### 배포 필수 파일
- `index.html` (루트)
- `api/crawl.js`
- `api/search-keyword.js`
- `api/test.js`
- `package.json`
- `package-lock.json`

### 선택 파일
- `README.md`
- 문서 파일들

## Vercel 대시보드 체크리스트

1. ✅ GitHub 저장소 연결됨
2. ✅ 자동 배포 활성화
3. ✅ 배포 로그 확인
4. ✅ 환경 변수 설정 (필요시)

## 디버깅 방법

### 로그 확인
```bash
# Vercel CLI 사용 (설치 필요)
npm i -g vercel
vercel login
vercel logs
```

### 로컬 테스트
```bash
# 로컬에서 Vercel 환경 시뮬레이션
npx vercel dev
```

### 브라우저 테스트
1. 메인 페이지: `https://your-app.vercel.app/`
2. 테스트 API: `https://your-app.vercel.app/api/test`
3. 크롤 API: `https://your-app.vercel.app/api/crawl`

## 예상 배포 구조

```
Naver_Write/
├── index.html              ✅ 루트에 위치
├── package.json            ✅ 의존성 정의
├── api/
│   ├── crawl.js           ✅ 크롤링 API
│   ├── search-keyword.js  ✅ 검색 API
│   └── test.js            ✅ 테스트 API
└── (기타 파일들)          ⚠️ Vercel이 자동으로 처리
```

## 추천 작업 순서

1. **GitHub에 푸시**
2. **Vercel에서 재배포**
3. **테스트 API 확인** (`/api/test`)
4. **메인 페이지 확인** (`/`)
5. **크롤링 기능 테스트**

## 문제가 계속되면

### 옵션 1: Vercel CLI로 수동 배포
```bash
npm i -g vercel
vercel
```

### 옵션 2: Render.com 사용 (대안)
- `DEPLOY.md` 참조
- Express 서버 지원
- 더 안정적

## 성공 기준

- ✅ `/api/test`가 응답함
- ✅ `/` 메인 페이지 로드됨
- ✅ `/api/crawl` API 작동함
- ✅ 엑셀 파일 다운로드 가능

