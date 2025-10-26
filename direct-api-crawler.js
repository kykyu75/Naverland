import { chromium } from 'playwright';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// 프로그램 버전 정보
const VERSION = '1.1.0';
const PROGRAM_NAME = '네이버 부동산 크롤러';

// 대안적 크롤링 방법 - 직접 API 요청
class DirectAPICrawler {
  constructor() {
    this.collectedData = [];
    this.cookies = {
      'NNB': 'PWIJR7Q3QCQGO',
      'nstore_session': '4Y8GSqcQwQkpJcWHlbbNO5yj',
      'nstore_pagesession': 'iISgglqlKcnNPlsMiwh-038404',
      'ASID': '77c9d40200000194ddcdc61300000052',
      'NV_WETR_LAST_ACCESS_RGN_M': '"MDE3MzAzNTA="',
      'NV_WETR_LOCATION_RGN_M': '"MDE3MzAzNTA="',
      'tooltipDisplayed': 'true',
      'NFS': '2',
      'landHomeFlashUseYn': 'Y',
      'nhn.realestate.article.rlet_type_cd': 'A01',
      'nid_inf': '1551220035',
      'NID_AUT': 'xCCL4icR7TJ4jLlu9ryog1Ph5FdWFwKhu+QP52/TZZRQwhYziLV1zrckOdys/Y7h',
      'NAC': 'gasMBww2e9Q6A',
      'SRT30': '1760573732',
      'NACT': '1',
      'NID_SES': 'AAAB1L+4EGUTNdJP7drjzB8eVpY73xmveJOOnvdwPo+7UnzSMcemTaI3941yi69/ZNw8CDwv7PsBcPQFK3GKJI+ubxPf2huNgvJN/J5isl0Lw68dnsi6BnfFmKlRO/AQAjNbmr2qiWigqIN7SjoV+Wtra1ZeZOuUrLlIAxjwQLyT9HP9mjtJ0tkQJtZUa86E9SjCts4Y1ROGZ0ef+TvqlkbD0uUefYm3lwMTlkE77P/cxU1TiGvmQtu3qmLirfxI4AjMm9nahvs8y25/v59/TmAsuV6B5/qCgeEeYPU+lRsxl4uRoLri8iuq5N2Y5DzyzWQ62M923AOgnEkhxwIXrEK2FtTLe73TwXwG/kOK9m9z1medC4yVJSpyklGjpaoJNgkMeTFxd4xt80Vvd7vAV74pFON3yyq5lOy5pUABzZnqnQYyZkrsVyba2wlS8ZmIWLiZ5IKi226jH/pOZxq6qpxYJ83pxlt192VC72NWwGjYO9mmB2YsW3ZtAlsZJBdMvDYfdjYrUqGuFzu77hJynesilfDHx2rVZcfVWGbybE1hfFw86lp3GEL6at0pVdHJjxjZFL9Tdh8934Trr5udR/1TQ/GnWO86cyulkJ8lI4tPq4K02c4zOFym1SJdCdeFSHC+EQ==',
      'page_uid': 'jns+psqVJLhssAc8qjdssssstm8-323912',
      'SRT5': '1760577527',
      'nhn.realestate.article.trade_type_cd': '""',
      'nhn.realestate.article.ipaddress_city': '1100000000',
      'REALESTATE': 'Thu%20Oct%2016%202025%2010%3A18%3A55%20GMT%2B0900%20(Korean%20Standard%20Time)',
      'PROP_TEST_KEY': '1760577535186.32e1c24e28590efe354c85bd2a68e0e8d2454189932ca10431b02bc6dd15e965',
      'PROP_TEST_ID': '17ee777e290c83132ab8267f465b897cd1a869c96148aaeb508cbbbbedac5630',
      'BUC': 'LHUalNBbe1yOWo9A-7Lwt-66Cc_JZ_-slKkWx5lRnws='
    };
  }

