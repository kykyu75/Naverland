import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';
import NaverLandCrawler from './crawler.js';
import DirectAPICrawler from './direct-api-crawler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 정적 파일 서빙을 위한 public 디렉토리 생성
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// 메인 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 크롤링 시작 API
app.post('/api/crawl', async (req, res) => {
  try {
    const { complexNo, complexName, method = 'playwright' } = req.body;
    
    if (!complexNo) {
      return res.status(400).json({ 
        success: false, 
        error: '단지번호는 필수입니다.' 
      });
    }

    console.log(`크롤링 시작: 단지번호 ${complexNo}, 방법: ${method}`);
    
    let result;
    
    if (method === 'direct-api') {
      // 직접 API 요청 방법
      const apiCrawler = new DirectAPICrawler();
      const data = await apiCrawler.crawlDirectAPI(complexNo);
      
      // 수집된 매물 데이터 추출
      const articles = [];
      for (const apiData of data) {
        if (apiData.data && apiData.data.articleList && Array.isArray(apiData.data.articleList)) {
          articles.push(...apiData.data.articleList);
        }
      }
      
      const fileName = await apiCrawler.saveToExcel(complexNo, complexName);
      
      result = {
        success: true,
        method: 'direct-api',
        dataCount: articles.length,
        fileName: fileName,
        articles: articles, // 실제 매물 데이터 전달
        message: '직접 API 크롤링이 완료되었습니다.'
      };
    } else {
      // Playwright 브라우저 방법
      const crawler = new NaverLandCrawler();
      const crawlResult = await crawler.crawl(
        `https://new.land.naver.com/complexes/${complexNo}`, 
        { complexNo, complexName, address: '' }
      );
      
      result = {
        success: crawlResult.success,
        method: 'playwright',
        dataCount: crawlResult.dataCount || 0,
        fileName: crawlResult.fileName || '',
        message: crawlResult.success ? 'Playwright 크롤링이 완료되었습니다.' : '크롤링 중 오류가 발생했습니다.',
        error: crawlResult.error
      };
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 파일 다운로드 API
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('파일 다운로드 오류:', err);
        res.status(500).json({ error: '파일 다운로드 중 오류가 발생했습니다.' });
      }
    });
  } else {
    res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
  }
});

