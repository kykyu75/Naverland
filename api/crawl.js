import DirectAPICrawler from '../direct-api-crawler.js';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { complexNo, complexName, method = 'direct-api' } = req.body;
    
    if (!complexNo) {
      return res.status(400).json({ 
        success: false, 
        error: '단지번호는 필수입니다.' 
      });
    }

    console.log(`크롤링 시작: 단지번호 ${complexNo}, 방법: ${method}`);
    
    // Direct API만 사용 (Playwright는 serverless에서 불가능)
    const apiCrawler = new DirectAPICrawler();
    const data = await apiCrawler.crawlDirectAPI(complexNo);
    
    // 수집된 매물 데이터 추출
    const articles = [];
    for (const apiData of data) {
      if (apiData.data && apiData.data.articleList && Array.isArray(apiData.data.articleList)) {
        articles.push(...apiData.data.articleList);
      }
    }
    
    // Vercel에서 파일 저장 시 /tmp 사용
    const fs = await import('fs');
    const path = await import('path');
    
    // /tmp 디렉토리는 writable
    const tmpDir = '/tmp';
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    let fileName;
    if (complexName && complexName.trim()) {
      const cleanName = complexName.replace(/[<>:"/\\|?*]/g, '').trim();
      fileName = `naver-land-${cleanName}-${dateStr}.xlsx`;
    } else {
      fileName = `naver-land-${complexNo}-${dateStr}.xlsx`;
    }
    
    const filePath = path.join(tmpDir, fileName);
    const xlsx = await import('xlsx');
    
    // 엑셀 파일 생성
    const workbook = xlsx.utils.book_new();
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
      '수집시간': new Date().toISOString()
    }));
    
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const colWidths = Array(Object.keys(excelData[0] || {}).length).fill({ wch: 15 });
    worksheet['!cols'] = colWidths;
    xlsx.utils.book_append_sheet(workbook, worksheet, '매물');
    
    xlsx.writeFile(workbook, filePath);
    
    console.log(`엑셀 파일이 저장되었습니다: ${filePath}`);
    
    // 파일을 base64로 인코딩하여 반환
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    
    return res.json({
      success: true,
      method: 'direct-api',
      dataCount: articles.length,
      fileName: fileName,
      fileData: base64File, // base64 인코딩된 파일 데이터
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      articles: articles,
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

