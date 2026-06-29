const https = require('https');

const chatBody = {
  bot_id: '7651223356586786856',
  user_id: 'user_test',
  additional_messages: [{ role: 'user', content: '回复一个字', content_type: 'text' }],
  stream: true,
  auto_save_history: true
};

const opts = {
  hostname: 'api.coze.cn',
  port: 443,
  path: '/v3/chat',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pat_PzQlUbxdIXu7txW3cvP69EpHRLSidiY8KKa3NQ98KncpAA8jnOIZpZZMnJQd2ld5',
    'Content-Type': 'application/json'
  }
};

const req = https.request(opts, res => {
  let buffer = '';
  let lastEvent = '';
  res.on('data', chunk => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { lastEvent = ''; continue; }
      if (trimmed.startsWith('event:')) {
        lastEvent = trimmed.slice(6).trim();
        continue;
      }
      if (trimmed.startsWith('data:')) {
        const dataStr = trimmed.slice(5).trim();
        if (!dataStr || dataStr === '[DONE]') continue;
        try {
          const evt = JSON.parse(dataStr);
          if (lastEvent === 'conversation.message.delta' || lastEvent === '') {
            const msg = evt;
            if (msg.content && msg.type === 'answer') {
              console.log('DELTA:', JSON.stringify(msg.content));
            }
          }
          if (lastEvent === 'conversation.chat.created') {
            console.log('START convId=' + evt.conversation_id);
          }
          if (lastEvent === 'conversation.chat.completed') {
            console.log('DONE status=' + evt.status);
          }
        } catch(e) {}
        lastEvent = '';
      }
    }
  });
  res.on('end', () => { console.log('STREAM END'); });
  res.on('error', err => { console.log('ERROR:', err.message); });
});

req.on('error', err => { console.log('REQ ERROR:', err.message); });
req.write(JSON.stringify(chatBody));
req.end();
