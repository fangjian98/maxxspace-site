# Maxx Space 项目解析文档

## 一、项目概述

**项目名称**: Maxx Space (技术导航网站)  
**项目类型**: 技术导航网站 / 资源聚合平台 / 轻量级 CMS  
**项目版本**: 0.0.0  
**在线预览**: https://tech-nav-hub.vercel.app

---

## 二、技术栈

### 2.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.0 | UI 框架 |
| **React DOM** | 19.2.0 | DOM 操作 |
| **TypeScript** | ~5.9.3 | 类型安全 |
| **Vite** | 7.2.4 | 构建工具 |
| **Tailwind CSS** | 4.1.18 | 样式系统 |

### 2.2 路由与状态管理

| 技术 | 版本 | 用途 |
|------|------|------|
| **wouter** | ^3.9.0 | 轻量级路由 (Hash 模式) |
| **React Context** | 内置 | 全局状态管理 |

### 2.3 UI 组件库

| 库 | 数量 | 用途 |
|---|------|------|
| **Radix UI** | 54 | 无头组件 (shadcn/ui 风格) |
| **Lucide React** | 0.563.0 | 图标系统 |
| **Framer Motion** | ^12.29.0 | 动画效果 |
| **Embla Carousel** | ^8.6.0 | 轮播组件 |

### 2.4 数据层

| 技术 | 用途 |
|------|------|
| **@supabase/supabase-js** | 云端 PostgreSQL 数据库 |
| **LocalStorage** | 本地离线数据存储 |
| **Zod** | 表单验证 |

### 2.5 表单与验证

| 技术 | 用途 |
|------|------|
| **react-hook-form** | 表单状态管理 |
| **@hookform/resolvers** | Zod 解析器 |
| **zod** | Schema 验证 |

### 2.6 其他工具

| 技术 | 版本 | 用途 |
|------|------|------|
| **date-fns** | 4.1.0 | 日期处理 |
| **nanoid** | 5.1.6 | ID 生成 |
| **recharts** | 3.7.0 | 图表展示 |
| **cmdk** | 1.1.1 | 命令面板 |
| **sonner** | 2.0.7 | Toast 通知 |
| **axios** | 1.13.3 | HTTP 客户端 |
| **react-resizable-panels** | 2.1.9 | 可调整面板 |
| **react-hook-form** | 7.71.1 | 表单管理 |
| **zod** | 4.3.6 | Schema 验证 |
| **input-otp** | 1.4.2 | OTP 输入组件 |
| **vaul** | 1.1.2 | 抽屉组件 |
| **tw-animate-css** | 1.4.0 | CSS 动画 |

---

## 三、目录结构

