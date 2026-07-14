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
    echo "当前系统不支持自动安装 Docker，跳过容器启动。"
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
  echo "未检测到 docker compose，跳过容器启动。"
  exit 0
fi

# ===== 注入 Nginx 代理块（Matomo + Crawl4AI + Whisper） =====
echo "注入 Nginx 代理块..."

CRAWL4AI_BLOCK='
    # LSJY Crawl4AI managed block
    location ^~ /api/v1/skills/crawl/ {
        proxy_pass http://127.0.0.1:11235/crawl;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 50m;
    }
    location ^~ /api/v1/skills/crawl-stream/ {
        proxy_pass http://127.0.0.1:11235/crawl/stream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 50m;
    }
    location ^~ /api/v1/skills/screenshot/ {
        proxy_pass http://127.0.0.1:11235/screenshot;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 50m;
    }
'

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

WHISPER_BLOCK='
    # LSJY Whisper managed block
    location ^~ /api/v1/skills/whisper/ {
        proxy_pass http://127.0.0.1:9000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 200m;
    }
'

TABBY_BLOCK='
    # LSJY Tabby managed block
    location ^~ /api/v1/skills/tabby/ {
        proxy_pass http://127.0.0.1:8089/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        client_max_body_size 10m;
    }
'

for conf in /etc/nginx/conf.d/*.conf; do
  [ -f "$conf" ] || continue
  MODIFIED=0

  # 注入 Crawl4AI 代理
  if grep -q "server_name .*api\.lsjyapp\.cn\|server_name .*lsjyapp\.cn" "$conf" && ! grep -q "LSJY Crawl4AI managed block" "$conf"; then
    python3 - "$conf" "$CRAWL4AI_BLOCK" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
block = sys.argv[2]
marker = "    location /api/v1/"
if marker in s:
    s = s.replace(marker, block + "\n" + marker, 1)
else:
    s = s.replace("    location / {", block + "\n    location / {", 1)
p.write_text(s)
PY
    echo "已注入 Crawl4AI 代理：$conf"
    MODIFIED=1
  fi

  # 注入 Matomo 代理
  if grep -q "server_name .*api\.lsjyapp\.cn\|server_name .*lsjyapp\.cn" "$conf" && ! grep -q "LSJY Matomo managed block" "$conf"; then
    python3 - "$conf" "$MATOMO_BLOCK" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
block = sys.argv[2]
marker = "    location /api/v1/"
if marker in s:
    s = s.replace(marker, block + "\n" + marker, 1)
else:
    s = s.replace("    location / {", block + "\n    location / {", 1)
p.write_text(s)
PY
    echo "已注入 Matomo 代理：$conf"
    MODIFIED=1
  fi

  # 注入 Whisper 代理
  if grep -q "server_name .*api\.lsjyapp\.cn\|server_name .*lsjyapp\.cn" "$conf" && ! grep -q "LSJY Whisper managed block" "$conf"; then
    python3 - "$conf" "$WHISPER_BLOCK" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
block = sys.argv[2]
marker = "    location /api/v1/"
if marker in s:
    s = s.replace(marker, block + "\n" + marker, 1)
else:
    s = s.replace("    location / {", block + "\n    location / {", 1)
p.write_text(s)
PY
    echo "已注入 Whisper 代理：$conf"
    MODIFIED=1
  fi

  # 注入 Tabby 代理
  if grep -q "server_name .*api\.lsjyapp\.cn\|server_name .*lsjyapp\.cn" "$conf" && ! grep -q "LSJY Tabby managed block" "$conf"; then
    python3 - "$conf" "$TABBY_BLOCK" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
block = sys.argv[2]
marker = "    location /api/v1/"
if marker in s:
    s = s.replace(marker, block + "\n" + marker, 1)
else:
    s = s.replace("    location / {", block + "\n    location / {", 1)
p.write_text(s)
PY
    echo "已注入 Tabby 代理：$conf"
    MODIFIED=1
  fi

  if [ "$MODIFIED" = "1" ]; then
    nginx -t && nginx -s reload || true
  fi
done

# ===== 准备 .env =====
if [ ! -f .env ]; then
  cat > .env <<'EOF'
MATOMO_DB_ROOT_PASSWORD=lsjy_matomo_root_2026
MATOMO_DB_NAME=matomo
MATOMO_DB_USER=matomo
MATOMO_DB_PASSWORD=lsjy_matomo_2026
CRAWL4AI_API_TOKEN=lsjy_crawl4ai_2026_secret
WHISPER_ENGINE=faster_whisper
WHISPER_MODEL=base
TABBY_MODEL=TabbyML/StarCoder-1B
TABBY_PARALLELISM=1
EOF
  chmod 600 .env
fi

# ===== 拉取镜像并启动 =====
echo "拉取镜像..."
if ! $COMPOSE pull 2>&1; then
  echo "DockerHub 拉取失败，切换公共镜像前缀重试..."
  for prefix in "docker.m.daocloud.io/library" "docker.1panel.live/library" "docker.1ms.run/library"; do
    echo "尝试镜像前缀：$prefix"
    cp docker-compose.yml docker-compose.yml.bak
    sed -i "s#image: matomo:5-apache#image: ${prefix}/matomo:5-apache#g" docker-compose.yml
    sed -i "s#image: mariadb:10.11#image: ${prefix}/mariadb:10.11#g" docker-compose.yml
    sed -i "s#image: chromadb/chroma:latest#image: ${prefix%/library}/chromadb/chroma:latest#g" docker-compose.yml
    sed -i "s#image: unclecode/crawl4ai:latest#image: ${prefix}/unclecode/crawl4ai:latest#g" docker-compose.yml
    sed -i "s#image: onerahmet/openai-whisper-asr-webservice:latest#image: ${prefix}/onerahmet/openai-whisper-asr-webservice:latest#g" docker-compose.yml
    sed -i "s#image: tabbyml/tabby:latest#image: ${prefix}/tabbyml/tabby:latest#g" docker-compose.yml
    if $COMPOSE pull 2>&1; then
      break
    fi
    mv docker-compose.yml.bak docker-compose.yml
  done
fi

# 旧版 docker-compose 在重建 Apache 镜像时可能触发 ContainerConfig 异常，先清理旧容器
docker ps -a --format '{{.Names}}' | grep 'lsjy-matomo' | xargs -r docker rm -f || true
$COMPOSE up -d 2>&1 || true

# ===== 健康检查 =====
echo ""
echo "=== 健康检查 ==="

# Matomo
echo -n "Matomo: "
MATOMO_OK=0
for i in $(seq 1 12); do
  if curl -fsS --max-time 5 http://127.0.0.1:8088/ >/dev/null 2>&1; then
    echo "✅ 已启动 (127.0.0.1:8088)"
    MATOMO_OK=1
    break
  fi
  sleep 5
done
[ "$MATOMO_OK" != "1" ] && echo "⚠️ 未就绪"

# Chroma
echo -n "Chroma向量库: "
curl -fsS --max-time 5 http://127.0.0.1:8008/api/v1/heartbeat >/dev/null 2>&1 && echo "✅ 已启动 (127.0.0.1:8008)" || echo "⚠️ 未就绪"

# Crawl4AI
echo -n "Crawl4AI爬虫: "
CRAWL4AI_OK=0
for i in $(seq 1 12); do
  if curl -fsS --max-time 5 -H "X-Token: lsjy_crawl4ai_2026_secret" http://127.0.0.1:11235/health >/dev/null 2>&1; then
    echo "✅ 已启动 (127.0.0.1:11235)"
    CRAWL4AI_OK=1
    break
  fi
  sleep 5
done
[ "$CRAWL4AI_OK" != "1" ] && echo "⚠️ 未就绪"

# Whisper
echo -n "Whisper语音识别: "
WHISPER_OK=0
for i in $(seq 1 30); do
  if curl -fsS --max-time 5 http://127.0.0.1:9000/ >/dev/null 2>&1; then
    echo "✅ 已启动 (127.0.0.1:9000)"
    WHISPER_OK=1
    break
  fi
  sleep 5
done
[ "$WHISPER_OK" != "1" ] && echo "⚠️ 未就绪（模型下载可能需要更长时间）"

# Tabby
echo -n "Tabby编程助手: "
TABBY_OK=0
for i in $(seq 1 30); do
  if curl -fsS --max-time 5 http://127.0.0.1:8089/ >/dev/null 2>&1; then
    echo "✅ 已启动 (127.0.0.1:8089)"
    TABBY_OK=1
    break
  fi
  sleep 5
done
[ "$TABBY_OK" != "1" ] && echo "⚠️ 未就绪（模型下载可能需要更长时间）"

echo ""
echo "所有容器状态："
$COMPOSE ps 2>&1 || true
echo ""
echo "=== Skill 服务部署完成 ==="
exit 0
