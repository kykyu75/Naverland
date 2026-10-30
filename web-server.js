import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';
import https from 'https';
import http from 'http';
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
    const { complexNo, complexName } = req.body;
    
    if (!complexNo) {
      return res.status(400).json({ 
        success: false, 
        error: '단지번호는 필수입니다.' 
      });
    }

    console.log(`크롤링 시작: 단지번호 ${complexNo}`);
    
    // Direct API만 사용
    const apiCrawler = new DirectAPICrawler();
    const data = await apiCrawler.crawlDirectAPI(complexNo);
    
    // 수집된 매물 데이터 추출
    const articles = [];
    for (const apiData of data) {
      if (apiData.data && apiData.data.articleList && Array.isArray(apiData.data.articleList)) {
        articles.push(...apiData.data.articleList);
      }
    }
    
    // 파일은 생성하지 않고 데이터만 반환
    const result = {
      success: true,
      method: 'direct-api',
      dataCount: articles.length,
      complexNo: complexNo,
      complexName: complexName || '',
      articles: articles,
      message: 'Direct API 크롤링이 완료되었습니다.'
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 생성된 엑셀 파일 목록 조회 API
app.get('/api/files', (req, res) => {
  try {
    const downloadDir = path.join(__dirname, 'downLoad');
    
    // downLoad 폴더가 없으면 빈 배열 반환
    if (!fs.existsSync(downloadDir)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(downloadDir)
      .filter(file => file.endsWith('.xlsx'))
      .map(file => {
        const stats = fs.statSync(path.join(downloadDir, file));
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

// Direct API 방식으로 키워드 검색 (크롤링과 동일한 방식 사용)
app.post('/api/search-keyword', async (req, res) => {
  try {
    const { keyword } = req.body;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ error: '검색 키워드를 입력해주세요.' });
    }

    console.log(`키워드 검색 시작 (Direct API): ${keyword}`);
    
    // 네이버 부동산 검색 API 호출 (모든 페이지 수집)
    const searchUrl = 'https://new.land.naver.com/api/search';
    const apiCrawler = new DirectAPICrawler();
    
    // 크롤링과 동일한 헤더 사용
    const headers = {
      'accept': '*/*',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NjA1Nzc1MzUsImV4cCI6MTc2MDU4ODMzNX0.Q1VRZmhsAmblSgsNf3SYW3l1_18qU11uAkaDndSC5pQ',
      'priority': 'u=1, i',
      'referer': 'https://new.land.naver.com/',
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
    };
    
    const querystring = await import('querystring');
    
    // 모든 페이지의 데이터를 수집 (최대 10페이지)
    const MAX_PAGES = 5;
    let allComplexes = [];
    let allRegions = [];
    let page = 1;
    let hasMoreData = true;
    let totalCount = 0;
    let limitReached = false;
    
    while (hasMoreData && page <= MAX_PAGES) {
      const params = {
        keyword: keyword.trim(),
        page: page.toString()
      };
      
      const queryString = querystring.stringify(params);
      const fullUrl = `${searchUrl}?${queryString}`;
      
      console.log(`검색 페이지 ${page}: ${fullUrl}`);
      
      const response = await apiCrawler.makeRequest(fullUrl, headers);
      
      if (!response.success) {
        console.error(`검색 실패 (페이지 ${page}): ${response.error} (상태: ${response.status})`);
        
        // 첫 페이지 실패 시 에러 반환
        if (page === 1) {
          if (response.status === 404) {
            return res.status(404).json({ 
              success: false, 
              error: '검색 API 엔드포인트를 찾을 수 없습니다. 네이버 부동산 API가 변경되었을 수 있습니다.',
              details: response.error,
              suggestion: '단지번호를 직접 입력하여 크롤링하시거나, 브라우저에서 네이버 부동산을 열어 단지번호를 확인해주세요.'
            });
          }
          
          if (response.status === 429) {
            return res.status(429).json({ 
              success: false, 
              error: '네이버 API 요청 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.',
              details: response.error
            });
          }
          
          return res.status(response.status || 500).json({ 
            success: false, 
            error: '키워드 검색 중 오류가 발생했습니다.',
            details: response.error,
            status: response.status
          });
        }
        
        // 중간 페이지 실패 시 수집된 데이터 반환
        console.log(`페이지 ${page} 실패, 수집된 데이터 반환`);
        break;
      }
      
      const data = response.data;
      
      // 첫 페이지에서 totalCount 저장
      if (page === 1) {
        totalCount = data.totalCount || 0;
      }
      
      // 데이터 추가
      if (data.complexes && Array.isArray(data.complexes)) {
        allComplexes.push(...data.complexes);
        console.log(`페이지 ${page}: ${data.complexes.length}개 단지 수집 (누적: ${allComplexes.length}개)`);
      }
      
      if (data.regions && Array.isArray(data.regions) && page === 1) {
        allRegions = data.regions;
      }
      
      // 더 이상 데이터가 없거나, 수집된 데이터가 없으면 종료
      hasMoreData = data.isMoreData === true && data.complexes && data.complexes.length > 0;
      
      if (hasMoreData) {
        // 10페이지 도달 체크
        if (page >= MAX_PAGES) {
          limitReached = true;
          console.log(`⚠️ 최대 페이지 수(${MAX_PAGES}페이지) 도달`);
          break;
        }
        
        page++;
        // API 부하 방지를 위한 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`검색 완료: 총 ${allComplexes.length}개 단지 수집 (${page}페이지)`);
    
    res.json({
      success: true,
      keyword: keyword,
      totalCount: totalCount,
      complexes: allComplexes,
      regions: allRegions,
      isMoreData: limitReached || hasMoreData,
      totalPages: page,
      limitReached: limitReached,
      maxPages: MAX_PAGES
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
    const downloadDir = path.join(__dirname, 'downLoad');
    
    // downLoad 폴더가 없으면 생성
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    console.log(`다운로드 폴더: ${downloadDir}`);
    
    // Windows에서 폴더 열기
    if (process.platform === 'win32') {
      exec(`explorer "${downloadDir}"`, (error) => {
        if (error) {
          console.error('폴더 열기 오류:', error);
          res.status(500).json({ error: '폴더를 열 수 없습니다.' });
        } else {
          res.json({ success: true, message: '폴더가 열렸습니다.', path: downloadDir });
        }
      });
    } else if (process.platform === 'darwin') {
      exec(`open "${downloadDir}"`, (error) => {
        if (error) {
          console.error('폴더 열기 오류:', error);
          res.status(500).json({ error: '폴더를 열 수 없습니다.' });
        } else {
          res.json({ success: true, message: '폴더가 열렸습니다.', path: downloadDir });
        }
      });
    } else {
      exec(`xdg-open "${downloadDir}"`, (error) => {
        if (error) {
          console.error('폴더 열기 오류:', error);
          res.status(500).json({ error: '폴더를 열 수 없습니다.' });
        } else {
          res.json({ success: true, message: '폴더가 열렸습니다.', path: downloadDir });
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
  console.log(`\n💡 Direct API 방식만 사용됩니다.`);
});

export default app;
