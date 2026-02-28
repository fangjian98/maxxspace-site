# Supabase Database Setup Guide

To enable persistent cloud storage and authentication for TechNav Hub, follow the steps below.

## 1. Create a Supabase Project

1.  Go to [database.new](https://database.new) and create a new project.
2.  Once your project is ready, go to **Project Settings** -> **API**.
3.  Copy the **Project URL** and **anon public key**.

## 2. Initialize Database Schema & Auth

Go to the **SQL Editor** in your Supabase dashboard, create a new query, and run the following SQL script. This will set up the tables, authentication triggers, and security policies.

### Core Schema (Run this first)

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Auth & Profiles Setup
-- ==========================================

-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  nickname text,
  avatar_url text,
  is_admin boolean default false,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nickname, avatar_url, is_admin)
  values (
    new.id, 
    new.email, 
    split_part(new.email, '@', 1), -- Default nickname from email
    '',
    false -- Default to regular user
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- 2. Content Tables Setup
-- ==========================================

-- Site Config
create table if not exists site_config (
  id integer primary key default 1,
  meta_title text,
  title text,
  subtitle text,
  logo_text text,
  logo_icon text,
  copyright text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Pages Content (Ensures About, Home, etc. are stored in DB)
create table if not exists pages (
  slug text primary key,
  title text not null,
  subtitle text,
  content text,
  search_hint text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Categories
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  section text not null,
  title text not null,
  icon text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Links
create table if not exists links (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  icon text,
  tags text[],
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Blog Posts
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  excerpt text,
  content text,
  cover_image text,
  tags text[],
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Moments
create table if not exists public.moments (
  id uuid primary key default uuid_generate_v4(),
  content text,
  type text not null, -- 'text', 'link', 'image'
  media_url text, -- Deprecated, use images
  images text[], 
  link_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 3. Row Level Security (Access Control)
-- ==========================================

alter table site_config enable row level security;
alter table pages enable row level security;
alter table categories enable row level security;
alter table links enable row level security;
alter table posts enable row level security;
alter table moments enable row level security;

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- Policies for Site Config
create policy "Allow public read access" on site_config for select using (true);
create policy "Allow admin update access" on site_config for update using (is_admin());
create policy "Allow admin insert access" on site_config for insert with check (is_admin());

-- Policies for Pages
create policy "Allow public read access" on pages for select using (true);
create policy "Allow admin all access" on pages for all using (is_admin());

-- Policies for Categories
create policy "Allow public read access" on categories for select using (true);
create policy "Allow admin all access" on categories for all using (is_admin());

-- Policies for Links
create policy "Allow public read access" on links for select using (true);
create policy "Allow admin all access" on links for all using (is_admin());

-- Policies for Posts
create policy "Allow public read access" on posts for select using (true);
create policy "Allow admin all access" on posts for all using (is_admin());

-- Policies for Moments
create policy "Allow public read access" on moments for select using (true);
create policy "Allow admin all access" on moments for all using (is_admin());

-- Initialize default data
insert into site_config (id, meta_title, title, subtitle, logo_text, logo_icon, copyright)
values (1, 'TechNav Hub', 'TechNav Hub', 'Curated resources for developers', 'TechNav.', 'N', '© TechNav Hub')
on conflict (id) do nothing;

insert into pages (slug, title, subtitle, content)
values 
  ('home', 'TechNav Hub', 'Curated resources for developers & designers', ''),
  ('about', '关于本站', '了解更多关于 TechNav Hub 的信息', '你好！我是 TechNav Hub 的创建者。\n\n我热衷于收集和分享高质量的开发者资源。\n\n### 联系方式\n- Email: example@example.com'),
  ('websites', '精选网站导航', '为您整理的高质量开发者资源与设计灵感', ''),
  ('projects', '我的项目', '精选的开源项目与实验性作品集合', ''),
  ('tools', '开发者工具箱', '提升效率的在线工具与生产力神器', ''),
  ('blog', '技术博客', '分享技术心得与生活感悟', ''),
  ('moments', '动态', '记录当下的想法与灵感', '')
on conflict (slug) do nothing;
```

## 3. Create Admin User

Since user creation involves password hashing, the secure way to create an admin is:

1.  **Sign Up** via the website interface (once you deploy the updated version) with your desired email (e.g., `admin@technav.com`) and password.
2.  **Promote to Admin**: Go back to the **SQL Editor** in Supabase and run this command to grant admin privileges:

```sql
-- Replace with your email
update public.profiles
set is_admin = true
where email = 'admin@technav.com';
```

## 4. Connect TechNav Hub

1.  Open your TechNav Hub website.
2.  Click **Login** in the top right corner.
3.  Sign in with your admin account.
4.  Go to **Admin Dashboard** -> **Database** (or Settings).
5.  Enter your **Project URL** and **API Key**.
6.  Click **"Connect Database"**.
