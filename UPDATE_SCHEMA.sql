
-- Update pages table to add search_hint column
alter table pages add column if not exists search_hint text;

-- Optional: Update existing rows with default values (if needed)
update pages set search_hint = '搜索网站...' where slug = 'websites';
update pages set search_hint = '搜索项目...' where slug = 'projects';
update pages set search_hint = '搜索工具...' where slug = 'tools';
