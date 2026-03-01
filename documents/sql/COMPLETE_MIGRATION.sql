-- =====================================================
-- Maxx Space 完整数据库迁移脚本
-- 项目：技术导航网站 / 资源聚合平台
-- 版本：0.0.0
-- =====================================================

-- 启用 UUID 扩展（如果尚未启用）
-- 用于生成唯一标识符
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 第一部分：创建核心数据表
-- =====================================================

-- -----------------------------------------------------
-- 1. 站点配置表 (site_config)
-- 存储网站的全局配置信息
-- 注意：使用整数 id 以便代码中使用 id=1 进行更新
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_config (
    id integer PRIMARY KEY DEFAULT 1, -- 固定 ID 为 1，代码中使用 id=1 更新
    meta_title text NOT NULL DEFAULT 'Maxx Space',
    title text NOT NULL DEFAULT 'Maxx Space', -- 首页标题（兼容旧版）
    subtitle text NOT NULL DEFAULT '', -- 首页副标题（兼容旧版）
    logo_text text NOT NULL DEFAULT 'Maxx',
    logo_icon text NOT NULL DEFAULT 'M',
    copyright text NOT NULL DEFAULT '© 2024 Maxx Space. All rights reserved.',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 插入默认站点配置
INSERT INTO public.site_config (id, meta_title, title, subtitle, logo_text, logo_icon, copyright)
VALUES (1, 'Maxx Space', 'Maxx Space', '', 'Maxx', 'M', '© 2024 Maxx Space. All rights reserved.')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------
-- 2. 分类表 (categories)
-- 用于组织链接资源的分类
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    icon text,
    section text NOT NULL DEFAULT 'home', -- 'home' | 'projects' | 'tools' 用于区分页面分类
    sort_order integer DEFAULT 0, -- 排序字段
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------
-- 3. 链接表 (links)
-- 存储网站导航的链接项目
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.links (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    url text NOT NULL,
    description text,
    icon text,
    tags text[], -- 标签数组，用于分类和搜索
    is_featured boolean DEFAULT false, -- 精选/推荐标记
    sort_order integer DEFAULT 0, -- 排序字段
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------
-- 4. 博客文章表 (posts)
-- 存储技术博客文章
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    excerpt text,
    content text,
    published_at timestamp with time zone DEFAULT timezone('utc'::text, now()), -- 发布日期
    cover_image text,
    tags text[],
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------
-- 5. 动态表 (moments)
-- 存储类似 Twitter/微博的微内容
-- 支持三种类型：text(纯文本)、link(链接)、image(图片)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content text,
    type text NOT NULL DEFAULT 'text', -- 'text' | 'link' | 'image'
    media_url text, -- 兼容旧版本的单图字段
    link_url text,  -- 链接类型的链接地址
    images text[],  -- 支持多图上传（数组形式存储图片URL或base64）
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) -- 用于排序和显示
);

-- -----------------------------------------------------
-- 6. 页面内容表 (pages)
-- 存储各页面的自定义内容
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pages (
    slug text PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    content text,
    search_hint text, -- 搜索框的占位符文本
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------
-- 7. 用户资料表 (profiles)
-- 存储用户的个人资料信息
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    nickname text,
    avatar_url text,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------
-- 8. 收藏表 (favorites)
-- 存储用户收藏的链接
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    link_id uuid REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, link_id) -- 防止重复收藏
);

-- =====================================================
-- 第二部分：数据库迁移与字段扩展
-- =====================================================

-- -----------------------------------------------------
-- 迁移：为 profiles 表添加 created_at 字段
-- 修复可能缺失的时间戳字段
-- -----------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 填充现有数据的 created_at 字段
UPDATE public.profiles 
SET created_at = updated_at 
WHERE created_at IS NULL;

-- -----------------------------------------------------
-- 迁移：将 moments 表的 media_url 数据迁移到 images 数组
-- 实现向后兼容的数据迁移
-- -----------------------------------------------------
-- 如果 media_url 存在，将其转换为 images 数组的第一个元素
UPDATE public.moments 
SET images = array[media_url] 
WHERE media_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- =====================================================
-- 第三部分：初始化默认页面数据
-- =====================================================