// 생성된 엑셀 파일 목록 조회 API
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.xlsx'))
      .map(file => {
        const stats = fs.statSync(path.join(__dirname, file));
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.modified - a.modified);
    
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: '파일 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 키워드 검색 API
app.post('/api/search-keyword', async (req, res) => {
  try {
    const { keyword } = req.body;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ error: '검색 키워드를 입력해주세요.' });
    }

    console.log(`키워드 검색 시작: ${keyword}`);
    
    // 네이버 부동산 검색 API 호출
    const searchUrl = 'https://new.land.naver.com/api/search';
    const params = {
      keyword: keyword.trim(),
      page: '1'
    };

    const cookies = {
      'NNB': 'PWIJR7Q3QCQGO',
      'nstore_session': '4Y8GSqcQwQkpJcWHlbbNO5yj',
      'nstore_pagesession': 'iISgglqlKcnNPlsMiwh-038404',
      'ASID': '77c9d40200000194ddcdc61300000052',
      'NV_WETR_LAST_ACCESS_RGN_M': '"MDE3MzAzNTA="',
      'NV_WETR_LOCATION_RGN_M': '"MDE3MzAzNTA="',
      'tooltipDisplayed': 'true',
      'NFS': '2',
      '_ga': 'GA1.1.2049030217.1751446160',
      '_ga_J5CZVNJNQP': 'GS2.1.s1751446159$o1$g0$t1751446161$j58$l0$h0',
      '_ga_8P4PY65YZ2': 'GS2.1.s1752184953$o2$g0$t1752184953$j60$l0$h0',
      '_fbp': 'fb.1.1757040484570.492209081843487792',
      '_fwb': '174ECA6WQEO9TFCamGcqEuE.1757915781695',
      'nhn.realestate.article.rlet_type_cd': 'A01',
      'ab.storage.userId.7d7bb94a-f465-48e5-bec1-35db97daf128': 'g%3A2nEoC%7Ce%3Aundefined%7Cc%3A1760417921823%7Cl%3A1760417921825',
      'ab.storage.deviceId.7d7bb94a-f465-48e5-bec1-35db97daf128': 'g%3A7eba4c9e-9499-a47c-0343-f9d2a6033e63%7Ce%3Aundefined%7Cc%3A1760417921826%7Cl%3A1760417921826',
      'ab.storage.sessionId.7d7bb94a-f465-48e5-bec1-35db97daf128': 'g%3A9bb2b82f-0509-aeb6-e59a-4cf6d46c5e69%7Ce%3A1760419726417%7Cc%3A1760417921824%7Cl%3A1760417926417',
      'NAC': 'gasMBww2e9Q6A',
      'nhn.realestate.article.trade_type_cd': '""',
      'nhn.realestate.article.ipaddress_city': '1100000000',
      'nid_inf': '1549599859',
      'NID_AUT': 'NIh+3TQTyiOeFw2E0q4q6xdFbbCGq4eOxjB78zD8+hK5i538oZ38koRiDMk+KrtX',
      'SRT30': '1760657846',
      'NACT': '1',
      'page_uid': 'jnbMydqo15wssk/V/7Rssssstrs-084913',
      'NID_SES': 'AAABu+IQEjg6wTIZtuOVfI11mjb6eJU0EG/v3JJ3kgsJjUJ0n12PaWNEggrBCSVNEUz3DjzuA5qwLwY9iECOO7wxbhCS2i+0lXT+EhpR/2FvArH8KU0Rq9yBJ/30Io/KTUXZMStaF3/RWKRbNq8Iwndb0oWXEIgNDg+M4Zu7sVLZYGMvvdjK8s6GP6krwFKDRcO8cmjhamWocNrVJ8xT0MQEehmt+s9635H5TAJWsZJWW+8PiF0lqMHKj85TdfzsqEEbz8nGHcKFw4gxvbGqU9LWGgeM9GJeml73RHfGEKEKWBXny4Pb2IWCgcRgL0wZGDfemqEMbRRoweI9OXitIV7fM85EnEucK87yZheTJgjYqQjh3+APxq4ARzG9Xqpcj00dWrjsfRGvnXrk8ET6mqg2GfkOLzxVWhCBT1l2x41TgjSogVSz3pdcYKTae5SMBFIZbJntZ1VOyAt6/Yg1shrLJaC+s5O4KwWXFBiHMmeQz7bXKjg/QBdTT2pFVjEiYfcwPPmbQ8x70cFn+Zo7sLAySH6GGugFWRmrXuoVuhVAzj2iSoi0/jR+w5IGjvngINKSWAqDBTfEWG+wlPsM53WcSiw=',
      'landHomeFlashUseYn': 'Y',
      'realestate.beta.lastclick.cortar': '1165000000',
      'SRT5': '1760664591',
      'REALESTATE': 'Fri%20Oct%2017%202025%2010%3A31%3A53%20GMT%2B0900%20(Korean%20Standard%20Time)',
      'PROP_TEST_KEY': '1760664713780.d3fbd7869377c2773b71b16398279f2e436deff2346c2e14d07e8ed38cafa0de',
      'PROP_TEST_ID': 'c26f8cf8e11c3d5adcbbaf64d7e5a76b02f357aefcf7d068fdb8d1f1c235e096',
      'BUC': '4KbP14X_aDiUrSfu8tBgqiYHb1xPY5W6rchoK-TwhiU='
    };

    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Connection': 'keep-alive',
      'Referer': 'https://new.land.naver.com/complexes/8781?ms=35.850881,128.52678,17&a=APT:PRE:ABYG:JGC&e=RETAIL&ad=true',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NjA2NjQ3MTMsImV4cCI6MTc2MDY3NTUxM30.fcJaGfCa8EFFNWlqZN-temvbjfWl2CVhc5xjoO1x5-M',
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };

    const querystring = await import('querystring');
    
    const queryString = querystring.stringify(params);
    const fullUrl = `${searchUrl}?${queryString}`;
    
    console.log(`검색 URL: ${fullUrl}`);

    // Node.js에서 HTTPS 요청 시 SSL 인증서 검증 비활성화
    const httpsModule = await import('https');
    
    // 환경 변수로 SSL 검증 비활성화
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        ...headers,
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      }
    });
    
    // 환경 변수 복원
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`검색 완료: ${data.complexes?.length || 0}개 단지 발견`);
    
    res.json({
      success: true,
      keyword: keyword,
      totalCount: data.totalCount || 0,
      complexes: data.complexes || [],
      regions: data.regions || [],
      isMoreData: data.isMoreData || false
    });

  } catch (error) {
    console.error('키워드 검색 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: '키워드 검색 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 디렉토리 열기 API
app.post('/api/open-directory', (req, res) => {
  try {
    const currentDir = __dirname;
    console.log(`현재 디렉토리: ${currentDir}`);
    
    // Windows에서 폴더 열기
    if (process.platform === 'win32') {
      // 여러 방법으로 시도
      const commands = [
        `explorer "${currentDir}"`,
        `start "" "${currentDir}"`,
        `cmd /c start "" "${currentDir}"`
      ];
      
      let success = false;
      let lastError = null;
      
      const tryCommand = (index) => {
        if (index >= commands.length) {
          console.error('모든 폴더 열기 명령이 실패했습니다:', lastError);
          res.status(500).json({ error: '폴더를 열 수 없습니다. 수동으로 프로젝트 폴더를 확인해주세요.' });
          return;
        }
        
        exec(commands[index], { cwd: currentDir }, (error, stdout, stderr) => {
          if (error) {
            console.log(`명령 실패: ${commands[index]}`, error.message);
            lastError = error;
            tryCommand(index + 1);
          } else {
            console.log(`폴더가 성공적으로 열렸습니다: ${currentDir}`);
            res.json({ success: true, message: '폴더가 열렸습니다.', path: currentDir });
          }
        });
      };
      
      tryCommand(0);
      
    } else if (process.platform === 'darwin') {
      exec(`open "${currentDir}"`, (error) => {
        if (error) {
          console.error('폴더 열기 오류:', error);
          res.status(500).json({ error: '폴더를 열 수 없습니다.' });
        } else {
          res.json({ success: true, message: '폴더가 열렸습니다.', path: currentDir });
        }
      });
    } else {
      exec(`xdg-open "${currentDir}"`, (error) => {
        if (error) {
          console.error('폴더 열기 오류:', error);
          res.status(500).json({ error: '폴더를 열 수 없습니다.' });
        } else {
          res.json({ success: true, message: '폴더가 열렸습니다.', path: currentDir });
        }
      });
    }
  } catch (error) {
    console.error('디렉토리 열기 API 오류:', error);
    res.status(500).json({ error: '폴더를 열 수 없습니다.' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🌐 네이버 부동산 크롤러 웹 서버가 시작되었습니다!`);
  console.log(`📱 브라우저에서 http://localhost:${PORT} 를 열어주세요`);
  console.log(`⏹️  서버를 중지하려면 Ctrl+C를 누르세요`);
});

export default app;