```
maxx-space/
├── index.html                     # 入口 HTML
├── package.json                   # 项目配置
├── pnpm-lock.yaml                 # 锁文件
├── tsconfig.json                  # TS 根配置
├── tsconfig.app.json              # TS 应用配置
├── tsconfig.node.json             # TS 节点配置
├── vite.config.ts                 # Vite 配置
├── components.json                # shadcn/ui 配置
├── eslint.config.js               # ESLint 配置

# 文档
├── documents/
│   ├── sql/                       # 数据库迁移脚本
│   ├── ARCHITECTURE.md            # 架构文档
│   ├── DATABASE_OPTIONS.md        # 数据库选项
│   └── SUPABASE_SETUP.md          # Supabase 配置指南

# 公共资源
├── public/
│   ├── favicon.svg               # 网站图标
│   ├── manifest.json             # PWA 清单
│   └── sw.js                     # Service Worker

# 数据库迁移脚本
├── documents/sql/
│   ├── UPDATE_SCHEMA.sql              # 数据库表结构
│   ├── INIT_PAGES.sql                 # 初始化页面数据
│   ├── SETUP_PUBLIC_ACCESS.sql        # RLS 策略
│   ├── UPDATE_RLS_FOR_ADMIN.sql       # 管理员权限
│   ├── ADD_FEATURED_COLUMN.sql         # 精选功能
│   ├── FIX_PROFILES_SCHEMA.sql         # 用户表修复
│   ├── UPDATE_SCHEMA_MOMENTS.sql      # 动态表 v1
│   ├── UPDATE_SCHEMA_MOMENTS_V2.sql   # 动态表 v2
│   └── ADD_FAVORITES.sql              # 收藏功能

# 源码目录
├── src/
│   ├── main.tsx                   # React 入口
│   ├── App.tsx                    # 根组件 + 路由
│   ├── index.css                  # 全局样式
│   ├── types.ts                   # TypeScript 类型定义
│   │
│   ├── assets/                    # 静态资源
│   │   ├── hero-banner.jpeg
│   │   ├── liquid-glass-bg.jpeg
│   │   └── page-bg.jpeg
│   │
│   ├── components/                # UI 组件
│   │   ├── ui/                    # 基础 UI 组件 (54个)
│   │   │   ├── accordion.tsx      # 手风琴
│   │   │   ├── alert-dialog.tsx  # 警告对话框
│   │   │   ├── alert.tsx          # 提示框
│   │   │   ├── aspect-ratio.tsx  # 宽高比
│   │   │   ├── avatar.tsx        # 头像
│   │   │   ├── badge.tsx         # 标签
│   │   │   ├── breadcrumb.tsx    # 面包屑
│   │   │   ├── button.tsx        # 按钮
│   │   │   ├── button-group.tsx  # 按钮组
│   │   │   ├── calendar.tsx      # 日历
│   │   │   ├── card.tsx          # 卡片
│   │   │   ├── carousel.tsx      # 轮播
│   │   │   ├── chart.tsx         # 图表
│   │   │   ├── checkbox.tsx      # 复选框
│   │   │   ├── collapsible.tsx   # 可折叠
│   │   │   ├── command.tsx       # 命令面板
│   │   │   ├── context-menu.tsx  # 右键菜单
│   │   │   ├── dialog.tsx        # 对话框
│   │   │   ├── drawer.tsx        # 抽屉
│   │   │   ├── dropdown-menu.tsx # 下拉菜单
│   │   │   ├── empty.tsx         # 空状态
│   │   │   ├── field.tsx         # 表单字段
│   │   │   ├── form.tsx          # 表单
│   │   │   ├── hover-card.tsx    # 悬停卡片
│   │   │   ├── input.tsx         # 输入框
│   │   │   ├── input-group.tsx  # 输入组
│   │   │   ├── input-otp.tsx    # OTP 输入
│   │   │   ├── item.tsx          # 列表项
│   │   │   ├── kbd.tsx          # 键盘按键
│   │   │   ├── label.tsx         # 标签
│   │   │   ├── menubar.tsx       # 菜单栏
│   │   │   ├── native-select.tsx # 原生选择器
│   │   │   ├── navigation-menu.tsx # 导航菜单
│   │   │   ├── pagination.tsx    # 分页
│   │   │   ├── popover.tsx       # 弹出框
│   │   │   ├── progress.tsx      # 进度条
│   │   │   ├── radio-group.tsx  # 单选组
│   │   │   ├── resizable.tsx     # 可调整大小
│   │   │   ├── scroll-area.tsx  # 滚动区域
│   │   │   ├── select.tsx        # 选择器
│   │   │   ├── separator.tsx     # 分隔线
│   │   │   ├── sheet.tsx         # 侧边栏
│   │   │   ├── sidebar.tsx       # 侧边栏
│   │   │   ├── skeleton.tsx      # 骨架屏
│   │   │   ├── slider.tsx        # 滑块
│   │   │   ├── sonner.tsx       # 通知组件
│   │   │   ├── spinner.tsx       # 加载中
│   │   │   ├── switch.tsx        # 开关
│   │   │   ├── table.tsx        # 表格
│   │   │   ├── tabs.tsx          # 标签页
│   │   │   ├── textarea.tsx     # 文本域
│   │   │   ├── toast.tsx         # Toast
│   │   │   ├── toggle.tsx       # 切换
│   │   │   ├── toggle-group.tsx # 切换组
│   │   │   ├── tooltip.tsx       # 提示
│   │   │   └── sonner.tsx       # 通知组件
│   │   │
│   │   ├── admin/                 # 管理后台组件
│   │   │   ├── DatabaseSettings.tsx  # 数据库设置
│   │   │   ├── ManageBlog.tsx        # 博客管理
│   │   │   ├── ManageContent.tsx     # 内容管理
│   │   │   ├── ManageMoments.tsx     # 动态管理
│   │   │   ├── ManagePages.tsx       # 页面管理
│   │   │   ├── ManageUsers.tsx       # 用户管理
│   │   │   ├── SectionManager.tsx    # 分类管理
│   │   │   └── SiteSettings.tsx      # 站点设置
│   │   │
│   │   ├── BlogCard.tsx           # 博客卡片
│   │   ├── CategorySection.tsx    # 分类区域
│   │   ├── CompactHeader.tsx     # 紧凑头部
│   │   ├── ErrorBoundary.tsx     # 错误边界
│   │   ├── FeaturedSection.tsx   # 精选区域
│   │   ├── Footer.tsx             # 页脚
│   │   ├── GlobalSearch.tsx       # 全局搜索
│   │   ├── Hero.tsx               # 首屏
│   │   ├── LinkCard.tsx           # 链接卡片
│   │   ├── MobileBottomNav.tsx    # 移动端底部导航
│   │   ├── Navbar.tsx             # 导航栏
│   │   └── ThemeToggle.tsx        # 主题切换
│   │
│   ├── contexts/                  # React Context
│   │   ├── AuthContext.tsx       # 用户认证
│   │   ├── BookmarksContext.tsx  # 核心数据状态
│   │   └── ThemeContext.tsx       # 主题切换
│   │
│   ├── data/                      # 初始数据
│   │   └── bookmarks.json        # 默认书签数据
│   │
│   ├── hooks/                     # 自定义 Hooks
│   │   └── use-mobile.ts          # 移动端检测
│   │
│   ├── lib/                       # 工具函数与服务
│   │   ├── db/
│   │   │   ├── localAdapter.ts    # 本地存储适配器
│   │   │   ├── supabaseAdapter.ts # 云端数据库适配器
│   │   │   ├── supabase.ts        # Supabase 客户端
│   │   │   ├── types.ts           # 数据库类型
│   │   │   └── ADD_FAVORITES.sql  # 收藏功能 SQL
│   │   ├── dataService.ts         # 数据服务
│   │   ├── supabaseConfig.ts      # Supabase 配置
│   │   ├── tagUtils.ts            # 标签工具
│   │   └── utils.ts               # 通用工具
│   │
│   └── pages/                     # 页面组件
│       ├── About.tsx              # 关于页
│       ├── Admin.tsx              # 管理后台
│       ├── BlogList.tsx           # 博客列表
│       ├── BlogPost.tsx           # 博客详情
│       ├── Favorites.tsx          # 收藏页
│       ├── Home.tsx               # 首页
│       ├── Login.tsx              # 登录页
│       ├── Moments.tsx           # 动态页
│       ├── NotFound.tsx           # 404 页面
│       ├── Profile.tsx            # 个人资料
│       ├── Projects.tsx          # 项目页
│       ├── Tags.tsx               # 标签页
│       ├── Tools.tsx              # 工具页
│       └── Websites.tsx          # 网站导航
```

