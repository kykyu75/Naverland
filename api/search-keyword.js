export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // HTTPS 요청
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        ...headers,
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      }
    });
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`검색 완료: ${data.complexes?.length || 0}개 단지 발견`);
    
    return res.json({
      success: true,
      keyword: keyword,
      totalCount: data.totalCount || 0,
      complexes: data.complexes || [],
      regions: data.regions || [],
      isMoreData: data.isMoreData || false
    });

  } catch (error) {
    console.error('키워드 검색 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '키워드 검색 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
}

