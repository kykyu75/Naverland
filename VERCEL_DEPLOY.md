# Vercel 배포 가이드

## ✅ Vercel 호환성

이 프로젝트를 Vercel에 배포할 수 있도록 수정되었습니다.

### 주요 변경사항

1. **Serverless Functions**: `/api` 폴더에 serverless functions 추가
2. **Direct API만 사용**: Playwright 브라우저 자동화는 제거됨 (serverless 환경에서 불가능)
3. **Base64 파일 전송**: 엑셀 파일을 base64로 인코딩하여 클라이언트로 전송
4. **정적 파일 서빙**: `public` 폴더의 HTML을 정적 파일로 서빙

## 📦 배포 단계

### 1단계: GitHub에 푸시

```bash
# 변경사항 추가
git add .

# 커밋
git commit -m "Vercel 호환성 수정"

# 푸시
git push origin main
```

### 2단계: Vercel에 배포

1. [Vercel](https://vercel.com) 접속
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: `.`
   - **Build Command**: (비워둠)
   - **Output Directory**: (비워둠)
5. "Deploy" 클릭

### 3단계: 배포 확인

- 배포가 완료되면 URL이 제공됩니다
- 예: `https://your-project.vercel.app`
- 브라우저에서 접속하여 테스트

## 🔧 작동 방식

### API 엔드포인트

#### 1. 크롤링 API (`/api/crawl.js`)

```javascript
POST /api/crawl
{
  "complexNo": "105389",
  "complexName": "대곡역센트럴파크",
  "method": "direct-api"
}
```

**응답:**
```javascript
{
  "success": true,
  "dataCount": 50,
  "fileName": "naver-land-대곡역센트럴파크-2025-10-29.xlsx",
  "fileData": "base64_encoded_data...",
  "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "articles": [...]
}
```

#### 2. 키워드 검색 API (`/api/search-keyword.js`)

```javascript
POST /api/search-keyword
{
  "keyword": "달서구"
}
```

**응답:**
```javascript
{
  "success": true,
  "keyword": "달서구",
  "totalCount": 100,
  "complexes": [...],
  "regions": [...]
}
```

## ⚠️ 제한사항

### Vercel에서 작동하지 않는 기능

1. **Playwright 브라우저 자동화**: serverless 환경에서 실행 불가
2. **서버 파일 저장**: `/tmp` 디렉토리만 사용 가능하며 임시적
3. **파일 목록 조회**: 서버 파일 시스템 접근 제한
4. **폴더 열기**: 로컬 환경에서만 작동

### 해결책

- **Direct API 방식 사용**: Playwright 없이 네이버 API에 직접 요청
- **Base64 파일 전송**: 생성된 엑셀 파일을 base64로 인코딩하여 클라이언트로 전송
- **클라이언트 다운로드**: 브라우저에서 직접 파일 다운로드

## 🎯 사용 방법

### 웹 인터페이스

1. 배포된 URL 접속
2. 단지번호 입력 또는 키워드 검색
3. "크롤링 시작" 버튼 클릭
4. 결과가 표시되면 엑셀 파일 다운로드

### 기능

- ✅ 단지 검색 (키워드)
- ✅ 단지번호 직접 입력
- ✅ 매물 데이터 수집
- ✅ 실시간 데이터 미리보기
- ✅ 엑셀 파일 다운로드

## 🐛 문제 해결

### 1. 배포 실패

**원인**: 의존성 설치 실패

**해결**:
```bash
# package.json 확인
# Node 버전이 18 이상인지 확인
```

### 2. API 응답 실패

**원인**: 타임아웃 (60초 초과)

**해결**:
- 큰 데이터셋을 조회하지 않음
- 페이지 수 제한

### 3. 파일 다운로드 실패

**원인**: base64 인코딩 오류

**해결**:
- 브라우저 콘솔에서 에러 확인
- 파일 크기가 너무 크면 작은 데이터셋으로 테스트

## 📊 성능

### 예상 성능

- **응답 시간**: 10-30초 (데이터 크기에 따라)
- **타임아웃**: 60초 (무료 플랜)
- **동시 요청**: 제한없음

### 최적화 팁

1. 필요한 데이터만 수집
2. 페이지 수 제한
3. 적절한 대기 시간 설정

## 🔄 업데이트

새 버전 배포:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel이 자동으로 재배포합니다.

## 📝 참고사항

- **무료 플랜**: 하루 100GB 대역폭
- **함수 실행 시간**: 최대 60초
- **콜드 스타트**: 첫 요청 시 약간의 지연 발생 (10-30초)

## 🚀 더 나은 대안

Vercel의 제약으로 인해 다음 플랫폼도 고려해보세요:

1. **Render.com** (추천)
   - Express 서버 완벽 지원
   - 무료 플랜 제공
   - Playwright 브라우저 실행 가능

2. **Railway**
   - 간단한 설정
   - 빠른 배포
   - 무료 티어 제공

3. **Fly.io**
   - 빠른 응답 속도
   - 글로벌 CDN

자세한 내용은 `DEPLOY.md`를 참조하세요.

