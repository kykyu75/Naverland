// 간단한 테스트 API
export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
}

