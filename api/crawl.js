import * as XLSX from 'xlsx';
import fs from 'fs';

// 쿠키 설정
const cookies = {
  'NNB': 'PWIJR7Q3QCQGO',
  'nstore_session': '4Y8GSqcQwQkpJcWHlbbNO5yj'
};

// HTTP 요청 함수
async function fetchNaverAPI(complexNo, page = 1) {
  const params = {
    realEstateType: 'APT:PRE',
    tradeType: 'A1',
    page: page.toString()
  };

  const url = `https://new.land.naver.com/api/articles/complex/${complexNo}?${new URLSearchParams(params).toString()}`;
  
  const headers = {
    'accept': '*/*',
    'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API 요청 실패:', error);
    return null;
  }
}

// Serverless function
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { complexNo, complexName } = req.body || {};
    
    if (!complexNo) {
      return res.status(400).json({ 
        success: false, 
        error: '단지번호는 필수입니다.' 
      });
    }

    console.log(`크롤링 시작: 단지번호 ${complexNo}`);
    
    // 데이터 수집
    const allArticles = [];
    for (let page = 1; page <= 3; page++) {
      const data = await fetchNaverAPI(complexNo, page);
      if (data && data.articleList) {
        allArticles.push(...data.articleList);
        if (!data.isMoreData) break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 엑셀 생성
    const excelData = allArticles.map(article => ({
      매물번호: article.articleNo || '',
      매물명: article.articleName || '',
      가격: article.dealOrWarrantPrc || '',
      면적: article.areaName || ''
    }));
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, '매물');
    
    // /tmp에 저장
    const fileName = `naver-land-${complexNo}-${new Date().toISOString().split('T')[0]}.xlsx`;
    const filePath = `/tmp/${fileName}`;
    XLSX.writeFile(workbook, filePath);
    
    // Base64 인코딩
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    
    return res.status(200).json({
      success: true,
      dataCount: allArticles.length,
      fileName: fileName,
      fileData: base64File,
      articles: allArticles
    });
    
  } catch (error) {
    console.error('크롤링 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
