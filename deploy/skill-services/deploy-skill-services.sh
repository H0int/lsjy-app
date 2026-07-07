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

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "未检测到 ffmpeg，开始安装视频生成依赖..."
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y ffmpeg fonts-noto-cjk || apt-get install -y ffmpeg || true
  elif command -v yum >/dev/null 2>&1; then
    yum install -y epel-release || true
    yum install -y ffmpeg || true
  fi
fi

mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://docker.1ms.run"
  ]
}
EOF
systemctl daemon-reload || true
systemctl restart docker || service docker restart || true
sleep 3

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "未检测到 docker compose，跳过 Matomo 容器启动。"
  exit 0
fi

echo "确保 Nginx 中存在 Matomo 路径代理..."
if [ -f "/tmp/deploy/ecs-live-config/nginx-lsjy-live.conf" ]; then
  cp /tmp/deploy/ecs-live-config/nginx-lsjy-live.conf /etc/nginx/conf.d/lsjy.conf
  echo "已同步线上 Nginx 配置到 lsjy.conf"
fi

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
echo "当前 api.lsjyapp.cn 配置位置："
grep -R "server_name .*api\\.lsjyapp\\.cn" -n /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null || true
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
if ! $COMPOSE pull; then
  echo "DockerHub 拉取失败，切换公共镜像前缀重试..."
  for prefix in "docker.m.daocloud.io/library" "docker.1panel.live/library" "docker.1ms.run/library"; do
    echo "尝试镜像前缀：$prefix"
    cp docker-compose.yml docker-compose.yml.bak
    sed -i "s#image: matomo:5-apache#image: ${prefix}/matomo:5-apache#g" docker-compose.yml
    sed -i "s#image: mariadb:10.11#image: ${prefix}/mariadb:10.11#g" docker-compose.yml
    sed -i "s#image: chromadb/chroma:latest#image: ${prefix%/library}/chromadb/chroma:latest#g" docker-compose.yml
    if $COMPOSE pull; then
      break
    fi
    mv docker-compose.yml.bak docker-compose.yml
  done
fi
# 旧版 docker-compose 在重建 Apache 镜像时可能触发 ContainerConfig 异常，先清理旧 Matomo 容器，保留数据卷
docker ps -a --format '{{.Names}}' | grep 'lsjy-matomo' | xargs -r docker rm -f || true
$COMPOSE up -d || true

echo "等待 Matomo 启动..."
MATOMO_OK=0
for i in $(seq 1 24); do
  if curl -fsS http://127.0.0.1:8088/ >/dev/null 2>&1; then
    echo "✅ Matomo 已启动：http://127.0.0.1:8088/"
    MATOMO_OK=1
    break
  fi
  sleep 5
done

if [ "$MATOMO_OK" != "1" ]; then
  echo "⚠️ Matomo 容器已启动但健康检查未通过，查看状态："
  $COMPOSE ps || true
fi
echo "检查 Chroma 向量库状态："
curl -fsS http://127.0.0.1:8008/api/v2/heartbeat || curl -fsS http://127.0.0.1:8008/api/v1/heartbeat || curl -fsS http://127.0.0.1:8008/ || true
exit 0
