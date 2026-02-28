# TechNav Hub 架构设计说明文档

TechNav Hub 是一个采用现代技术栈构建的资源导航平台，具备混合数据架构（Local + Cloud）、模块化内容管理系统和响应式设计。本文档旨在详细说明项目的技术架构、数据流转机制及扩展开发指南。

## 1. 技术栈概览 (Tech Stack)

### 核心框架
- **React 19**: 采用最新的 React 特性，使用 Hooks 进行状态管理。
- **TypeScript**: 全面类型安全，定义了严格的接口（`src/types.ts`）。
- **Vite**: 高性能构建工具，支持秒级热更新。

### 路由与状态
- **wouter**: 轻量级路由库，无需复杂配置，支持 Hash 路由模式（便于纯静态部署）。
- **Context API**: 
  - `BookmarksContext`: 核心数据状态管理（书签、博客、动态、配置）。
  - `AuthContext`: 用户认证状态管理（登录、注册、角色权限）。
  - `ThemeContext`: 明亮/深色主题切换。

### UI 系统
- **Tailwind CSS v4**: 原子化 CSS 引擎，支持深色模式变体。
- **shadcn/ui (Radix UI)**: 无头组件库封装，提供无障碍交互体验（Tabs, Dialog, Dropdown 等）。
- **Lucide React**: 统一的图标系统。

### 数据持久化
- **Hybrid Adapter Pattern**: 混合适配器模式，支持本地存储与云端数据库无缝切换。
- **LocalStorage**: 默认数据源，无需后端即可运行。
- **Supabase (PostgreSQL)**: 可选云端数据源，支持多端同步与权限控制。

---

## 2. 系统架构设计

### 2.1 目录结构
```bash
src/
├── assets/          # 静态资源 (图片)
├── components/      # UI 组件
│   ├── admin/       # 管理后台专用组件 (ManageContent, ManageBlog, ManageMoments...)
│   └── ui/          # 通用基础组件 (Button, Input, Card...)
├── contexts/        # React Contexts (全局状态)
├── data/            # 初始数据源 (bookmarks.json)
├── lib/             # 工具函数与服务
│   ├── db/          # 数据库适配层 (LocalAdapter, SupabaseAdapter)
│   └── utils.ts     # 通用工具
├── pages/           # 页面级组件 (Home, Websites, Blog, Moments...)
└── types.ts         # TypeScript 类型定义
```

### 2.2 数据流架构 (Data Flow)

系统采用 **适配器模式 (Adapter Pattern)** 来屏蔽底层数据源的差异。

```mermaid
graph TD
    UI[Frontend UI] --> Context[BookmarksContext]
    Context --> Adapter{DataAdapter Interface}
    
    Adapter -->|User / Guest| Local[LocalAdapter]
    Adapter -->|Admin (Optional)| Cloud[SupabaseAdapter]
    
    Local -->|Read/Write| LS[(LocalStorage)]
    Local -->|Init| JSON[bookmarks.json]
    
    Cloud -->|Read/Write| DB[(Supabase PostgreSQL)]
```

*   **BookmarksContext**: 作为统一的数据访问层，向上层 UI 提供 `addLink`, `deletePost`, `updateSettings` 等业务方法。
*   **DataAdapter**: 定义了标准的数据操作接口（CRUD）。
*   **LocalAdapter**: 操作 `bookmarks.json` 的内存副本，并持久化到浏览器 `LocalStorage`。
*   **SupabaseAdapter**: 通过 `supabase-js` 与云端 PostgreSQL 进行交互。

### 2.3 权限控制 (RBAC)

基于 Supabase Auth 和 RLS (Row Level Security) 实现权限管理。

*   **Guest (访客)**: 
    *   读取：默认读取本地数据，若配置了 Supabase Key 则读取云端数据。
    *   写入：无权限。
*   **User (普通用户)**:
    *   读取：读取本地数据。
    *   写入：仅操作本地数据（LocalStorage），用于个人收藏管理。
*   **Admin (管理员)**:
    *   读取：优先连接 Supabase 读取线上数据。
    *   写入：直接操作 Supabase 数据库，变更对所有访客可见。

---

## 3. 核心功能模块

### 3.1 动态 (Moments)
*   **定位**: 类似 Twitter/微博 的微内容发布系统。
*   **数据结构**: `Moment` { id, content, type, mediaUrl, linkUrl, date }
*   **类型支持**: 纯文本、链接卡片、图片。
*   **存储**:
    *   图片支持 Base64 本地存储（Local 模式）或 URL 引用。
    *   数据存储在 `moments` 表 (Supabase) 或 JSON 数组 (Local)。

### 3.2 博客 (Blog)
*   **定位**: 长文内容发布系统。
*   **特性**: 
    *   支持 Markdown 渲染 (`streamdown` 库)。
    *   自动生成时间轴归档。
    *   支持封面图和标签系统。

### 3.3 资源导航 (Resources)
*   **分类**: 网站 (Websites)、工具 (Tools)、项目 (Projects)。
*   **层级**: Section (板块) -> Category (分类) -> LinkItem (链接)。
*   **展示**: 四宫格首页导航 + 独立的分类 Tab 页面。

---

## 4. 扩展开发指南

### 如何添加一个新的数据板块？

假设要添加一个 "书籍 (Books)" 板块：

1.  **定义类型**:
    在 `src/types.ts` 中，更新 `SiteConfig` 接口，添加 `bookCategories: Category[]`。

2.  **更新数据库**:
    *   **Local**: 在 `src/data/bookmarks.json` 中添加 `bookCategories: []`。
    *   **Supabase**: 在 `categories` 表中，使用 `section = 'books'` 来区分。

3.  **更新适配器**:
    *   修改 `LocalAdapter` 中的 `getSectionKey` 方法，映射 `'books'` 到 `bookCategories`。
    *   修改 `SupabaseAdapter` 中的 `getData` 和 `importData` 方法，增加对 `books` section 的处理。

4.  **更新 Context**:
    在 `BookmarksContext` 的 `SectionType` 类型定义中添加 `'books'`。

5.  **创建页面**:
    复制 `src/pages/Websites.tsx` 为 `Books.tsx`，将数据源改为 `data.bookCategories`。

6.  **注册路由**:
    在 `src/App.tsx` 和 `src/components/Navbar.tsx` 中添加 `/books` 路由入口。

7.  **管理后台**:
    在 `src/pages/Admin.tsx` 中添加新的 Tab，调用 `<SectionManager section="books" title="书籍" />`。

---

## 5. 维护与部署

### 数据库迁移
所有数据库变更脚本均保存在项目根目录：
*   `SUPABASE_SETUP.md`: 初始数据库结构与 RLS 策略。
*   `UPDATE_SCHEMA.sql`: 后续增量更新脚本（如添加 search_hint）。
*   `UPDATE_SCHEMA_MOMENTS.sql`: 动态模块数据库脚本。

### 环境变量
项目支持通过 `.env` 文件配置默认的 Supabase 连接信息：
*   `VITE_SUPABASE_URL`
*   `VITE_SUPABASE_ANON_KEY`

若未配置环境变量，管理员也可在后台手动输入连接信息（保存在 LocalStorage）。
