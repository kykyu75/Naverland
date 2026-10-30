# Render.com 배포 가이드

## 📋 사전 준비

### 1. GitHub 저장소 준비
- 현재 프로젝트를 GitHub에 푸시
- 저장소는 Public 또는 Private 모두 가능

### 2. Render.com 계정
- https://render.com 에서 무료 계정 생성
- GitHub 계정으로 로그인 권장

## 🚀 배포 단계

### Step 1: Render 대시보드 접속
1. https://dashboard.render.com 접속
2. "New +" 버튼 클릭
3. "Web Service" 선택

### Step 2: GitHub 저장소 연결
1. "Connect a repository" 선택
2. GitHub 계정 연결 (처음인 경우)
3. 배포할 저장소 선택: `Naver_Write`

### Step 3: 서비스 설정

**기본 설정:**
- **Name**: `naver-land-crawler` (원하는 이름)
- **Region**: `Singapore` (한국과 가장 가까움)
- **Branch**: `main` (또는 `master`)
- **Root Directory**: 비워두기
- **Runtime**: `Node`

**빌드 설정:**
- **Build Command**: 
  ```bash
  npm install
  ```

- **Start Command**:
  ```bash
  node web-server.js
  ```

**인스턴스 타입:**
- **Free** (무료 플랜 선택)

### Step 4: 환경 변수 (선택사항)
환경 변수 섹션에서 추가:
- `NODE_ENV`: `production`
- `PORT`: `3000` (자동 설정되므로 생략 가능)

### Step 5: 배포 시작
1. "Create Web Service" 버튼 클릭
2. 자동으로 배포 시작
3. 로그를 통해 진행 상황 확인

## 📊 배포 과정

```
1. GitHub에서 코드 가져오기
   ↓
2. npm install 실행
   - express 설치
   - xlsx 설치
   - 기타 dependencies 설치
   ↓
3. node web-server.js 실행
   ↓
4. 서버 시작 완료
   ↓
5. URL 할당: https://naver-land-crawler.onrender.com
```

## 🌐 배포 후 URL

배포 완료 후 다음과 같은 URL이 생성됩니다:
```
https://naver-land-crawler.onrender.com
```

이 URL로 접속하면 웹 인터페이스를 사용할 수 있습니다.

## ⚙️ 현재 프로젝트 호환성

### ✅ 완벽하게 작동하는 기능

1. **웹 서버 (Express)**
   - ✅ Render는 Node.js 서버 완벽 지원
   - ✅ 포트 자동 할당 (`process.env.PORT`)

2. **크롤링 기능**
   - ✅ Direct API 방식으로 데이터 수집
   - ✅ 메모리에서 처리

3. **검색 기능**
   - ✅ 키워드 검색 (최대 30페이지)
   - ✅ 단지 목록 표시

4. **엑셀 다운로드**
   - ✅ 메모리에서 엑셀 생성
   - ✅ Base64로 클라이언트에 전송
   - ✅ 파일 시스템 사용 안함

### ❌ 작동하지 않는 기능

**없음!** 모든 기능이 정상 작동합니다.

## 📝 package.json 확인

현재 `package.json`이 올바른지 확인:

```json
{
  "name": "naver-land-crawler",
  "version": "2.0.0",
  "type": "module",
  "description": "네이버 부동산 크롤러 (Direct API)",
  "main": "web-server.js",
  "scripts": {
    "start": "node web-server.js",
    "dev": "node web-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "xlsx": "^0.18.5"
  }
}
```

## 🔧 Render 설정 파일 (선택사항)

프로젝트 루트에 `render.yaml` 파일을 생성하면 자동 설정 가능:

```yaml
services:
  - type: web
    name: naver-land-crawler
    runtime: node
    buildCommand: npm install
    startCommand: node web-server.js
    envVars:
      - key: NODE_ENV
        value: production
```

## 🆓 무료 플랜 제한사항

### Render 무료 플랜:
- ✅ **무료 사용 가능**
- ✅ **SSL 인증서 자동 제공** (HTTPS)
- ✅ **자동 배포** (GitHub push 시)
- ⚠️ **15분 비활성 시 슬립 모드** (첫 요청 시 재시작)
- ⚠️ **월 750시간 무료** (충분함)
- ⚠️ **메모리 512MB** (현재 프로젝트는 충분)

### 슬립 모드 해결 방법:
무료 플랜은 15분 동안 요청이 없으면 슬립 모드로 전환됩니다.
해결 방법:
1. **UptimeRobot** 같은 서비스로 5분마다 핑 전송
2. **Paid 플랜** 사용 (월 $7)

## 🔍 배포 후 테스트

배포 완료 후:

1. **웹 인터페이스 접속**
   ```
   https://your-app-name.onrender.com
   ```

2. **검색 기능 테스트**
   - 키워드: "달서구"
   - 검색 버튼 클릭
   - 결과 확인

3. **크롤링 기능 테스트**
   - 단지번호: 105389
   - 크롤링 시작
   - 매물 데이터 확인

## 📊 모니터링

Render 대시보드에서:
- **로그 확인**: 실시간 서버 로그
- **메트릭**: CPU, 메모리 사용량
- **배포 히스토리**: 이전 배포 기록

## 🔄 자동 배포

GitHub에 푸시하면 자동으로 재배포:
```bash
git add .
git commit -m "Update feature"
git push origin main
```
→ Render가 자동으로 감지하고 재배포

## 🐛 문제 해결

### 배포 실패 시:
1. **로그 확인**: Render 대시보드에서 로그 확인
2. **package.json**: dependencies 확인
3. **포트 설정**: `process.env.PORT` 사용 확인

### 슬립 모드 깨우기:
- 첫 요청 시 30초~1분 소요 (정상)
- 이후 요청은 즉시 응답

## 💡 추가 팁

### 1. 커스텀 도메인 (선택사항)
- Render에서 커스텀 도메인 연결 가능
- 예: `crawler.yourdomain.com`

### 2. 환경 변수 관리
- 민감한 정보는 환경 변수로 관리
- Render 대시보드에서 설정

### 3. 성능 최적화
- 무료 플랜으로 충분
- 필요시 Paid 플랜으로 업그레이드

## 📞 지원

문제 발생 시:
- Render 문서: https://render.com/docs
- Render 커뮤니티: https://community.render.com
- GitHub Issues

## ✅ 체크리스트

배포 전 확인:
- [ ] GitHub 저장소에 코드 푸시
- [ ] `package.json` 확인
- [ ] `web-server.js`에서 `process.env.PORT` 사용 확인
- [ ] `.gitignore`에 `node_modules` 포함 확인

배포 후 확인:
- [ ] 웹 인터페이스 접속 확인
- [ ] 검색 기능 테스트
- [ ] 크롤링 기능 테스트
- [ ] 엑셀 다운로드 테스트

## 🎉 완료!

이제 Render.com에서 네이버 부동산 크롤러를 사용할 수 있습니다!

