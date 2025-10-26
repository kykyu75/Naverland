import { chromium } from 'playwright';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// 프로그램 버전 정보
const VERSION = '1.1.0';
const PROGRAM_NAME = '네이버 부동산 크롤러';

// 사용자 입력을 받는 함수
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 단지 정보 입력 함수
async function getComplexInfo() {
  const rl = createReadlineInterface();
  
  console.log('\n=== 단지 정보 입력 ===');
  
  const complexNo = await askQuestion(rl, '단지번호를 입력하세요 (예: 105389): ');
  
  rl.close();
  
  // 단지 정보를 API에서 가져오기
  let complexName = '';
  let address = '';
  
  if (complexNo) {
    try {
      const complexInfo = await getComplexInfoFromAPI(complexNo);
      complexName = complexInfo.complexName || '';
      address = complexInfo.address || '';
    } catch (error) {
      console.log('단지 정보를 가져올 수 없습니다:', error.message);
    }
  }
  
  return {
    complexNo: complexNo || '105389',
    complexName: complexName,
    address: address
  };
}

// 네이버 API에서 단지 정보 가져오기
async function getComplexInfoFromAPI(complexNo) {
  const url = `https://new.land.naver.com/api/complexes/${complexNo}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://new.land.naver.com/'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    complexName: data.complexName || '',
    address: data.address || ''
  };
}

// 네이버 부동산 크롤러 클래스
class NaverLandCrawler {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.collectedData = [];
  }

  // 브라우저 초기화 (보안 정책 우회)
  async init() {
    console.log('브라우저를 초기화합니다...');
    this.browser = await chromium.launch({ 
      headless: false,
      channel: 'chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
      ]
    });
    
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      locale: 'ko-KR',
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    // 쿠키 설정
    await this.setCookies();
    
    this.page = await this.context.newPage();
    
    // 자동화 감지 우회
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Chrome 객체 숨기기
      window.chrome = {
        runtime: {},
      };
      
      // Permissions API 모킹
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
    
    // 네트워크 요청 모니터링 설정
    await this.setupNetworkMonitoring();
  }

  // 쿠키 설정
  async setCookies() {
    const cookies = [
      { name: 'NNB', value: 'PWIJR7Q3QCQGO', domain: '.naver.com', path: '/' },
      { name: 'nstore_session', value: '4Y8GSqcQwQkpJcWHlbbNO5yj', domain: '.naver.com', path: '/' },
      { name: 'nstore_pagesession', value: 'iISgglqlKcnNPlsMiwh-038404', domain: '.naver.com', path: '/' },
      { name: 'ASID', value: '77c9d40200000194ddcdc61300000052', domain: '.naver.com', path: '/' },
      { name: 'NV_WETR_LAST_ACCESS_RGN_M', value: '"MDE3MzAzNTA="', domain: '.naver.com', path: '/' },
      { name: 'NV_WETR_LOCATION_RGN_M', value: '"MDE3MzAzNTA="', domain: '.naver.com', path: '/' },
      { name: 'tooltipDisplayed', value: 'true', domain: '.naver.com', path: '/' },
      { name: 'NFS', value: '2', domain: '.naver.com', path: '/' },
      { name: 'landHomeFlashUseYn', value: 'Y', domain: '.naver.com', path: '/' },
      { name: 'nhn.realestate.article.rlet_type_cd', value: 'A01', domain: '.naver.com', path: '/' },
      { name: 'nid_inf', value: '1551220035', domain: '.naver.com', path: '/' },
      { name: 'NID_AUT', value: 'xCCL4icR7TJ4jLlu9ryog1Ph5FdWFwKhu+QP52/TZZRQwhYziLV1zrckOdys/Y7h', domain: '.naver.com', path: '/' },
      { name: 'NAC', value: 'gasMBww2e9Q6A', domain: '.naver.com', path: '/' },
      { name: 'SRT30', value: '1760573732', domain: '.naver.com', path: '/' },
      { name: 'NACT', value: '1', domain: '.naver.com', path: '/' },
      { name: 'NID_SES', value: 'AAAB1L+4EGUTNdJP7drjzB8eVpY73xmveJOOnvdwPo+7UnzSMcemTaI3941yi69/ZNw8CDwv7PsBcPQFK3GKJI+ubxPf2huNgvJN/J5isl0Lw68dnsi6BnfFmKlRO/AQAjNbmr2qiWigqIN7SjoV+Wtra1ZeZOuUrLlIAxjwQLyT9HP9mjtJ0tkQJtZUa86E9SjCts4Y1ROGZ0ef+TvqlkbD0uUefYm3lwMTlkE77P/cxU1TiGvmQtu3qmLirfxI4AjMm9nahvs8y25/v59/TmAsuV6B5/qCgeEeYPU+lRsxl4uRoLri8iuq5N2Y5DzyzWQ62M923AOgnEkhxwIXrEK2FtTLe73TwXwG/kOK9m9z1medC4yVJSpyklGjpaoJNgkMeTFxd4xt80Vvd7vAV74pFON3yyq5lOy5pUABzZnqnQYyZkrsVyba2wlS8ZmIWLiZ5IKi226jH/pOZxq6qpxYJ83pxlt192VC72NWwGjYO9mmB2YsW3ZtAlsZJBdMvDYfdjYrUqGuFzu77hJynesilfDHx2rVZcfVWGbybE1hfFw86lp3GEL6at0pVdHJjxjZFL9Tdh8934Trr5udR/1TQ/GnWO86cyulkJ8lI4tPq4K02c4zOFym1SJdCdeFSHC+EQ==', domain: '.naver.com', path: '/' },
      { name: 'page_uid', value: 'jns+psqVJLhssAc8qjdssssstm8-323912', domain: '.naver.com', path: '/' },
      { name: 'SRT5', value: '1760577527', domain: '.naver.com', path: '/' },
      { name: 'nhn.realestate.article.trade_type_cd', value: '""', domain: '.naver.com', path: '/' },
      { name: 'nhn.realestate.article.ipaddress_city', value: '1100000000', domain: '.naver.com', path: '/' },
      { name: 'REALESTATE', value: 'Thu%20Oct%2016%202025%2010%3A18%3A55%20GMT%2B0900%20(Korean%20Standard%20Time)', domain: '.naver.com', path: '/' },
      { name: 'PROP_TEST_KEY', value: '1760577535186.32e1c24e28590efe354c85bd2a68e0e8d2454189932ca10431b02bc6dd15e965', domain: '.naver.com', path: '/' },
      { name: 'PROP_TEST_ID', value: '17ee777e290c83132ab8267f465b897cd1a869c96148aaeb508cbbbbedac5630', domain: '.naver.com', path: '/' },
      { name: 'BUC', value: 'LHUalNBbe1yOWo9A-7Lwt-66Cc_JZ_-slKkWx5lRnws=', domain: '.naver.com', path: '/' }
    ];

    await this.context.addCookies(cookies);
    console.log('쿠키가 설정되었습니다.');
  }

  // 네트워크 요청 모니터링 설정
  async setupNetworkMonitoring() {
    console.log('네트워크 요청 모니터링을 설정합니다...');
    
    this.page.on('response', async (response) => {
      try {
        const url = response.url();
        
        // 매물 관련 API 요청만 캡처
        if (url.includes('/api/articles/complex/') || 
            url.includes('/api/complexes/') ||
            url.includes('/api/maps/') ||
            url.includes('/api/cortars') ||
            url.includes('/api/developmentplan')) {
          
          const contentType = response.headers()['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            try {
              const data = await response.json();
              const request = response.request();
              
              const apiData = {
                url: url,
                method: request.method(),
                status: response.status(),
                headers: response.headers(),
                requestHeaders: request.headers(),
                data: data,
                timestamp: new Date().toISOString()
              };
              
              this.collectedData.push(apiData);
              console.log(`API 요청 캡처됨: ${url} (상태: ${response.status()})`);
              
            } catch (error) {
              console.log(`JSON 파싱 실패: ${url}`);
            }
          }
        }
      } catch (error) {
        console.log('응답 처리 중 오류:', error.message);
      }
    });
  }

  // 페이지 로드 및 스크롤 (보안 우회)
  async crawlPage(url) {
    console.log(`페이지 로드 시작: ${url}`);
    
    try {
      // 목표 페이지로 직접 이동
      console.log('목표 페이지로 이동합니다...');
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      
      console.log('페이지가 로드되었습니다. 스크롤을 시작합니다...');
      
      // 무한 스크롤로 더 많은 데이터 로드
      let previousDataCount = this.collectedData.length;
      let noNewDataCount = 0;
      
      for (let i = 0; i < 20; i++) {
        console.log(`스크롤 ${i + 1}/20: 현재 수집된 데이터 ${this.collectedData.length}개`);
        
        // 페이지 하단으로 스크롤
        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // 스크롤 후 대기
        await this.page.waitForTimeout(3000);
        
        // 새로운 데이터가 없으면 카운트 증가
        if (this.collectedData.length === previousDataCount) {
          noNewDataCount++;
          if (noNewDataCount >= 3) {
            console.log('더 이상 새로운 데이터가 로드되지 않습니다.');
            break;
          }
        } else {
          noNewDataCount = 0;
          previousDataCount = this.collectedData.length;
        }
        
        // "더보기" 버튼 클릭 시도
        try {
          const moreButton = await this.page.$('button:has-text("더보기"), button:has-text("더 보기"), .btn_more, .more_btn');
          if (moreButton) {
            await moreButton.click();
            await this.page.waitForTimeout(2000);
          }
        } catch (error) {
          // 더보기 버튼이 없거나 클릭할 수 없는 경우 무시
        }
      }
      
      console.log(`최종 수집된 데이터: ${this.collectedData.length}개`);
      
    } catch (error) {
      console.error('페이지 로드 중 오류:', error.message);
    }
  }

  // 데이터를 엑셀로 변환
  async saveToExcel(complexNo = '', complexName = '') {
    console.log('데이터를 엑셀로 변환합니다...');
    
    const workbook = XLSX.utils.book_new();
    const sheetNames = new Set();
    
    // 매물 데이터 처리
    for (const apiData of this.collectedData) {
      if (apiData.data && apiData.data.articleList && Array.isArray(apiData.data.articleList)) {
        const articles = apiData.data.articleList;
        
        // 매물별로 그룹화
        const articleGroups = new Map();
        
        for (const article of articles) {
          const articleName = article.articleName || article.complexName || '알수없음';
          
          if (!articleGroups.has(articleName)) {
            articleGroups.set(articleName, []);
          }
          articleGroups.get(articleName).push(article);
        }
        
        // 각 매물 그룹별로 시트 생성
        for (const [articleName, articles] of articleGroups) {
          let sheetName = articleName;
          let counter = 1;
          
          // 중복 시트명 처리
          while (sheetNames.has(sheetName)) {
            sheetName = `${articleName}_${counter}`;
            counter++;
          }
          sheetNames.add(sheetName);
          
          // 엑셀 데이터 변환 (실제 API 필드에 맞게 수정)
          const excelData = articles.map(article => ({
            '매물번호': article.articleNo || '',
            '매물명': article.articleName || '',
            '매물상태': article.articleStatus || '',
            '부동산유형': article.realEstateTypeName || '',
            '거래유형': article.tradeTypeName || '',
            '층정보': article.floorInfo || '',
            '가격': article.dealOrWarrantPrc || '',
            '면적': article.areaName || '',
            '전용면적': article.area1 || '',
            '공급면적': article.area2 || '',
            '방향': article.direction || '',
            '확인일': article.articleConfirmYmd || '',
            '동명': article.buildingName || '',
            '매물특징': article.articleFeatureDesc || '',
            '태그': article.tagList ? article.tagList.join(', ') : '',
            '중개사명': article.realtorName || '',
            '중개사ID': article.realtorId || '',
            '중개업체명': article.cpName || '',
            '중개업체ID': article.cpid || '',
            '위도': article.latitude || '',
            '경도': article.longitude || '',
            '직거래여부': article.isDirectTrade ? 'Y' : 'N',
            '관심매물여부': article.isInterest ? 'Y' : 'N',
            '단지매물여부': article.isComplex ? 'Y' : 'N',
            'VR노출여부': article.isVrExposed ? 'Y' : 'N',
            '같은주소매물수': article.sameAddrCnt || '',
            '같은주소직거래수': article.sameAddrDirectCnt || '',
            '같은주소최고가': article.sameAddrMaxPrc || '',
            '같은주소최저가': article.sameAddrMinPrc || '',
            '사진수': article.siteImageCount || '',
            '수집시간': apiData.timestamp || ''
          }));
          
          const worksheet = XLSX.utils.json_to_sheet(excelData);
          
          // 컬럼 너비 설정 (새로운 필드 수에 맞게 조정)
          const colWidths = [
            { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
            { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 30 },
            { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            { wch: 10 }, { wch: 20 }
          ];
          worksheet['!cols'] = colWidths;
          
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      }
    }
    
    // 워크북이 비어있으면 기본 시트 생성
    if (workbook.SheetNames.length === 0) {
      const emptyData = [{ '메시지': '크롤링된 데이터가 없습니다.' }];
      const worksheet = XLSX.utils.json_to_sheet(emptyData);
      XLSX.utils.book_append_sheet(workbook, worksheet, '알림');
    }
    
    // 엑셀 파일 저장
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // 파일명에 단지 이름 사용 (특수문자 제거)
    let fileName;
    if (complexName && complexName.trim()) {
      const cleanName = complexName.replace(/[<>:"/\\|?*]/g, '').trim();
      fileName = `naver-land-${cleanName}-${dateStr}.xlsx`;
    } else {
      fileName = `naver-land-${complexNo}-${dateStr}.xlsx`;
    }
    
    XLSX.writeFile(workbook, fileName);
    console.log(`엑셀 파일이 저장되었습니다: ${fileName}`);
    
    return fileName;
  }

  // 브라우저 종료
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('브라우저가 종료되었습니다.');
    }
  }

  // 메인 크롤링 함수
  async crawl(url, complexInfo) {
    try {
      await this.init();
      await this.crawlPage(url);
      const fileName = await this.saveToExcel(complexInfo.complexNo, complexInfo.complexName);
      
      console.log('크롤링이 완료되었습니다!');
      console.log(`수집된 API 요청: ${this.collectedData.length}개`);
      console.log(`저장된 파일: ${fileName}`);
      
      return {
        success: true,
        dataCount: this.collectedData.length,
        fileName: fileName
      };
      
    } catch (error) {
      console.error('크롤링 중 오류 발생:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      await this.close();
    }
  }
}

// 메인 실행 함수
async function main() {
  console.log(`${PROGRAM_NAME} v${VERSION}`);
  console.log('================================');
  
  // 명령행 인수가 있으면 기존 방식, 없으면 단지 정보 입력
  let complexInfo;
  let useDirectAPI = process.argv.includes('--direct-api');
  
  if (process.argv[2]) {
    // 입력된 값이 URL인지 단지번호인지 확인
    const input = process.argv[2];
    const complexNo = input.match(/complexes\/(\d+)/)?.[1] || input;
    
    // 아파트 이름이 전달되었는지 확인 (--direct-api 플래그 제외)
    let complexName = '';
    for (let i = 3; i < process.argv.length; i++) {
      if (process.argv[i] !== '--direct-api') {
        complexName = process.argv[i];
        break;
      }
    }
    
    // 아파트 이름이 없으면 API에서 가져오기 시도
    if (!complexName) {
      try {
        const complexInfo = await getComplexInfoFromAPI(complexNo);
        complexName = complexInfo.complexName || '';
      } catch (error) {
        console.log('단지 정보를 가져올 수 없습니다:', error.message);
      }
    }
    
    complexInfo = {
      complexNo: complexNo,
      complexName: complexName,
      address: ''
    };
    
    if (input.includes('http')) {
      console.log(`대상 URL: ${input}`);
    } else {
      console.log(`단지번호: ${complexNo}`);
    }
  } else {
    // 새로운 방식: 단지 정보 입력
    complexInfo = await getComplexInfo();
    console.log(`단지번호: ${complexInfo.complexNo}`);
  }
  
  console.log(`크롤링 방법: ${useDirectAPI ? '직접 API 요청' : 'Playwright 브라우저'}`);
  console.log('================================');
  
  if (useDirectAPI) {
    // 직접 API 요청 방법
    console.log(`단지번호: ${complexInfo.complexNo}`);
    
    const DirectAPICrawler = (await import('./direct-api-crawler.js')).default;
    const apiCrawler = new DirectAPICrawler();
    
    try {
      const data = await apiCrawler.crawlDirectAPI(complexInfo.complexNo);
      const fileName = await apiCrawler.saveToExcel(complexInfo.complexNo, complexInfo.complexName);
      
      console.log('✅ 직접 API 크롤링 성공!');
      console.log(`📊 수집된 데이터: ${data.length}개`);
      console.log(`📁 저장된 파일: ${fileName}`);
    } catch (error) {
      console.log('❌ 직접 API 크롤링 실패:', error.message);
    }
  } else {
    // Playwright 브라우저 방법
    const crawler = new NaverLandCrawler();
    const result = await crawler.crawl(`https://new.land.naver.com/complexes/${complexInfo.complexNo}`, complexInfo);
    
    if (result.success) {
      console.log('✅ Playwright 크롤링 성공!');
      console.log(`📊 수집된 데이터: ${result.dataCount}개`);
      console.log(`📁 저장된 파일: ${result.fileName}`);
    } else {
      console.log('❌ Playwright 크롤링 실패:', result.error);
      console.log('💡 대안: 직접 API 요청을 시도해보세요:');
      console.log(`   node crawler.js "${process.argv[2]}" "${process.argv[3]}" --direct-api`);
    }
  }
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (process.argv[1] && process.argv[1].endsWith('crawler.js')) {
  main().catch(console.error);
}

export default NaverLandCrawler;
