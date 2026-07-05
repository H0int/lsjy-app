#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/lsjy-app"
SKILL_DIR="$APP_DIR/skill-services"

echo "=== 罗圣纪元 Skill 独立服务部署 ==="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"

mkdir -p "$SKILL_DIR"
cp /tmp/deploy/skill-services/docker-compose.yml "$SKILL_DIR/docker-compose.yml"

cd "$SKILL_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "未检测到 Docker，开始自动安装 Docker..."
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin || apt-get install -y docker.io docker-compose
  elif command -v yum >/dev/null 2>&1; then
    yum install -y yum-utils
    yum install -y docker docker-compose-plugin || yum install -y docker docker-compose
  else
    echo "当前系统不支持自动安装 Docker，跳过 Matomo 容器启动。"
    exit 0
  fi
  systemctl enable docker || true
  systemctl start docker || service docker start || true
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "未检测到 docker compose，跳过 Matomo 容器启动。"
  exit 0
fi

echo "确保 Nginx 中存在 Matomo 路径代理..."
MATOMO_BLOCK='
    # LSJY Matomo managed block
    location ^~ /matomo/ {
        proxy_pass http://127.0.0.1:8088/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Uri /matomo;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
'

for conf in /etc/nginx/conf.d/*.conf; do
  [ -f "$conf" ] || continue
  if grep -q "server_name .*api\.lsjyapp\.cn" "$conf" && ! grep -q "LSJY Matomo managed block" "$conf"; then
    python3 - "$conf" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
block = """
    # LSJY Matomo managed block
    location ^~ /matomo/ {
        proxy_pass http://127.0.0.1:8088/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Uri /matomo;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
"""
marker = "    location /api/v1/"
if marker in s:
    s = s.replace(marker, block + "\n" + marker, 1)
else:
    s = s.replace("    location / {", block + "\n    location / {", 1)
p.write_text(s)
PY
    echo "已注入 Matomo 代理：$conf"
  fi
done
nginx -t && nginx -s reload || true

if [ ! -f .env ]; then
  cat > .env <<'EOF'
MATOMO_DB_ROOT_PASSWORD=lsjy_matomo_root_2026
MATOMO_DB_NAME=matomo
MATOMO_DB_USER=matomo
MATOMO_DB_PASSWORD=lsjy_matomo_2026
EOF
  chmod 600 .env
fi

echo "拉取并启动 Matomo..."
$COMPOSE pull
$COMPOSE up -d

echo "等待 Matomo 启动..."
for i in $(seq 1 24); do
  if curl -fsS http://127.0.0.1:8088/ >/dev/null 2>&1; then
    echo "✅ Matomo 已启动：http://127.0.0.1:8088/"
    exit 0
  fi
  sleep 5
done

echo "⚠️ Matomo 容器已启动但健康检查未通过，查看状态："
$COMPOSE ps || true
exit 0
