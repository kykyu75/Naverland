# 네이버 부동산 크롤러 - Windows 설치 가이드

Windows PC/노트북에서 네이버 부동산 크롤러 웹 애플리케이션을 설치하고 실행하는 방법입니다.

## 🖥️ Windows 시스템 요구사항

- **운영체제**: Windows 10 이상 (Windows 11 권장)
- **메모리**: 최소 4GB RAM (8GB 권장)
- **디스크**: 최소 2GB 여유 공간
- **인터넷**: 안정적인 인터넷 연결 필요
- **브라우저**: Chrome, Edge, Firefox 등 최신 브라우저

## 📥 1단계: Node.js 설치

### 방법 1: 공식 웹사이트에서 다운로드 (권장)

1. **Node.js 공식 웹사이트 접속**
   - 브라우저에서 [https://nodejs.org](https://nodejs.org) 접속

2. **LTS 버전 다운로드**
   - 초록색 "LTS" 버튼 클릭 (예: v20.x.x LTS)
   - Windows Installer (.msi) 파일 다운로드

3. **설치 실행**
   - 다운로드한 `.msi` 파일 더블클릭
   - "Next" 버튼으로 설치 진행
   - **중요**: "Add to PATH" 옵션이 체크되어 있는지 확인
   - 설치 완료까지 기다림

4. **설치 확인**
   - `Windows 키 + R` → `cmd` 입력 → Enter
   - 명령 프롬프트에서 다음 명령어 실행:
   ```cmd
   node --version
   npm --version
   ```
   - 버전 번호가 표시되면 설치 성공!

### 방법 2: Chocolatey 사용 (고급 사용자)

1. **PowerShell 관리자 권한으로 실행**
   - `Windows 키 + X` → "Windows PowerShell (관리자)" 선택

2. **Chocolatey 설치**
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

3. **Node.js 설치**
   ```powershell
   choco install nodejs
   ```

## 📁 2단계: 프로젝트 파일 복사

1. **프로젝트 폴더 준비**
   - USB, 네트워크 드라이브, 또는 클라우드에서 프로젝트 폴더 복사
   - 폴더명: `Naver_Write`

2. **복사할 파일들 확인**
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
   └── README.md
   ```

3. **폴더 위치**
   - 바탕화면 또는 `C:\Users\[사용자명]\Documents` 권장
   - 경로에 한글이나 특수문자가 없도록 주의

## ⚙️ 3단계: 의존성 패키지 설치

1. **명령 프롬프트 열기**
   - `Windows 키 + R` → `cmd` 입력 → Enter
   - 또는 프로젝트 폴더에서 `Shift + 우클릭` → "여기서 명령 창 열기"

2. **프로젝트 폴더로 이동**
   ```cmd
   cd C:\Users\[사용자명]\Documents\Naver_Write
   ```
   (실제 경로로 변경)

3. **의존성 설치**
   ```cmd
   npm install
   ```

4. **설치 완료 확인**
   - `node_modules` 폴더가 생성되면 성공
   - 설치 과정에서 오류가 없어야 함

## 🚀 4단계: 웹 서버 실행

**방법 1: 배치 파일 사용 (가장 간단)**
1. 프로젝트 폴더에서 `start-web.bat` 파일 더블클릭
2. 자동으로 웹 서버가 시작됩니다

**방법 2: 명령 프롬프트 사용**
1. **서버 시작**
   ```cmd
   npm run web
   ```

2. **성공 메시지 확인**
   ```
   🌐 네이버 부동산 크롤러 웹 서버가 시작되었습니다!
   📱 브라우저에서 http://localhost:3000 를 열어주세요
   ⏹️  서버를 중지하려면 Ctrl+C를 누르세요
   ```

3. **브라우저에서 접속**
   - Chrome, Edge, Firefox 등에서 `http://localhost:3000` 접속
   - 웹 인터페이스가 정상적으로 로드되면 성공!

## 🔧 Windows 전용 문제 해결

### 포트 충돌 해결 (EADDRINUSE 오류)

**방법 1: 작업 관리자 사용**
1. `Ctrl + Shift + Esc` → 작업 관리자 열기
2. "세부 정보" 탭 클릭
3. "node.exe" 프로세스 찾아서 "작업 끝내기"

**방법 2: 명령 프롬프트 사용**
```cmd
# 포트 3000 사용 프로세스 확인
netstat -ano | findstr :3000

# PID 번호 확인 후 프로세스 종료
taskkill /PID [PID번호] /F
```

### 방화벽 설정

1. **Windows 방화벽 설정**
   - `Windows 키 + R` → `wf.msc` 입력 → Enter
   - "Windows Defender 방화벽" 창에서 "고급 설정" 클릭

2. **Node.js 허용**
   - "아웃바운드 규칙" → "새 규칙" → "프로그램"
   - Node.js 설치 경로 선택 (보통 `C:\Program Files\nodejs\node.exe`)
   - "연결 허용" 선택

3. **포트 허용**
   - "아웃바운드 규칙" → "새 규칙" → "포트"
   - "TCP" 선택 → "특정 로컬 포트" → "3000" 입력
   - "연결 허용" 선택

### 바이러스 백신 소프트웨어

**Windows Defender 또는 다른 백신 프로그램에서 차단하는 경우:**

1. **Windows Defender 예외 추가**
   - Windows 보안 → 바이러스 및 위협 방지 → 설정 관리
   - "제외 추가 또는 제거" → "제외 추가" → "폴더"
   - 프로젝트 폴더 전체 추가

2. **실시간 보호 일시 중지** (임시 해결책)
   - Windows 보안 → 바이러스 및 위협 방지
   - "실시간 보호" 끄기 (설치 완료 후 다시 켜기)

### 관리자 권한 문제

**PowerShell 실행 정책 오류 시:**
```powershell
# PowerShell 관리자 권한으로 실행 후
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 한글 경로 문제

- 프로젝트 폴더 경로에 한글이 포함되지 않도록 주의
- 권장 경로: `C:\Users\[영문사용자명]\Documents\Naver_Write`

## 🎯 사용 방법

### 1. 키워드 검색
1. 웹페이지에서 "검색 키워드" 입력란에 지역명 입력
   - 예: "달서구", "강남구", "서초동"
2. "🔍 검색" 버튼 클릭
3. 검색 결과에서 원하는 아파트 단지 선택
4. "크롤링 시작" 버튼으로 매물 정보 수집

### 2. 직접 입력
1. "단지번호" 입력란에 아파트 단지번호 입력
2. "아파트명" 입력 (선택사항)
3. "크롤링 시작" 버튼 클릭

### 3. 결과 확인
- 수집된 매물 데이터가 웹페이지 테이블에 실시간 표시
- 엑셀 파일이 자동으로 생성되어 다운로드 가능
- "📂 폴더 열기" 버튼으로 파일 위치 확인

## 📂 파일 위치

- **생성된 엑셀 파일**: 프로젝트 폴더 내
- **파일명 형식**: `naver-land-[단지명]-[날짜].xlsx`
- **예시**: `naver-land-월성푸르지오-2025-10-20.xlsx`

## 🔄 서버 재시작

**서버를 중지하려면:**
- 명령 프롬프트에서 `Ctrl + C` 누르기

**서버를 다시 시작하려면:**
```cmd
npm run web
```

## 🆘 자주 발생하는 오류

### 1. "node는 내부 또는 외부 명령이 아닙니다"
- **원인**: Node.js가 PATH에 등록되지 않음
- **해결**: Node.js 재설치 또는 시스템 재부팅

### 2. "npm은 내부 또는 외부 명령이 아닙니다"
- **원인**: npm이 설치되지 않음
- **해결**: Node.js 재설치 (npm은 Node.js와 함께 설치됨)

### 3. "EADDRINUSE: address already in use :::3000"
- **원인**: 포트 3000이 이미 사용 중
- **해결**: 위의 포트 충돌 해결 방법 참조

### 4. "SELF_SIGNED_CERT_IN_CHAIN" 경고
- **원인**: SSL 인증서 관련 경고
- **해결**: 정상적인 동작이므로 무시해도 됨

### 5. "fetch failed" 오류
- **원인**: 네트워크 연결 문제
- **해결**: 인터넷 연결 확인, 방화벽 설정 확인

## 📞 지원 및 도움말

**문제가 발생하면:**
1. 명령 프롬프트의 오류 메시지 확인
2. Node.js 버전 확인: `node --version`
3. 인터넷 연결 상태 확인
4. Windows 방화벽 설정 확인
5. 바이러스 백신 프로그램 확인

---

## 🎉 설치 완료!

모든 단계가 완료되면:
1. `start-web.bat` 파일을 더블클릭하여 서버 시작
   - 또는 `npm run web` 명령어 사용
2. 브라우저에서 `http://localhost:3000` 접속
3. 네이버 부동산 크롤러 사용 시작!

**💡 팁**: 
- `start-web.bat` 파일을 바탕화면에 바로가기로 만들어두면 더 편리합니다!
- 바로가기 만들기: `start-web.bat` 우클릭 → "바로가기 만들기" → 바탕화면으로 이동

