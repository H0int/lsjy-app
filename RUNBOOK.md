# 前端恢复 Runbook

> 罗圣纪元平台前端部署失败回滚指南
> 适用范围：Vite + Vue 3 前端应用，GitHub Pages 发布 + ECS Nginx 静态文件同步
> 域名：`lsjyapp.cn`（GitHub Pages CNAME）| ECS：`root@47.97.166.219`

---

## 负责人

| 角色 | 负责人 | 职责 |
|------|--------|------|
| 部署运维 | 前端开发运维人员 (GitHub: h0int) | 执行回滚、重新触发 CI/CD、验证页面 |
| 技术决策 | 祁阳市罗圣纪元互联网科技有限责任公司 技术负责人 | 确认回滚决策、评估用户影响 |

> 联系方式：请在此填写实际联系电话 / 企微账号

---

## 部署流程概览

1. **CI/CD 触发**：GitHub Actions `deploy.yml`（仅手动触发 `workflow_dispatch`）
2. **安装依赖**：`npm ci --legacy-peer-deps`
3. **构建**：`npx vite build`（跳过类型检查，环境变量 `VITE_API_BASE_URL=https://api.lsjyapp.cn/api/v1`）
4. **后处理**：创建 SPA `404.html`、拷贝 admin 面板和公共资源到 `dist/`
5. **发布**：将 `dist/` 内容覆盖到 `docs/` 目录，写入 `CNAME`（lsjyapp.cn）和 `.nojekyll`
6. **推送**：`git commit` + `git push`，GitHub Pages 自动从 `docs/` 目录发布
7. **ECS 同步**：`deploy-backend.yml` 在后端部署时也会将 `docs/` 同步到 ECS `/usr/share/nginx/html/`

---

## 回滚步骤

### 场景 A：GitHub Pages 前端发布异常（首选方案）

前端通过 GitHub Actions 将构建产物提交到 `docs/` 目录，回滚即撤销该次提交。

```bash
# 1. 进入前端仓库目录
cd KF02/frontend

# 2. 查看最近的部署提交历史
git log --oneline -10 -- docs/

# 3a. 方案一： revert 部署提交（保留历史，推荐）
git revert HEAD --no-edit
git push origin main

# 3b. 方案二：从指定历史版本恢复 docs/ 目录
# 找到上一个正常的提交 hash（替换 <good-commit>）
git checkout <good-commit> -- docs/
git commit -m "rollback: 恢复前端到上一个正常版本"
git push origin main

# 4. 等待 GitHub Pages 自动重新发布（约 1-2 分钟）
# 或手动触发 GitHub Actions: Deploy workflow
```

### 场景 B：构建失败无法发布

构建本身失败，`docs/` 目录未被修改，无需回滚。修复代码后重新触发：

```bash
# 1. 在 GitHub 仓库页面手动触发 Actions → Deploy → Run workflow
#    或使用 GitHub CLI:
gh workflow run deploy.yml --repo h0int/lsjy-app

# 2. 查看工作流执行状态
gh run list --repo h0int/lsjy-app --limit 5
```

### 场景 C：ECS Nginx 静态文件异常

后端 CI/CD (`deploy-backend.yml`) 会将 `docs/` 同步到 ECS。若 ECS 上的前端文件损坏：

```bash
# 1. SSH 登录 ECS
ssh root@47.97.166.219

# 2. 查找后端部署时创建的备份目录
ls -lt /opt/lsjy-app/backup-* | head -5

# 3. 从备份恢复前端静态文件（替换为实际备份目录）
BACKUP_DIR="/opt/lsjy-app/backup-YYYYMMDDHHMMSS"
# 若备份中包含 docs 目录：
rsync -a --delete "$BACKUP_DIR/docs/" /usr/share/nginx/html/
# 若无备份，从 Git 仓库重新拉取：
cd /opt/lsjy-app/frontend && git pull origin main
rsync -a --delete docs/ /usr/share/nginx/html/

# 4. 重载 Nginx
nginx -t && nginx -s reload
```

---

## 验证方法

```bash
# 1. GitHub Pages 前端页面加载
curl -s -o /dev/null -w "%{http_code}" https://lsjyapp.cn
# 期望: 200

# 2. 前端源码检查（不应包含硬编码 API Key）
curl -s https://lsjyapp.cn/index.html | grep -c "ark-"
# 期望: 0

# 3. 管理后台页面加载
curl -s -o /dev/null -w "%{http_code}" https://lsjyapp.cn/admin/
# 期望: 200

# 4. 管理后台安全检查（不应包含默认密码）
curl -s https://lsjyapp.cn/admin/index.html | grep -c "LKZ2005430"
# 期望: 0

# 5. SPA 路由测试（404.html 应返回 index.html 内容）
curl -s -o /dev/null -w "%{http_code}" https://lsjyapp.cn/nonexistent-page
# 期望: 200（SPA 兜底）

# 6. ECS Nginx 前端验证
curl -s -o /dev/null -w "%{http_code}" https://api.lsjyapp.cn/
# 期望: 403（API 域名根路径返回 403 是正常的）

# 7. 前端到后端 API 连通性验证
curl -s https://lsjyapp.cn/index.html | grep -o "api.lsjyapp.cn" | head -1
# 期望: api.lsjyapp.cn（前端正确指向后端 API 地址）
```

**验证通过标准：**
- `https://lsjyapp.cn` 返回 HTTP 200
- 前端源码中不含硬编码 API Key (`ark-` 出现 0 次)
- 管理后台可正常访问（HTTP 200）
- 管理后台不含默认密码（`LKZ2005430` 出现 0 次）
- SPA 路由兜底正常（任意路径返回 200）
- 前端正确指向 `api.lsjyapp.cn` 后端 API

---

## 关键路径速查

| 资源 | 路径 / 地址 |
|------|------------|
| 前端仓库 | `KF02/frontend`（GitHub: h0int/lsjy-app） |
| 构建产物 | `KF02/frontend/dist/` |
| 发布目录 | `KF02/frontend/docs/`（GitHub Pages 源） |
| GitHub Pages URL | `https://lsjyapp.cn` |
| ECS 静态文件 | `/usr/share/nginx/html/` |
| CI/CD 工作流 | `.github/workflows/deploy.yml`（手动触发） |
| 生产环境变量 | `VITE_API_BASE_URL=https://api.lsjyapp.cn/api/v1` |
| CNAME | `docs/CNAME` → `lsjyapp.cn` |
