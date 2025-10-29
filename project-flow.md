# 네이버 부동산 크롤러 프로젝트 Flow

## 전체 시스템 Flow

```mermaid
flowchart TD
    Start([사용자 시작]) --> WebOrCLI{실행 방식}
    
    WebOrCLI -->|웹 서버| StartWeb[웹 서버 시작<br/>web-server.js]
    WebOrCLI -->|CLI| StartCLI[CLI 실행<br/>crawler.js]
    
    StartWeb --> ListenServer[포트 3000에서 대기<br/>http://localhost:3000]
    ListenServer --> ServeHTML[HTML 페이지 서빙<br/>public/index.html]
    ServeHTML --> UserInterface[사용자 인터페이스]
    
    UserInterface --> SearchMethod{검색 방법}
    SearchMethod -->|키워드 검색| KeywordSearch[키워드 검색 API<br/>POST /api/search-keyword]
    SearchMethod -->|직접 입력| DirectInput[단지번호 입력]
    
    KeywordSearch --> SearchAPI[네이버 검색 API 호출]
    SearchAPI --> ComplexList[단지 목록 반환]
    ComplexList --> UserSelect[사용자 선택]
    UserSelect --> CrawlStart[크롤링 시작]
    
    DirectInput --> CrawlStart[크롤링 시작<br/>POST /api/crawl]
    
    CrawlStart --> CrawlMethod{크롤링 방법}
    
    CrawlMethod -->|Playwright| PlaywrightFlow[Playwright 브라우저 방식]
    CrawlMethod -->|Direct API| APIFlow[직접 API 방식]
    
    StartCLI --> CLIInput[CLI 인자 입력]
    CLIInput --> CLIQuery{플래그 확인}
    CLIQuery -->|--direct-api| APIFlow
    CLIQuery -->|없음| PlaywrightFlow
    
    subgraph PlaywrightFlow[Playwright 브라우저 크롤링]
        P1[Chromium 브라우저 시작]
        P2[쿠키 설정]
        P3[보안 우회 설정]
        P4[네트워크 모니터링 활성화]
        P5[네이버 부동산 페이지 접속]
        P6[페이지 스크롤]
        P7[더보기 버튼 클릭]
        P8[API 응답 캡처]
        P9[데이터 수집]
        
        P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> P8 --> P9
    end
    
    subgraph APIFlow[직접 API 크롤링]
        A1[쿠키 및 헤더 설정]
        A2[네이버 부동산 API 호출<br/>GET /api/articles/complex/:id]
        A3[여러 페이지 순회]
        A4[데이터 수집]
        
        A1 --> A2 --> A3 --> A4
    end
    
    PlaywrightFlow --> DataProcessing[데이터 처리]
    APIFlow --> DataProcessing
    
    DataProcessing --> ExcelConvert[엑셀 변환<br/>json-to-excel.js]
    ExcelConvert --> ExcelFile[엑셀 파일 생성<br/>naver-land-xxx-2025-xx-xx.xlsx]
    
    ExcelFile --> WebResponse{웹 서버 모드?}
    WebResponse -->|웹| DisplayResult[결과를 웹에 표시]
    WebResponse -->|CLI| ConsoleOutput[콘솔에 출력]
    
    DisplayResult --> DownloadBtn[다운로드 버튼<br/>GET /api/download/:filename]
    DisplayResult --> FolderBtn[폴더 열기 버튼<br/>POST /api/open-directory]
    
    DisplayResult --> End([완료])
    ConsoleOutput --> End
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style UserInterface fill:#fff4e6
    style PlaywrightFlow fill:#f3e5f5
    style APIFlow fill:#e8f5e9
    style ExcelFile fill:#ffe0b2
```

## 주요 컴포넌트 설명

### 1. 웹 서버 (web-server.js)
- Express 웹 서버로 3000 포트에서 실행
- RESTful API 제공
- 정적 파일 서빙 (HTML, CSS, JS)

### 2. 크롤러 종류
- **Playwright 크롤러 (crawler.js)**: 브라우저 자동화
- **API 크롤러 (direct-api-crawler.js)**: 직접 API 호출

### 3. 데이터 처리 흐름
- 네트워크 요청 모니터링 또는 직접 API 호출
- JSON 데이터 추출
- 엑셀로 변환 (XLSX 라이브러리)
- 파일 저장 또는 웹 다운로드

## API 엔드포인트

```
GET  /                          → HTML 페이지
POST /api/crawl                 → 크롤링 시작
GET  /api/download/:filename    → 파일 다운로드
GET  /api/files                 → 파일 목록 조회
POST /api/search-keyword        → 키워드 검색
POST /api/open-directory        → 폴더 열기
```

## 데이터 흐름

```mermaid
sequenceDiagram
    participant User
    participant WebServer
    participant Crawler
    participant NaverAPI
    participant ExcelConverter
    participant FileSystem
    
    User->>WebServer: 웹 브라우저 접속
    WebServer->>User: HTML 페이지 제공
    
    User->>WebServer: 단지번호 입력 및 크롤링 요청
    WebServer->>Crawler: 크롤링 시작
    
    alt Playwright 방식
        Crawler->>Crawler: 브라우저 초기화
        Crawler->>NaverAPI: 네이버 부동산 페이지 접속
        NaverAPI-->>Crawler: 페이지 응답
        Crawler->>Crawler: 네트워크 요청 모니터링
        NaverAPI-->>Crawler: API 응답 데이터
    else Direct API 방식
        Crawler->>NaverAPI: 직접 API 호출
        NaverAPI-->>Crawler: JSON 응답
    end
    
    Crawler->>ExcelConverter: 데이터 전달
    ExcelConverter->>FileSystem: 엑셀 파일 저장
    FileSystem-->>ExcelConverter: 저장 완료
    ExcelConverter-->>Crawler: 파일명 반환
    Crawler-->>WebServer: 결과 데이터
    WebServer-->>User: 결과 표시 및 다운로드
```

## 기술 스택

- **백엔드**: Node.js + Express
- **크롤링**: Playwright (브라우저 자동화) + Fetch API (직접 API)
- **데이터 처리**: XLSX (엑셀 파일 생성)
- **프론트엔드**: Vanilla JavaScript (public/index.html)

## 실행 흐름

```mermaid
graph LR
    A[사용자] -->|npm run web| B[웹 서버 시작]
    A -->|node crawler.js| C[CLI 모드]
    
    B --> D[브라우저 접속<br/>localhost:3000]
    D --> E[웹 인터페이스]
    E --> F[크롤링 실행]
    
    C --> C1[인자 입력<br/>단지번호]
    C --> C2[플래그 확인<br/>--direct-api]
    
    F --> G[데이터 수집]
    C1 --> G
    C2 --> G
    
    G --> H[엑셀 변환]
    H --> I[파일 저장]
    I --> J[결과 반환]
```