---

## 四、核心数据类型

### 4.1 类型定义 (`src/types.ts`)

```typescript
// 链接项目
interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;      // Lucide icon name or image URL
  tags?: string[];
  isFeatured?: boolean;
}

// 分类
interface Category {
  id: string;
  title: string;
  icon?: string;      // Lucide icon name
  items: LinkItem[];
}

// 博客文章
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;       // Markdown
  date: string;          // ISO date string
  coverImage?: string;
  tags?: string[];
  isFeatured?: boolean;
}

// 动态类型
type MomentType = 'text' | 'link' | 'image';

// 动态 (类似 Twitter/微博)
interface Moment {
  id: string;
  content: string;
  type: MomentType;
  images?: string[];     // Supports multiple images (base64 or url)
  mediaUrl?: string;    // Deprecated: backward compatibility
  linkUrl?: string;      // For link type
  date: string;          // ISO date string
}

// 页面内容
interface PageContent {
  title: string;
  subtitle?: string;     // Subtitle or description
  content: string;      // Markdown
  searchHint?: string;  // Search placeholder text
}

// 站点配置
interface SiteConfig {
  metaTitle: string;    // Browser tab title
  title: string;        // Deprecated: use homePage.title
  subtitle: string;     // Deprecated: use homePage.subtitle
  logoText: string;     // Navbar brand name
  logoIcon: string;     // Navbar brand initial/icon
  copyright: string;    // Footer copyright text

  // Navigation Sections
  categories: Category[];
  projectCategories: Category[];
  toolCategories: Category[];

  posts: BlogPost[];
  moments: Moment[];

  // Custom Pages
  homePage?: PageContent;
  websitesPage?: PageContent;
  aboutPage?: PageContent;
  projectsPage?: PageContent;
  toolsPage?: PageContent;
  blogPage?: PageContent;
  momentsPage?: PageContent;
  favorites?: string[];  // List of favorited link IDs
}

// 用户资料
interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}
```

