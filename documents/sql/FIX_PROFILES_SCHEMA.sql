-- Fix: Add created_at column to profiles table
-- 修复：向 profiles 表添加 created_at 列，解决 "column profiles.created_at does not exist" 错误

alter table public.profiles 
add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- Backfill existing rows with updated_at time if available
-- 填充现有数据
update public.profiles 
set created_at = updated_at 
where created_at is null;
