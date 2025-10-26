import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// 기존 JSON 파일을 엑셀로 변환하는 스크립트
class JSONToExcelConverter {
  constructor() {
    this.collectedData = [];
  }

  // JSON 파일 읽기
  async loadJSONFiles() {
    console.log('기존 JSON 파일들을 찾습니다...');
    
    const files = fs.readdirSync('.');
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`발견된 JSON 파일: ${jsonFiles.length}개`);
    
    for (const file of jsonFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        
        // API 응답 형태의 데이터인지 확인
        if (data.url && data.body) {
          this.collectedData.push(data);
          console.log(`JSON 파일 로드됨: ${file}`);
        }
      } catch (error) {
        console.log(`JSON 파일 읽기 실패: ${file}`);
      }
    }
    
    console.log(`총 로드된 데이터: ${this.collectedData.length}개`);
  }

  // 데이터를 엑셀로 변환
  async saveToExcel() {
    console.log('데이터를 엑셀로 변환합니다...');
    
    const workbook = XLSX.utils.book_new();
    const sheetNames = new Set();
    
    // 매물 데이터 처리
    for (const apiData of this.collectedData) {
      if (apiData.body && apiData.body.articleList && Array.isArray(apiData.body.articleList)) {
        const articles = apiData.body.articleList;
        
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
          
          // 엑셀 데이터 변환
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
            '수집시간': apiData.timestamp || new Date().toISOString()
          }));
          
          const worksheet = XLSX.utils.json_to_sheet(excelData);
          
          // 컬럼 너비 설정
          const colWidths = [
            { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
            { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 20 }
          ];
          worksheet['!cols'] = colWidths;
          
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      }
    }
    
    // 워크북이 비어있으면 기본 시트 생성
    if (workbook.SheetNames.length === 0) {
      const emptyData = [{ '메시지': '변환할 데이터가 없습니다.' }];
      const worksheet = XLSX.utils.json_to_sheet(emptyData);
      XLSX.utils.book_append_sheet(workbook, worksheet, '알림');
    }
    
    // 엑셀 파일 저장
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const fileName = `naver-land-from-json-${dateStr}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    console.log(`엑셀 파일이 저장되었습니다: ${fileName}`);
    
    return fileName;
  }

  // 메인 실행 함수
  async convert() {
    try {
      await this.loadJSONFiles();
      const fileName = await this.saveToExcel();
      
      console.log('✅ JSON to Excel 변환 완료!');
      console.log(`📁 저장된 파일: ${fileName}`);
      
      return fileName;
    } catch (error) {
      console.error('❌ 변환 중 오류:', error.message);
      return null;
    }
  }
}

// 스크립트가 직접 실행된 경우에만 실행
if (process.argv[1] && process.argv[1].endsWith('json-to-excel.js')) {
  const converter = new JSONToExcelConverter();
  converter.convert().catch(console.error);
}

export default JSONToExcelConverter;
