# ⚡ Cloudflare Pages 快速配置

## 🎯 最简单的部署方法

### Cloudflare Pages Dashboard 配置

当你在 Cloudflare Pages 中设置项目时，**请使用以下配置**：

```yaml
框架预设 (Framework preset): None

构建配置:
  生产分支 (Production branch): main
  构建命令 (Build command): (留空)
  构建输出目录 (Build output directory): /
  根目录 (Root directory): (留空，使用根目录)
```

### 📋 详细配置截图说明

1. **Framework preset**: 选择 `None`（因为这是纯静态 HTML 项目）

2. **Build command**:
   - **留空** （推荐）
   - 或填写 `npm run build`（只是输出提示信息）

3. **Build output directory**:
   - 填写 `/`（斜杠）
   - 这表示使用项目根目录

4. **Root directory**:
   - 留空
   - 或填写 `/`

---

## ✅ 为什么这样配置？

### 这是一个纯静态项目

- ✅ 不需要 npm install
- ✅ 不需要编译或打包
- ✅ 不需要构建步骤
- ✅ 所有依赖通过 CDN 加载

### 文件结构

```
/                          ← 这是 build output directory
├── index.html            ← 主页面
├── app.js               ← JavaScript
├── orbital-math.js      ← 计算模块
├── README.md            ← 文档
└── ...
```

---

## 🚀 一键部署 (Wrangler CLI)

如果你更喜欢命令行：

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 部署
wrangler pages deploy . --project-name=electron-cloud-visualizer

# 完成！
```

---

## 🔍 验证部署

部署后，打开网站并检查：

- [ ] 页面正常加载（不是空白）
- [ ] 3D 电子云正常渲染
- [ ] 量子数选择器可以点击
- [ ] 2D 截面图显示正常
- [ ] 公式正确渲染
- [ ] 浏览器控制台没有错误

---

## ❌ 常见错误及解决方案

### 错误 1: "Build failed"

**症状**: 部署失败，提示 build 错误

**原因**: Cloudflare 尝试运行构建命令

**解决**:
```yaml
Build command: (完全留空，不要填任何内容)
```

### 错误 2: "404 Not Found"

**症状**: 访问网站显示 404

**原因**: Build output directory 设置错误

**解决**:
```yaml
Build output directory: /
```
注意：是一个斜杠 `/`，不是 `./` 或其他

### 错误 3: "npm: command not found"

**症状**: 构建日志显示找不到 npm

**原因**: 不需要 npm

**解决**:
```yaml
Build command: (留空)
```

### 错误 4: CDN 资源加载失败

**症状**: 页面空白，控制台有 CDN 错误

**原因**: 网络或 CSP 问题

**解决**:
- 检查 `_headers` 文件的 CSP 配置
- 确保所有 CDN 使用 HTTPS

---

## 📊 推荐的 Cloudflare 设置

### 缓存配置

在 Cloudflare Dashboard → Caching 中：

- **Caching Level**: Standard
- **Browser Cache TTL**: Respect Existing Headers
- **Always Online**: ON

### 性能优化

在 Cloudflare Dashboard → Speed 中：

- **Auto Minify**: ✅ HTML, CSS, JavaScript
- **Brotli**: ✅ ON
- **HTTP/2**: ✅ ON
- **HTTP/3 (with QUIC)**: ✅ ON

### 安全设置

- **Always Use HTTPS**: ✅ ON
- **Automatic HTTPS Rewrites**: ✅ ON
- **Security Level**: Medium

---

## 🌐 自定义域名

### 添加自定义域名

1. 在 Cloudflare Pages 项目中点击 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入域名（例如：`electron.yourdomain.com`）
4. 如果域名在 Cloudflare，DNS 会自动配置
5. 等待 SSL 证书生成（1-5 分钟）

### DNS 记录

如果手动配置，添加 CNAME 记录：

```
类型: CNAME
名称: electron (或 @)
内容: electron-cloud-visualizer.pages.dev
代理: 已代理 (橙色云朵)
```

---

## 🔄 自动部署

### Git 集成

每次推送到 GitHub，Cloudflare 自动部署：

```bash
git add .
git commit -m "Update code"
git push origin main
```

### 分支预览

- `main` 分支 → 生产环境
- 其他分支 → 预览环境（自动生成 URL）

---

## 📞 获取帮助

如果遇到问题：

1. **查看构建日志**: Cloudflare Pages → 你的项目 → Deployments → View build log
2. **检查浏览器控制台**: F12 → Console
3. **参考文档**: `DEPLOYMENT.md`（详细文档）

---

## ✨ 预期结果

成功部署后，你会得到：

- 🌐 一个 `.pages.dev` 域名
- 🔒 免费的 HTTPS 证书
- 🚀 全球 CDN 加速
- 📊 访问统计
- 🔄 自动部署

**部署时间**: 通常 1-2 分钟

**费用**: 完全免费（Cloudflare Pages Free Plan）

---

**准备好了吗？开始部署吧！** 🚀
