import DirectAPICrawler from './direct-api-crawler.js';
import readline from 'readline';

// 프로그램 버전 정보
const VERSION = '1.2.0';
const PROGRAM_NAME = '네이버 부동산 크롤러 (Direct API)';

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
  const complexName = await askQuestion(rl, '아파트명을 입력하세요 (선택사항): ');
  
  rl.close();
  
  return {
    complexNo: complexNo || '105389',
    complexName: complexName || '',
    address: ''
  };
}

// 메인 실행 함수
async function main() {
  console.log(`${PROGRAM_NAME} v${VERSION}`);
  console.log('================================');
  
  let complexInfo;
  
  if (process.argv[2]) {
    // 명령행 인수로 단지번호 전달
    const complexNo = process.argv[2];
    const complexName = process.argv[3] || '';
    
    complexInfo = {
      complexNo: complexNo,
      complexName: complexName,
      address: ''
    };
    
    console.log(`단지번호: ${complexInfo.complexNo}`);
    if (complexInfo.complexName) {
      console.log(`아파트명: ${complexInfo.complexName}`);
    }
  } else {
    // 대화형 입력
    complexInfo = await getComplexInfo();
    console.log(`단지번호: ${complexInfo.complexNo}`);
  }
  
  console.log('================================');
  console.log('Direct API 방식으로 크롤링을 시작합니다...\n');
  
  const apiCrawler = new DirectAPICrawler();
  
  try {
    const data = await apiCrawler.crawlDirectAPI(complexInfo.complexNo);
    // const fileName = await apiCrawler.saveToExcel(complexInfo.complexNo, complexInfo.complexName);
    const fileName = '';
    
    console.log('\n✅ 크롤링 성공!');
    console.log(`📊 수집된 데이터: ${data.length}개 페이지`);
    console.log(`📁 저장된 파일: ${fileName}`);
  } catch (error) {
    console.error('\n❌ 크롤링 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (process.argv[1] && process.argv[1].endsWith('crawler.js')) {
  main().catch(console.error);
}

export default DirectAPICrawler;
