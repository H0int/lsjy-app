// 一次性脚本：给用户 luvx_23 (ID:15) 充值到 1000000 圣力
// 在服务器 backend 目录下执行: node scripts/credit-luvx23.js
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '..', 'data', 'users.json');
let users = [];
try {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
} catch (e) {
  console.error('无法读取 users.json:', e.message);
  process.exit(1);
}

const targetId = 15;
const targetCoins = 1000000;
const user = users.find(u => Number(u.id) === targetId);

if (!user) {
  console.error(`用户 ID ${targetId} 不存在`);
  process.exit(1);
}

const before = user.coins;
user.coins = targetCoins;
user.totalRecharge = Number(user.totalRecharge || 0) + (targetCoins - before);

try {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
  console.log(`成功！用户 ${user.username} (ID:${targetId}) 圣力: ${before} -> ${targetCoins}`);
} catch (e) {
  console.error('写入失败:', e.message);
  process.exit(1);
}