-- 插入默认页面内容（如果不存在则插入）
INSERT INTO public.pages (slug, title, subtitle, content, search_hint)
VALUES 
    ('home', 'Maxx Space', 'Curated resources for developers & designers', '', NULL),
    ('about', '关于本站', '了解更多关于 Maxx Space 的信息', '你好！我是 Maxx Space 的创建者。\n\n我热衷于收集和分享高质量的开发者资源。\n\n### 联系方式\n- Email: example@example.com', NULL),
    ('websites', '精选网站导航', '为您整理的高质量开发者资源与设计灵感', '', '搜索网站...'),
    ('projects', '我的项目', '精选的开源项目与实验性作品集合', '', '搜索项目...'),
    ('tools', '开发者工具箱', '提升效率的在线工具与生产力神器', '', '搜索工具...'),
    ('blog', '技术博客', '分享技术心得与生活感悟', '', '搜索博客...'),
    ('moments', '动态', '记录当下的想法与灵感', '', '搜索动态...')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 第四部分：行级安全策略 (RLS)
-- =====================================================

-- 启用所有表的行级安全策略
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 公开读取策略（所有用户可查看）
-- -----------------------------------------------------

-- 站点配置：公开可读
DROP POLICY IF EXISTS "Public can view site config" ON public.site_config;
CREATE POLICY "Public can view site config" ON public.site_config FOR SELECT USING (true);

-- 页面内容：公开可读
DROP POLICY IF EXISTS "Public can view pages" ON public.pages;
CREATE POLICY "Public can view pages" ON public.pages FOR SELECT USING (true);

-- 分类：公开可读
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

-- 链接：公开可读
DROP POLICY IF EXISTS "Public can view links" ON public.links;
CREATE POLICY "Public can view links" ON public.links FOR SELECT USING (true);

-- 文章：公开可读
DROP POLICY IF EXISTS "Public can view posts" ON public.posts;
CREATE POLICY "Public can view posts" ON public.posts FOR SELECT USING (true);

-- 动态：公开可读
DROP POLICY IF EXISTS "Public can view moments" ON public.moments;
CREATE POLICY "Public can view moments" ON public.moments FOR SELECT USING (true);

-- -----------------------------------------------------
-- 用户资料策略
-- -----------------------------------------------------

-- 用户可以读取自己的资料
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的资料
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- 用户可以插入自己的资料
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id OR is_admin() = true);

-- 管理员可以读取所有用户资料
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" ON public.profiles 
FOR SELECT USING (is_admin() = true);

-- -----------------------------------------------------
-- 认证用户写入策略
-- 登录用户可以管理内容
-- -----------------------------------------------------

-- 分类：认证用户可增删改
DROP POLICY IF EXISTS "Authenticated can insert/update/delete categories" ON public.categories;
CREATE POLICY "Authenticated can insert/update/delete categories" ON public.categories 
FOR ALL USING (auth.role() = 'authenticated');

-- 链接：认证用户可增删改
DROP POLICY IF EXISTS "Authenticated can insert/update/delete links" ON public.links;
CREATE POLICY "Authenticated can insert/update/delete links" ON public.links 
FOR ALL USING (auth.role() = 'authenticated');

-- 文章：认证用户可增删改
DROP POLICY IF EXISTS "Authenticated can insert/update/delete posts" ON public.posts;
CREATE POLICY "Authenticated can insert/update/delete posts" ON public.posts 
FOR ALL USING (auth.role() = 'authenticated');

-- 动态：认证用户可增删改
DROP POLICY IF EXISTS "Authenticated can insert/update/delete moments" ON public.moments;
CREATE POLICY "Authenticated can insert/update/delete moments" ON public.moments 
FOR ALL USING (auth.role() = 'authenticated');

