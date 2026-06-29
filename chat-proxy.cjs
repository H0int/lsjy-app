const http = require('http');
const JWT_SECRET_BACKEND = 'P5pERM3-WYox6knOTTg96wYRD4cMVHLCVhUeczwkx_vTDXAZV5CQhDHq3M-6Q1Q_RnX3GMvn4YFd9C0Glyyv5A';
const AI_PROXY_PORT = 3001;
const PORT = 3003;

// Parse JWT (no verification, just decode payload)
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch { return null; }
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    });
    return res.end();
  }
  
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({status:'ok'}));
  }
  
  if (req.url !== '/api/v1/ai/chat' || req.method !== 'POST') {
    res.writeHead(404, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({code:404,message:'Not found'}));
  }
  
  // Auth check
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.writeHead(401, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({code:401,message:'缺少认证令牌'}));
  }
  
  const payload = decodeJWT(token);
  if (!payload || !payload.sub) {
    res.writeHead(401, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({code:401,message:'认证令牌无效'}));
  }
  
  // Read body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const reqBody = JSON.parse(body);
      const model = reqBody.model || 'deepseek-v3';
      const messages = reqBody.messages || [];
      
      // Forward to ai-proxy
      const proxyReq = JSON.stringify({
        model: model,
        messages: messages,
      });
      
      const result = await new Promise((resolve, reject) => {
        const opts = {
          hostname: '127.0.0.1',
          port: AI_PROXY_PORT,
          path: '/api/v1/ai/chat',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Content-Length': Buffer.byteLength(proxyReq),
          },
        };
        const preq = http.request(opts, (pres) => {
          let data = '';
          pres.on('data', c => data += c);
          pres.on('end', () => {
            try { resolve({status: pres.statusCode, data: JSON.parse(data)}); }
            catch { resolve({status: pres.statusCode, data: data}); }
          });
        });
        preq.on('error', reject);
        preq.write(proxyReq);
        preq.end();
      });
      
      if (result.status !== 200) {
        const errMsg = result.data?.error?.message || result.data?.message || 'AI服务错误';
        res.writeHead(200, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({code:0, message:'success', data:{content:'️ AI服务暂时不可用：'+errMsg, coinCost:0}}));
      }
      
      // Transform OpenAI format to frontend format
      const content = result.data?.choices?.[0]?.message?.content || result.data?.content || '抱歉，未获取到回复。';
      
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify({
        code: 0,
        message: 'success',
        data: {
          content: content,
          coinCost: 0,
        }
      }));
    } catch (e) {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({code:500, message:'Internal error: '+e.message}));
    }
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Chat proxy running on port ' + PORT);
});