  // HTTP 요청 메서드
  async makeRequest(url, headers) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          ...headers,
          'Cookie': Object.entries(this.cookies).map(([key, value]) => `${key}=${value}`).join('; ')
        },
        // SSL 인증서 검증 무시
        rejectUnauthorized: false
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              success: true,
              status: res.statusCode,
              headers: res.headers,
              data: jsonData
            });
          } catch (error) {
            resolve({
              success: false,
              status: res.statusCode,
              error: 'JSON 파싱 실패',
              data: null
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          status: 0,
          error: error.message,
          data: null
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          success: false,
          status: 0,
          error: '요청 시간 초과',
          data: null
        });
      });

      req.end();
    });
  }

  // 직접 API 요청으로 데이터 수집
  async crawlDirectAPI(complexNo) {
    console.log(`직접 API 요청으로 매물 정보를 수집합니다: ${complexNo}`);
    
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
      order: 'rank'
    };

    const headers = {
      'accept': '*/*',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NjA1Nzc1MzUsImV4cCI6MTc2MDU4ODMzNX0.Q1VRZmhsAmblSgsNf3SYW3l1_18qU11uAkaDndSC5pQ',
      'priority': 'u=1, i',
      'referer': `https://new.land.naver.com/complexes/${complexNo}`,
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
    };


    try {
      // 여러 페이지 요청
      for (let page = 1; page <= 5; page++) {
        const url = `${baseURL}${complexNo}?${new URLSearchParams({...params, page: page.toString()}).toString()}`;
        
        console.log(`페이지 ${page} 요청: ${url}`);
        
        const response = await this.makeRequest(url, headers);
        
        if (response.success) {
          const apiData = {
            url: url,
            method: 'GET',
            status: response.status,
            headers: response.headers,
            data: response.data,
            timestamp: new Date().toISOString()
          };
          
          this.collectedData.push(apiData);
          console.log(`페이지 ${page} 데이터 수집 완료: ${response.data.articleList?.length || 0}개 매물`);
          
          // 더 이상 데이터가 없으면 중단
          if (!response.data.isMoreData || !response.data.articleList || response.data.articleList.length === 0) {
            console.log('더 이상 데이터가 없습니다.');
            break;
          }
        } else {
          console.log(`페이지 ${page} 요청 실패: ${response.status} - ${response.error}`);
        }
        
        // 요청 간 대기 (429 오류 방지)
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      console.log(`총 수집된 API 요청: ${this.collectedData.length}개`);
      return this.collectedData;
      
    } catch (error) {
      console.error('직접 API 요청 중 오류:', error.message);
      return [];
    }
  }

  // 데이터를 엑셀로 변환
  async saveToExcel(complexNo, complexName = '') {
    console.log('데이터를 엑셀로 변환합니다...');
    
    // 파일명 생성 (단지 이름 우선, 없으면 단지번호 사용)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // complexName이 비어있으면 수집된 데이터에서 단지명 유추
    if (!complexName || !complexName.trim()) {
      try {
        console.log('수집된 데이터에서 단지명을 찾는 중...');
        for (const apiData of this.collectedData) {
          if (apiData && apiData.data && Array.isArray(apiData.data.articleList)) {
            // 첫 번째 매물에서 단지명 필드들 확인
            const first = apiData.data.articleList[0];
            if (first) {
              // 다양한 단지명 필드 확인
              const candidates = [
                first.complexName,
                first.articleComplexName,
                first.complex,
                first.complexNameKr,
                first.complexNameEn,
                first.buildingName,
                first.apartmentName
              ];
              
              for (const candidate of candidates) {
                if (candidate && String(candidate).trim()) {
                  complexName = String(candidate).trim();
                  console.log(`단지명 발견: ${complexName}`);
                  break;
                }
              }
              
              if (complexName) break;
            }
          }
        }
        
        if (!complexName) {
          console.log('수집된 데이터에서 단지명을 찾을 수 없습니다.');
        }
      } catch (e) {
        console.log('단지명 추출 중 오류:', e.message);
      }
    }
    
    let fileName;
    if (complexName && complexName.trim()) {
      const cleanName = complexName.replace(/[<>:"\/\|?*]/g, '').trim();
      fileName = `naver-land-${cleanName}-${dateStr}.xlsx`;
    } else {
      fileName = `naver-land-${complexNo}-${dateStr}.xlsx`;
    }
    
    let workbook;
    const sheetName = `단지_${complexNo}`;
    
    if (fs.existsSync(fileName)) {
      try {
        workbook = XLSX.readFile(fileName);
        console.log(`기존 엑셀 파일을 로드했습니다: ${fileName}`);
      } catch (error) {
        console.warn('기존 엑셀 파일을 읽을 수 없습니다. 새 파일을 생성합니다.');
        workbook = XLSX.utils.book_new();
      }
    } else {
      workbook = XLSX.utils.book_new();
    }
    
    // 매물 데이터 처리 - 모든 매물을 하나의 시트에 저장
    const allArticles = [];
    
    for (const apiData of this.collectedData) {
      if (apiData.data && apiData.data.articleList && Array.isArray(apiData.data.articleList)) {
        // 각 매물에 API 정보 추가
        const articlesWithMeta = apiData.data.articleList.map(article => ({
          ...article,
          apiUrl: apiData.url || '',
          timestamp: apiData.timestamp || ''
        }));
        allArticles.push(...articlesWithMeta);
      }
    }
    
    if (allArticles.length > 0) {
      // 엑셀 데이터 변환 (실제 API 필드에 맞게 수정)
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
        '수집시간': article.timestamp || ''
      }));
      
      // 기존 시트가 있으면 데이터 추가, 없으면 새로 생성
      if (workbook.Sheets[sheetName]) {
        const existingSheet = workbook.Sheets[sheetName];
        const existingData = XLSX.utils.sheet_to_json(existingSheet);
        const combinedData = [...existingData, ...excelData];
        const worksheet = XLSX.utils.json_to_sheet(combinedData);
        const colWidths = Array(Object.keys(combinedData[0]).length).fill({ wch: 15 });
        worksheet['!cols'] = colWidths;
        workbook.Sheets[sheetName] = worksheet;
        console.log(`기존 시트 "${sheetName}"에 데이터 추가: ${excelData.length}개 매물 (총 ${combinedData.length}개)`);
      } else {
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const colWidths = Array(Object.keys(excelData[0]).length).fill({ wch: 15 });
        worksheet['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        console.log(`새 시트 "${sheetName}" 생성: ${excelData.length}개 매물`);
      }
    }
    
    // 워크북이 비어있으면 기본 시트 생성
    if (workbook.SheetNames.length === 0) {
      const emptyData = [{ '메시지': '크롤링된 데이터가 없습니다.' }];
      const worksheet = XLSX.utils.json_to_sheet(emptyData);
      XLSX.utils.book_append_sheet(workbook, worksheet, '알림');
    }
    
    // 엑셀 파일 저장
    XLSX.writeFile(workbook, fileName);
    console.log(`엑셀 파일이 저장되었습니다: ${fileName}`);
    console.log(`총 시트 수: ${workbook.SheetNames.length}개`);
    console.log(`시트 목록: ${workbook.SheetNames.join(', ')}`);
    
    return fileName;
  }
}

export default DirectAPICrawler;