-- 页面：认证用户可增删改
DROP POLICY IF EXISTS "Authenticated can insert/update/delete pages" ON public.pages;
CREATE POLICY "Authenticated can insert/update/delete pages" ON public.pages 
FOR ALL USING (auth.role() = 'authenticated');

-- 站点配置：认证用户可增删改
DROP POLICY IF EXISTS "Authenticated can insert/update/delete site_config" ON public.site_config;
CREATE POLICY "Authenticated can insert/update/delete site_config" ON public.site_config 
FOR ALL USING (auth.role() = 'authenticated');

-- -----------------------------------------------------
-- 收藏表策略
-- 用户只能查看、添加、删除自己的收藏
-- -----------------------------------------------------

-- 查看自己的收藏
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" ON public.favorites 
FOR SELECT USING (auth.uid() = user_id);

-- 添加自己的收藏
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
CREATE POLICY "Users can insert their own favorites" ON public.favorites 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 删除自己的收藏
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites" ON public.favorites 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 第五部分：管理员权限策略
-- =====================================================

-- -----------------------------------------------------
-- 创建 is_admin() 函数
-- 用于检查当前用户是否为管理员
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    -- 检查用户是否存在于 profiles 表且 is_admin 为 true
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- 管理员完全访问策略
-- 管理员可以完全控制所有内容
-- -----------------------------------------------------

-- 分类：管理员完全访问
DROP POLICY IF EXISTS "Allow admin all access categories" ON public.categories;
CREATE POLICY "Allow admin all access categories" ON public.categories 
FOR ALL USING (is_admin());

-- 链接：管理员完全访问
DROP POLICY IF EXISTS "Allow admin all access links" ON public.links;
CREATE POLICY "Allow admin all access links" ON public.links 
FOR ALL USING (is_admin());

-- 文章：管理员完全访问
DROP POLICY IF EXISTS "Allow admin all access posts" ON public.posts;
CREATE POLICY "Allow admin all access posts" ON public.posts 
FOR ALL USING (is_admin());

-- 动态：管理员完全访问
DROP POLICY IF EXISTS "Allow admin all access moments" ON public.moments;
CREATE POLICY "Allow admin all access moments" ON public.moments 
FOR ALL USING (is_admin());

-- 页面：管理员完全访问
DROP POLICY IF EXISTS "Allow admin all access pages" ON public.pages;
CREATE POLICY "Allow admin all access pages" ON public.pages 
FOR ALL USING (is_admin());

-- 站点配置：管理员完全访问
DROP POLICY IF EXISTS "Allow admin all access site_config" ON public.site_config;
CREATE POLICY "Allow admin all access site_config" ON public.site_config 
FOR ALL USING (is_admin());

-- -----------------------------------------------------
-- 管理员用户管理策略
-- 允许管理员更新和删除用户资料
-- -----------------------------------------------------

-- 允许管理员更新任何用户资料（如提升/降级权限）
DROP POLICY IF EXISTS "Allow admin update all profiles" ON public.profiles;
CREATE POLICY "Allow admin update all profiles" ON public.profiles 
FOR UPDATE USING (is_admin());

-- 允许管理员删除任何用户资料
DROP POLICY IF EXISTS "Allow admin delete all profiles" ON public.profiles;
CREATE POLICY "Allow admin delete all profiles" ON public.profiles 
FOR DELETE USING (is_admin());

-- 注意：从 'public' schema 删除用户资料并不会删除 'auth.users' 中的用户
-- 要完全删除用户，通常需要使用 Supabase Management API（服务端）
-- 但移除用户资料可以有效地禁用其对应用功能的访问

-- =====================================================
-- 第六部分：自动创建用户资料触发器
-- =====================================================

-- 创建触发器：当新用户注册时自动创建资料记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_count integer;
BEGIN
    -- 检查是否是第一个用户（如果是，则设为管理员）
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    INSERT INTO public.profiles (id, email, nickname, is_admin)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
        CASE WHEN user_count = 0 THEN true ELSE false END -- 第一个用户设为管理员
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧的触发器（如果存在）以避免重复
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建新用户注册触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 脚本执行完成
-- =====================================================
