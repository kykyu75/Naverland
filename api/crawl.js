import * as XLSX from 'xlsx';
import fs from 'fs';
import https from 'https';

const cookies = {
  'NNB': 'PWIJR7Q3QCQGO',
  'nstore_session': '4Y8GSqcQwQkpJcWHlbbNO5yj',
  'nstore_pagesession': 'iISgglqlKcnNPlsMiwh-038404',
  'ASID': '77c9d40200000194ddcdc61300000052'
};

async function fetchNaverAPI(complexNo, page = 1) {
  const baseURL = 'https://new.land.naver.com/api/articles/complex/';
  const params = {
    realEstateType: 'APT:PRE',
    tradeType: 'A1',
    tag: '::::::::',
    rentPriceMin: '0',
    rentPriceMax: '900000000',
    priceMin: '0',
    priceMax: '900000000',
    areaMin: '0',
    areaMax: '900000000',
    showArticle: 'true',
    sameAddressGroup: 'true',
    priceType: 'RETAIL',
    directions: '',
    complexNo: complexNo,
    buildingNos: '',
    areaNos: '',
    type: 'list',
    order: 'rank',
    page: page.toString()
  };

  const url = `${baseURL}${complexNo}?${new URLSearchParams(params).toString()}`;
  
  const headers = {
    'accept': '*/*',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
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

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { complexNo, complexName } = req.body;
    
    if (!complexNo) {
      return res.status(400).json({ 
        success: false, 
        error: '단지번호는 필수입니다.' 
      });
    }

    console.log(`크롤링 시작: 단지번호 ${complexNo}`);
    
    // 여러 페이지에서 데이터 수집
    const allArticles = [];
    for (let page = 1; page <= 5; page++) {
      const data = await fetchNaverAPI(complexNo, page);
      if (data && data.articleList && Array.isArray(data.articleList)) {
        allArticles.push(...data.articleList);
        console.log(`페이지 ${page}: ${data.articleList.length}개 매물 수집`);
        
        // 더 이상 데이터가 없으면 중단
        if (!data.isMoreData || data.articleList.length === 0) {
          break;
        }
      }
      // 요청 간 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`총 수집된 매물: ${allArticles.length}개`);
    
    // 파일명 생성
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    let fileName;
    if (complexName && complexName.trim()) {
      const cleanName = complexName.replace(/[<>:"/\\|?*]/g, '').trim();
      fileName = `naver-land-${cleanName}-${dateStr}.xlsx`;
    } else {
      fileName = `naver-land-${complexNo}-${dateStr}.xlsx`;
    }
    
    // 엑셀 파일 생성
    const excelData = allArticles.map(article => ({
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
      '수집시간': new Date().toISOString()
    }));
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const colWidths = Array(Object.keys(excelData[0] || {}).length).fill({ wch: 15 });
    worksheet['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, '매물');
    
    // /tmp에 파일 저장
    const filePath = `/tmp/${fileName}`;
    XLSX.writeFile(workbook, filePath);
    
    // 파일을 base64로 인코딩
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    
    return res.json({
      success: true,
      method: 'direct-api',
      dataCount: allArticles.length,
      fileName: fileName,
      fileData: base64File,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      articles: allArticles,
      message: '직접 API 크롤링이 완료되었습니다.'
    });
    
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
