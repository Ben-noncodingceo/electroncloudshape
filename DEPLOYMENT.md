# 🚀 Cloudflare Pages 部署指南

## 方法一：通过 Cloudflare Pages Dashboard 部署（推荐）

### 步骤 1: 连接 Git 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 选项卡
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 Cloudflare 访问你的 GitHub 仓库
6. 选择 `electroncloudshape` 仓库

### 步骤 2: 配置构建设置

在构建配置页面，**使用以下设置**：

```
框架预设 (Framework preset): None
生产分支 (Production branch): main (或你的主分支名称)
构建命令 (Build command): 留空或填写 npm run build
构建输出目录 (Build output directory): /
根目录 (Root directory): /
```

#### ⚠️ 重要配置说明

由于这是一个**纯静态 HTML 项目**，不需要任何构建步骤：

- **Build command**: 留空 或 `npm run build`（会输出提示信息）
- **Build output directory**: `/` （项目根目录）
- **Root directory**: `/` （根目录）

### 步骤 3: 环境变量

**不需要设置任何环境变量** - 项目使用 CDN 加载所有依赖。

### 步骤 4: 部署

1. 点击 **Save and Deploy**
2. 等待部署完成（通常 1-2 分钟）
3. 访问提供的 `.pages.dev` 域名

---

## 方法二：使用 Wrangler CLI 部署

### 前置要求

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 部署命令

```bash
# 在项目根目录运行
wrangler pages deploy . --project-name=electron-cloud-visualizer
```

---

## 配置自定义域名

### 步骤 1: 在 Cloudflare Pages 中

1. 进入你的 Pages 项目
2. 点击 **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入你的域名（例如：`electron-cloud.yourdomain.com`）

### 步骤 2: DNS 配置

Cloudflare 会自动为你配置 DNS 记录（如果域名在 Cloudflare）。

---

## 验证部署

部署完成后，访问你的网站并检查：

- ✅ 3D 电子云是否正常渲染
- ✅ 2D 截面图是否显示
- ✅ LaTeX 公式是否正确渲染
- ✅ 控制器是否响应
- ✅ 浏览器控制台无错误

---

## 常见问题

### ❌ 问题 1: Build 失败

**原因**: Cloudflare Pages 默认尝试运行构建命令

**解决方案**:
- 将 **Build command** 设置为空
- 或使用 `npm run build`（会输出提示信息但不会失败）

### ❌ 问题 2: 页面显示空白

**原因**: CDN 资源加载失败

**解决方案**:
- 检查浏览器控制台
- 确保 CDN 链接可访问
- 所有外部资源都使用 HTTPS

### ❌ 问题 3: Three.js 相关错误

**原因**: OrbitControls 路径问题

**解决方案**:
- 已在 `index.html` 中使用正确的 CDN 链接
- 确保 Three.js 版本一致（r128）

### ❌ 问题 4: 404 错误

**原因**: Build output directory 配置错误

**解决方案**:
- 确保 **Build output directory** 设置为 `/`
- 确保 **Root directory** 设置为 `/`

---

## 性能优化建议

### 1. 启用自动压缩

Cloudflare Pages 自动启用 Brotli 和 Gzip 压缩 ✅

### 2. 启用缓存

Cloudflare 自动缓存静态资源 ✅

### 3. CDN 加速

Cloudflare 全球 CDN 自动加速 ✅

### 4. 建议的 Page Rules

如果需要更精细的控制，可以在 Cloudflare Dashboard 中设置：

- **缓存级别**: Standard
- **浏览器缓存 TTL**: 4 hours
- **自动最小化**: HTML, CSS, JavaScript

---

## 更新部署

### 自动部署（推荐）

每次推送到 GitHub 仓库，Cloudflare Pages 会自动重新部署：

```bash
git add .
git commit -m "Update visualization"
git push
```

### 手动部署

```bash
wrangler pages deploy . --project-name=electron-cloud-visualizer
```

---

## 分支部署

Cloudflare Pages 支持为每个分支创建预览部署：

- **生产环境**: `main` 分支 → `electron-cloud-visualizer.pages.dev`
- **预览环境**: 其他分支 → `<branch>.<project>.pages.dev`

---

## 监控和分析

### 查看部署日志

1. 进入 Cloudflare Pages 项目
2. 点击 **View build log**
3. 查看详细的部署日志

### 查看访问统计

1. 进入 Cloudflare Pages 项目
2. 点击 **Analytics**
3. 查看访问量、请求数等数据

---

## 安全建议

### 1. 启用 HTTPS

Cloudflare Pages 自动提供免费 SSL 证书 ✅

### 2. 设置安全头

可以添加 `_headers` 文件来设置自定义 HTTP 头。

### 3. 防止热链接

如果需要，可以在 Cloudflare 设置中配置 hotlink 保护。

---

## 回滚部署

如果新版本有问题，可以快速回滚：

1. 进入 Cloudflare Pages 项目
2. 点击 **Deployments** 标签
3. 找到之前的成功部署
4. 点击 **Rollback to this deployment**

---

## 获取帮助

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [项目 Issues](https://github.com/Ben-noncodingceo/electroncloudshape/issues)

---

**祝部署顺利！** 🎉

如果遇到问题，请检查上面的常见问题部分，或查看浏览器控制台的错误信息。
