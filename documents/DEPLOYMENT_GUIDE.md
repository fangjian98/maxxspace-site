# 项目部署指南

本文档详细介绍了如何使用 Docker 和 Nginx 将前端项目部署到云服务器。

## 目录

- [Dockerfile 详解](#dockerfile-详解)
- [Nginx 配置详解](#nginx-配置详解)
- [手动部署流程](#手动部署流程)
- [常见问题](#常见问题)

---

## Dockerfile 详解

### 完整配置

```dockerfile
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY dist/ /usr/share/nginx/html/

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 逐行解析

#### 1. `FROM nginx:alpine`

- **作用**: 指定基础镜像
- **为什么选择 alpine**:
  - 体积小（约 5MB vs 标准版 140MB）
  - 安全性高，攻击面小
  - 适合生产环境的静态资源服务
- **替代方案**:
  ```dockerfile
  FROM nginx:latest          # 标准版本，功能完整
  FROM nginx:stable-alpine   # 稳定版 alpine
  ```

#### 2. `COPY nginx.conf /etc/nginx/nginx.conf`

- **作用**: 将自定义 Nginx 配置复制到容器内
- **路径说明**:
  - 源路径: 项目根目录的 `nginx.conf`
  - 目标路径: 容器内的 Nginx 默认配置路径
- **为什么需要自定义**: 默认配置不支持 SPA 路由和优化

#### 3. `COPY dist/ /usr/share/nginx/html/`

- **作用**: 复制构建后的静态文件到容器
- **路径说明**:
  - 源路径: 项目构建输出目录 `dist/`
  - 目标路径: Nginx 默认的静态文件目录
- **前提条件**: 必须先执行 `npm run build` 生成 dist 目录

#### 4. `EXPOSE 80`

- **作用**: 声明容器监听的端口
- **注意**: 
  - 这只是文档声明，不会实际打开端口
  - 真正的端口映射在 `docker run -p` 参数中指定
- **多端口场景**:
  ```dockerfile
  EXPOSE 80 443  # 同时暴露 HTTP 和 HTTPS
  ```

#### 5. `CMD ["nginx", "-g", "daemon off;"]`

- **作用**: 容器启动时执行的命令
- **参数说明**:
  - `nginx`: 启动 Nginx 服务
  - `-g "daemon off;"`: 以前台方式运行（Docker 容器必须前台运行）
- **替代方案**:
  ```dockerfile
  ENTRYPOINT ["nginx"]
  CMD ["-g", "daemon off;"]
  ```

### 优化建议

#### 多阶段构建（推荐用于 CI/CD）

```dockerfile
# Stage 1: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: 生产镜像
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**优势**:
- 最终镜像不包含 Node.js 和源代码
- 镜像体积更小（约 10MB vs 200MB）
- 构建和运行环境分离

#### 添加健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

---

## Nginx 配置详解

### 完整配置

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA 路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 核心配置解析

#### 1. 全局配置

```nginx
worker_processes auto;
```

- **作用**: 工作进程数
- `auto`: 自动检测 CPU 核心数
- **性能优化**: 多进程处理并发请求

#### 2. 事件模块

```nginx
events {
    worker_connections 1024;
}
```

- **worker_connections**: 每个工作进程的最大连接数
- **理论并发数**: `worker_processes × worker_connections`
- **推荐值**: 1024-4096（根据服务器配置调整）

#### 3. HTTP 全局配置

```nginx
http {
    include       /etc/nginx/mime.types;     # MIME 类型映射
    default_type  application/octet-stream;  # 默认文件类型
    
    sendfile        on;      # 零拷贝技术，提升性能
    keepalive_timeout  65;   # 长连接超时时间
}
```

#### 4. Gzip 压缩（性能优化关键）

```nginx
gzip on;                              # 开启压缩
gzip_vary on;                         # 添加 Vary 头
gzip_min_length 1024;                 # 最小压缩大小（字节）
gzip_proxied expired no-cache no-store private auth;  # 代理压缩策略
gzip_types text/plain text/css ...;   # 压缩的文件类型
```

**效果**:
- JS/CSS 文件压缩率约 60-70%
- 显著减少传输时间
- 提升首屏加载速度

#### 5. 服务器配置

```nginx
server {
    listen 80;                        # 监听端口
    server_name localhost;            # 域名/IP
    root /usr/share/nginx/html;       # 静态文件根目录
    index index.html;                 # 默认首页
}
```

#### 6. 静态资源缓存策略

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;                                    # 过期时间 1 年
    add_header Cache-Control "public, immutable";  # 缓存策略
}
```

**缓存策略说明**:
- `public`: 可以被任何缓存（CDN、浏览器）存储
- `immutable`: 资源永不改变（适合带 hash 的文件名）
- `expires 1y`: 强缓存 1 年

**为什么可以设置 1 年？**
- Vite/Rollup 构建的文件名带 hash：`app.abc123.js`
- 文件内容变化 → hash 变化 → 文件名变化
- 浏览器会请求新文件，旧缓存自动失效

#### 7. SPA 路由支持（最关键配置）

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**工作原理**:
1. 用户访问 `/about`
2. Nginx 尝试查找 `/about` 文件（不存在）
3. 尝试查找 `/about/` 目录（不存在）
4. 返回 `/index.html`
5. 前端路由接管，渲染 `/about` 页面

**为什么需要这个？**
- SPA 只有一个 `index.html`
- 刷新或直接访问子路由时，服务器会 404
- `try_files` 确保所有路由都返回 `index.html`

### 高级配置

#### HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... 其他配置
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 反向代理 API

```nginx
location /api/ {
    proxy_pass http://backend-service:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

#### 安全头配置

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;           # 防止点击劫持
add_header X-Content-Type-Options "nosniff" always;       # 防止 MIME 嗅探
add_header X-XSS-Protection "1; mode=block" always;       # XSS 保护
add_header Content-Security-Policy "default-src 'self'";  # CSP 策略
```

---

## 手动部署流程

### 前提条件

- 云服务器（已安装 Docker）
- 项目代码
- 域名（可选，用于 HTTPS）

### 完整部署步骤

#### 步骤 1: 本地构建

```bash
# 1. 安装依赖
pnpm install

# 2. 构建项目
pnpm build

# 3. 验证构建产物
ls dist/
# 应该看到: assets/ index.html manifest.json ...
```

#### 步骤 2: 上传文件到服务器

**方式 A: 使用 SCP**

```bash
# 上传整个项目
scp -r ./dist Dockerfile nginx.conf user@your-server-ip:/root/maxx-space/

# 或者只上传必要文件
scp -r ./dist user@your-server-ip:/root/maxx-space/
scp Dockerfile nginx.conf user@your-server-ip:/root/maxx-space/
```

**方式 B: 使用 Git**

```bash
# 在服务器上
ssh user@your-server-ip
cd /root
git clone https://github.com/yourusername/maxx-space.git
cd maxx-space
```

#### 步骤 3: 在服务器上构建 Docker 镜像

```bash
# SSH 登录服务器
ssh user@your-server-ip

# 进入项目目录
cd /root/maxx-space

# 构建 Docker 镜像
docker build -t maxx-space:latest .

# 查看镜像
docker images | grep maxx-space
```

#### 步骤 4: 运行 Docker 容器

```bash
# 停止并删除旧容器（如果存在）
docker stop maxx-space 2>/dev/null || true
docker rm maxx-space 2>/dev/null || true

# 运行新容器
docker run -d \
  --name maxx-space \
  -p 80:80 \
  --restart unless-stopped \
  maxx-space:latest

# 查看容器状态
docker ps | grep maxx-space
```

**参数说明**:
- `-d`: 后台运行
- `--name maxx-space`: 容器名称
- `-p 80:80`: 端口映射（主机:容器）
- `--restart unless-stopped`: 自动重启策略

#### 步骤 5: 验证部署

```bash
# 检查容器状态
docker ps

# 查看容器日志
docker logs maxx-space

# 测试访问
curl http://localhost

# 从浏览器访问
# http://your-server-ip
```

#### 步骤 6: 配置防火墙（如需要）

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# 腾讯云轻量应用服务器（使用控制台或 API）
# 参考: https://cloud.tencent.com/document/product/1207/64573
```

### 使用 Docker Compose（推荐）

#### 1. 创建 `docker-compose.yml`

```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: maxx-space
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

#### 2. 部署命令

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### CI/CD 自动化部署

#### GitHub Actions 示例

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build project
        run: pnpm build
        
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /root/maxx-space
            git pull origin main
            docker-compose down
            docker-compose up -d --build
```

---

## 常见问题

### 1. 刷新页面 404

**原因**: Nginx 未配置 SPA 路由支持

**解决**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. 静态资源加载失败

**原因**: 路径问题或缓存配置错误

**解决**:
- 确保 `vite.config.ts` 中 `base` 配置正确
- 检查 Nginx 缓存头配置

### 3. 容器无法启动

**排查步骤**:
```bash
# 查看容器日志
docker logs maxx-space

# 检查端口占用
netstat -tlnp | grep :80

# 验证配置文件
docker run --rm maxx-space:latest nginx -t
```

### 4. 性能优化建议

1. **启用 Gzip 压缩**: 减少 60-70% 传输大小
2. **配置浏览器缓存**: 减少重复请求
3. **使用 CDN**: 加速静态资源访问
4. **启用 HTTP/2**: 提升并发性能
5. **配置负载均衡**: 多实例部署（适用于高并发）

### 5. 安全建议

1. **配置 HTTPS**: 使用 Let's Encrypt 免费证书
2. **添加安全头**: 防止 XSS、点击劫持等攻击
3. **限制请求大小**: `client_max_body_size`
4. **隐藏版本号**: `server_tokens off;`
5. **定期更新镜像**: `docker pull nginx:alpine`

---

## 部署检查清单

- [ ] 本地构建成功（`pnpm build`）
- [ ] Dockerfile 配置正确
- [ ] Nginx 配置正确（SPA 路由、Gzip、缓存）
- [ ] 文件已上传到服务器
- [ ] Docker 镜像构建成功
- [ ] 容器正常运行（`docker ps`）
- [ ] 防火墙端口已开放
- [ ] 浏览器可以访问
- [ ] 页面路由正常（刷新不 404）
- [ ] 静态资源加载正常

---

## 附录

### 常用 Docker 命令

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器日志
docker logs <container_name>
docker logs -f <container_name>  # 实时查看

# 进入容器
docker exec -it <container_name> sh

# 停止容器
docker stop <container_name>

# 删除容器
docker rm <container_name>

# 删除镜像
docker rmi <image_name>

# 清理未使用的资源
docker system prune -a
```

### 常用 Nginx 命令

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 停止服务
nginx -s stop

# 查看版本
nginx -v
```

---

## 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Let's Encrypt 免费证书](https://letsencrypt.org/)
