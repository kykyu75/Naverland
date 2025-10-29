# Vercel 배포를 위한 변경사항

## ✅ 완료된 작업

### 1. API Serverless Functions 생성
- `/api/crawl.js` - 크롤링 API
- `/api/search-keyword.js` - 키워드 검색 API

### 2. vercel.json 설정
- 정적 파일 서빙 설정
- API 라우트 설정
- 함수 타임아웃 설정 (최대 60초)

### 3. 프론트엔드 수정
- Base64 파일 다운로드 기능 추가
- 파일 목록 섹션 숨김 (Vercel에서 작동 안함)
- 클라이언트에서 엑셀 파일 생성 및 다운로드

### 4. 문서 추가
- `VERCEL_DEPLOY.md` - 배포 가이드
- `VERCEL_CHANGES.md` - 변경사항 기록

## 📝 주요 변경사항

### API 호출 방식
**이전 (로컬)**:
```javascript
// Express 서버에서 직접 파일 생성 및 저장
const fileName = await apiCrawler.saveToExcel(...);
```

**이후 (Vercel)**:
```javascript
// Serverless function에서 base64로 인코딩하여 반환
const base64File = fileBuffer.toString('base64');
return { fileData: base64File, fileName, fileType };
```

### 파일 저장 방식
**이전**: 서버 파일 시스템에 저장
**이후**: 클라이언트 메모리에서 다운로드

### 플레이브라우저 제거
Playwright는 serverless 환경에서 실행할 수 없으므로:
- ❌ Playwright 크롤링 제거
- ✅ Direct API만 사용

## 🚀 배포 방법

### 자동 배포 (GitHub 연동)
1. GitHub에 푸시
2. Vercel에서 자동 감지
3. 자동 빌드 및 배포

### 수동 배포
```bash
vercel --prod
```

## ⚠️ 주의사항

### 작동하는 기능
- ✅ Direct API 크롤링
- ✅ 키워드 검색
- ✅ 매물 데이터 수집
- ✅ 엑셀 파일 다운로드
- ✅ 실시간 데이터 미리보기

### 작동하지 않는 기능
- ❌ Playwright 브라우저 자동화
- ❌ 서버 파일 저장 및 목록 조회
- ❌ 폴더 열기

### 제한사항
- **타임아웃**: 최대 60초
- **메모리**: 최대 1GB
- **응답 크기**: 최대 50MB

## 🔧 테스트 방법

### 로컬 테스트
```bash
# Vercel CLI로 로컬 테스트
vercel dev
```

### 배포 후 테스트
1. 배포된 URL 접속
2. 단지번호 입력
3. 크롤링 시작
4. 결과 확인 및 파일 다운로드

## 📊 성능 비교

| 환경 | Playwright | Direct API | 파일 저장 |
|------|-----------|-----------|----------|
| 로컬 | ✅ | ✅ | ✅ |
| Vercel | ❌ | ✅ | ❌ (base64) |
| Render | ✅ | ✅ | ✅ |

## 🎯 다음 단계

1. GitHub에 푸시: `git push origin main`
2. Vercel에 배포
3. URL 확인 및 테스트

## 📖 관련 문서

- `VERCEL_DEPLOY.md` - 상세 배포 가이드
- `DEPLOY.md` - Render.com 등 대안 배포 방법
- `README.md` - 전체 프로젝트 설명