---

## 五、数据库设计

### 5.1 表结构

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| **site_config** | 站点全局配置 | meta_title, logo_text, categories JSON |
| **pages** | 自定义页面内容 | slug, title, subtitle, content, search_hint |
| **categories** | 资源分类 | id, title, icon, type |
| **links** | 链接项目 | id, title, url, description, category_id |
| **posts** | 博客文章 | id, title, excerpt, content, date, is_featured |
| **moments** | 动态内容 | id, content, type, images, link_url, date |
| **favorites** | 用户收藏 | id, user_id, link_id, created_at |

### 5.2 RLS 策略

```sql
-- 公开读取策略
CREATE POLICY "Allow public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.links FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.moments FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.pages FOR SELECT USING (true);

-- 管理员完全访问
CREATE POLICY "Allow admin all access" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "Allow admin all access" ON public.links FOR ALL USING (is_admin());
CREATE POLICY "Allow admin all access" ON public.posts FOR ALL USING (is_admin());
CREATE POLICY "Allow admin all access" ON public.moments FOR ALL USING (is_admin());
CREATE POLICY "Allow admin all access" ON public.pages FOR ALL USING (is_admin());
```

---

## 六、核心功能模块

### 6.1 首页导航 (Home)
- 四宫格快速入口 (网站/项目/工具/博客)
- 精选内容展示 (Featured Section)
- 分类浏览
- 全局搜索

### 6.2 资源导航
| 页面 | 功能 |
|------|------|
| **Websites** | 精选网站导航 |
| **Projects** | 开源项目展示 |
| **Tools** | 开发者工具箱 |
| **Tags** | 标签聚合浏览 |

支持功能:
- 添加/编辑/删除分类
- 添加/编辑/删除链接
- 链接收藏

### 6.3 博客系统 (Blog)
- Markdown 内容渲染
- 标签系统
- 精选文章标记
- 文章列表/详情页

### 6.4 动态系统 (Moments)
- 类似 Twitter/微博的微内容
- 支持三种类型: `text` | `link` | `image`
- 时间线展示

### 6.5 管理后台 (Admin)
| 组件 | 功能 |
|------|------|
| **SectionManager** | 分类管理 (增删改) |
| **ManageContent** | 链接管理 |
| **ManageBlog** | 博客文章管理 |
| **ManageMoments** | 动态管理 |
| **ManagePages** | 自定义页面管理 |
| **ManageUsers** | 用户管理 |
| **SiteSettings** | 站点配置 |
| **DatabaseSettings** | 数据库设置 |

### 6.6 用户系统
- 登录/注册 (Supabase Auth)
- 个人收藏夹
- 收藏同步 (本地 + 云端)

---

## 七、架构设计

