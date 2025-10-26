# 네이버 부동산 크롤러 웹 애플리케이션

네이버 부동산에서 아파트 매물 정보를 크롤링하고 웹 인터페이스로 관리할 수 있는 애플리케이션입니다.

## 🚀 주요 기능

- 🔍 **키워드 검색**: 지역명으로 아파트 단지 검색
- 🏢 **직접 입력**: 단지번호로 직접 크롤링
- 📊 **실시간 데이터 확인**: 웹페이지에서 수집된 매물 데이터 즉시 확인
- 📁 **엑셀 파일 생성**: 수집된 데이터를 엑셀 파일로 자동 저장
- 📂 **폴더 열기**: 생성된 파일 위치 바로 확인

## 📋 시스템 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상
- **운영체제**: Windows, macOS, Linux
- **메모리**: 최소 4GB RAM 권장
- **디스크**: 최소 1GB 여유 공간

## 🛠️ 설치 및 설정

### 1단계: Node.js 설치

#### Windows
1. [Node.js 공식 웹사이트](https://nodejs.org/) 방문
2. "LTS" 버전 다운로드 (권장)
3. 다운로드한 `.msi` 파일 실행
4. 설치 마법사 따라하기 (기본 설정으로 설치)
5. 설치 완료 후 명령 프롬프트에서 확인:
   ```cmd
   node --version
   npm --version
   ```

#### macOS
```bash
# Homebrew 사용 (권장)
brew install node

# 또는 공식 웹사이트에서 다운로드
# https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

# Node.js 설치
sudo apt-get install -y nodejs

# 설치 확인
node --version
npm --version
```

### 2단계: 프로젝트 파일 복사

1. 프로젝트 폴더 전체를 새 PC로 복사
2. 다음 파일들이 포함되어야 함:
   ```
   Naver_Write/
   ├── package.json
   ├── package-lock.json
   ├── web-server.js
   ├── crawler.js
   ├── direct-api-crawler.js
   ├── json-to-excel.js
   ├── public/
   │   └── index.html
   └── node_modules/ (선택사항 - 없으면 자동 설치됨)
   ```

### 3단계: 의존성 설치

프로젝트 폴더에서 다음 명령어 실행:

```bash
# 프로젝트 폴더로 이동
cd Naver_Write

# 의존성 패키지 설치
npm install
```

설치되는 주요 패키지:
- `express`: 웹 서버
- `playwright`: 브라우저 자동화 (현재 사용 안함)
- `xlsx`: 엑셀 파일 처리
- `multer`: 파일 업로드 처리
- `cors`: 크로스 오리진 요청 처리

## 🎯 실행 방법

### 웹 서버 시작

```bash
# 방법 1: npm 스크립트 사용 (권장)
npm run web

# 방법 2: 직접 실행
node web-server.js

# 방법 3: 개발 모드
npm run dev
```

### 브라우저에서 접속

웹 서버가 시작되면 다음 메시지가 표시됩니다:
```
🌐 네이버 부동산 크롤러 웹 서버가 시작되었습니다!
📱 브라우저에서 http://localhost:3000 를 열어주세요
⏹️  서버를 중지하려면 Ctrl+C를 누르세요
```

브라우저에서 `http://localhost:3000` 접속

## 🔧 사용 방법

### 1. 키워드 검색
1. "검색 키워드" 입력란에 지역명 입력 (예: "달서구", "강남구")
2. "🔍 검색" 버튼 클릭
3. 검색 결과에서 원하는 단지 선택
4. "크롤링 시작" 버튼으로 매물 정보 수집

### 2. 직접 입력
1. "단지번호" 입력란에 아파트 단지번호 입력
2. "아파트명" 입력 (선택사항)
3. "크롤링 시작" 버튼 클릭

### 3. 결과 확인
- 수집된 매물 데이터가 웹페이지 테이블에 실시간 표시
- 엑셀 파일이 자동으로 생성되어 다운로드 가능
- "📂 폴더 열기" 버튼으로 파일 위치 확인

## ⚠️ 주의사항

### 포트 충돌 해결
만약 포트 3000이 이미 사용 중이라면:

**Windows:**
```cmd
# 포트 사용 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID [PID번호] /F
```

**macOS/Linux:**
```bash
# 포트 사용 프로세스 확인
lsof -ti:3000

# 프로세스 종료
kill -9 $(lsof -ti:3000)
```

### 방화벽 설정
- Windows 방화벽에서 Node.js 허용
- 포트 3000이 차단되지 않도록 확인

### 네트워크 설정
- 회사 네트워크에서는 프록시 설정이 필요할 수 있음
- SSL 인증서 관련 경고는 정상 (자체 서명된 인증서 사용)

## 🐛 문제 해결

### 자주 발생하는 오류

1. **"EADDRINUSE" 오류**
   - 포트 3000이 이미 사용 중
   - 위의 포트 충돌 해결 방법 참조

2. **"SELF_SIGNED_CERT_IN_CHAIN" 오류**
   - SSL 인증서 관련 경고
   - 정상적인 동작이므로 무시해도 됨

3. **"fetch failed" 오류**
   - 네트워크 연결 문제
   - 인터넷 연결 확인

4. **"Cannot find module" 오류**
   - 의존성 패키지 미설치
   - `npm install` 재실행

### 로그 확인
터미널/명령 프롬프트에서 실행 로그를 확인하여 문제 진단 가능

## 📁 프로젝트 구조

```
Naver_Write/
├── package.json              # 프로젝트 설정 및 의존성
├── web-server.js            # 웹 서버 메인 파일
├── crawler.js              # 브라우저 자동화 크롤러
├── direct-api-crawler.js   # 직접 API 크롤러
├── json-to-excel.js        # 엑셀 변환 유틸리티
├── public/
│   └── index.html          # 웹 인터페이스
└── node_modules/           # 의존성 패키지들
```

## 🔄 업데이트 방법

새로운 버전이 있을 때:
1. 기존 프로젝트 폴더 백업
2. 새 파일들로 교체
3. `npm install` 실행
4. 서버 재시작

## 📞 지원

문제가 발생하면:
1. 터미널/명령 프롬프트의 오류 메시지 확인
2. Node.js 버전 확인 (`node --version`)
3. 네트워크 연결 상태 확인
4. 방화벽 설정 확인

---

**🎉 설치가 완료되면 `npm run web` 명령어로 웹 서버를 시작하고 브라우저에서 `http://localhost:3000`에 접속하세요!**

# NCrawler
