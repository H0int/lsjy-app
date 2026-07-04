const fs = require('fs');
let content = fs.readFileSync('routes/admin.js', 'utf8');

// 1. 引入 requireAuth
content = content.replace(
  "const { requireAdmin } = require('../lib/auth');",
  "const { requireAdmin, requireAuth } = require('../lib/auth');"
);

// 2. 修复 online/heartbeat 使用 requireAuth
content = content.replace(
  "router.post('/online/heartbeat', requireAdmin,",
  "router.post('/online/heartbeat', requireAuth,"
);

// 3. 修复 online/count 使用 requireAuth
content = content.replace(
  "router.get('/online/count', requireAdmin,",
  "router.get('/online/count', requireAuth,"
);

// 4. 修复 online/count 返回 onlineCount
content = content.replace(
  "data: { count: onlineUsers.size }",
  "data: { onlineCount: onlineUsers.size }"
);

// 5. 修复 visitors/click 使用 requireAuth
content = content.replace(
  "router.post('/visitors/click', requireAdmin,",
  "router.post('/visitors/click', requireAuth,"
);

// 6. 修复 visitors/checkin 使用 requireAuth
content = content.replace(
  "router.post('/visitors/checkin', requireAdmin,",
  "router.post('/visitors/checkin', requireAuth,"
);

fs.writeFileSync('routes/admin.js', content, 'utf8');
console.log('Step 1 done: requireAuth + online/count fixes');