### 7.1 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                            │
│  (Pages: Home, Websites, Blog, Admin...)                   │
│  (Components: Navbar, Cards, Forms...)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  BookmarksContext                           │
│  (统一的数据访问层 + 缓存管理)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              DataAdapter Interface                          │
│                    (适配器模式)                              │
│  - loadData(): Promise<SiteConfig>                         │
│  - saveData(config: SiteConfig): Promise│  - add<void>             │
Link/link, updateLink, deleteLink...                 │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼────────────────────────┐
│   LocalAdapter     │  │    SupabaseAdapter              │
│   (本地模式)        │  │    (云端模式)                    │
│                     │  │                                 │
│ - LocalStorage     │  │ - Supabase PostgreSQL           │
│ - bookmarks.json   │  │ - RLS 策略                       │
│ - 离线可用         │  │ - 实时同步                       │
└───────────────────┘  └───────────────────────────────────┘
```

### 7.2 路由结构 (Hash 模式)

```
/#/                    → Home
/#/websites           → Websites
/#/tags               → Tags
/#/tools              → Tools
/#/blog               → BlogList
/#/blog/:id           → BlogPost
/#/moments            → Moments
/#/projects           → Projects
/#/about              → About
/#/login              → Login
/#/profile            → Profile
/#/favorites          → Favorites
/#/admin              → Admin
```

### 7.3 组件层级

```
App
├── ErrorBoundary
├── ThemeProvider
│   └── AuthProvider
│       └── BookmarksProvider
│           └── TooltipProvider
│               ├── Toaster
│               └── Router (wouter)
│                   ├── Home
│                   ├── Websites
│                   ├── Tags
│                   ├── Tools
│                   ├── BlogList / BlogPost
│                   ├── Moments
│                   ├── Projects
│                   ├── About
│                   ├── Login
│                   ├── Profile
│                   ├── Favorites
│                   └── Admin
│                       ├── SectionManager
│                       ├── ManageContent
│                       ├── ManageBlog
│                       ├── ManageMoments
│                       ├── ManagePages
│                       ├── ManageUsers
│                       ├── SiteSettings
│                       └── DatabaseSettings
```

---

## 八、配置说明

### 8.1 环境变量

```env
# Supabase 配置 (可选)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 8.2 shadcn/ui 配置 (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### 8.3 TypeScript 配置

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

### 8.4 Vite 配置

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## 九、运行指南

### 9.1 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 9.2 开发模式

```bash
# 启动开发服务器
pnpm dev
# 或
npm run dev
# 或
yarn dev
```

访问: http://localhost:5173

### 9.3 构建生产版本

```bash
# 构建
pnpm build
# 或
npm run build
```

输出目录: `dist/`

### 9.4 预览构建结果

```bash
pnpm preview
# 或
npm run preview
```

### 9.5 代码检查

```bash
pnpm lint
# 或
npm run lint
```

---

## 十、Debug 指南

### 10.1 常见问题

#### 问题1: 样式不生效
- 检查 `src/index.css` 是否正确引入
- 确认 Tailwind CSS v4 配置正确
- 清除浏览器缓存

#### 问题2: Supabase 连接失败
- 检查环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 确认 Supabase 项目状态正常
- 检查 RLS 策略配置

#### 问题3: 路由跳转问题
- 确认使用 Hash 模式 (`/#/path`)
- 检查 wouter 配置

#### 问题4: 数据不显示
- 检查 LocalStorage 数据
- 确认数据适配器配置
- 查看浏览器控制台错误

### 10.2 调试技巧

```typescript
// 在浏览器控制台查看数据状态
// BookmarksContext 暴露了以下方法:
const { data, loading, error, reload } = useBookmarks()

// 强制刷新数据
reload()

// 查看本地存储
console.log(localStorage.getItem('site-config'))
```

### 10.3 React DevTools

1. 安装 React DevTools 浏览器扩展
2. 查看组件层级和状态
3. 检查 Context 值

### 10.4 网络请求

- 浏览器 Network 面板查看 Supabase 请求
- 检查请求 Headers 和 Response
- 确认 RLS 策略生效

---

## 十一、NPM 脚本

| 脚本 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器 (端口 5173) |
| `pnpm build` | 构建生产版本 |
| `pnpm lint` | ESLint 代码检查 |
| `pnpm preview` | 本地预览构建结果 |

---

## 十二、项目亮点

1. **混合数据架构**: 支持本地离线使用和云端同步
2. **模块化 CMS**: 内容分类管理、博客系统、动态发布
3. **现代技术栈**: React 19 + TypeScript + Tailwind CSS v4
4. **完善的管理后台**: CRUD 全功能
5. **适配器模式**: 便于切换本地/云端数据源
6. **Hash 路由**: 支持 file:// 协议直接打开
7. **响应式设计**: 适配多端设备，包含移动端底部导航
8. **54 个 UI 组件**: 基于 Radix UI 的高质量组件
9. **PWA 支持**: 包含 Service Worker 和 Web App Manifest
10. **命令面板**: 内置 CMD+K 全局搜索
