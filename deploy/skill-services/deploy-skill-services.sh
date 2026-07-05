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
  echo "未检测到 Docker，跳过 Matomo 容器启动。请先在 ECS 安装 Docker。"
  exit 0
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "未检测到 docker compose，跳过 Matomo 容器启动。"
  exit 0
fi

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
