-- Ensure 'pages' table exists
create table if not exists public.pages (
  slug text primary key,
  title text not null,
  subtitle text,
  content text,
  search_hint text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.pages enable row level security;

-- Create policies (drop existing to avoid conflicts if re-running)
drop policy if exists "Allow public read access" on public.pages;
create policy "Allow public read access" on public.pages for select using (true);

drop policy if exists "Allow admin all access" on public.pages;
create policy "Allow admin all access" on public.pages for all using (is_admin());

-- Insert default rows if not exist
insert into public.pages (slug, title, subtitle, content)
values 
  ('home', 'TechNav Hub', 'Curated resources for developers & designers', ''),
  ('about', '关于本站', '了解更多关于 TechNav Hub 的信息', '你好！我是 TechNav Hub 的创建者。\n\n我热衷于收集和分享高质量的开发者资源。\n\n### 联系方式\n- Email: example@example.com'),
  ('websites', '精选网站导航', '为您整理的高质量开发者资源与设计灵感', ''),
  ('projects', '我的项目', '精选的开源项目与实验性作品集合', ''),
  ('tools', '开发者工具箱', '提升效率的在线工具与生产力神器', ''),
  ('blog', '技术博客', '分享技术心得与生活感悟', ''),
  ('moments', '动态', '记录当下的想法与灵感', '')
on conflict (slug) do nothing;
