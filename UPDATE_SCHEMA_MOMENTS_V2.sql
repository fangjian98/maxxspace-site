-- Migration: Add images array column to moments table
-- 迁移：向 moments 表添加 images 数组列，支持多图上传

-- 1. Add new column 'images' of type text array
alter table public.moments 
add column if not exists images text[];

-- 2. Migrate existing data from 'media_url' to 'images'
-- If media_url exists, put it as the first element of images array
update public.moments 
set images = array[media_url] 
where media_url is not null and (images is null or array_length(images, 1) is null);

-- 3. (Optional) Drop media_url column in future, but keeping it for now for backward compatibility is safer
-- alter table public.moments drop column media_url;
