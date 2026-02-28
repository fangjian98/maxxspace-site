-- Add 'is_featured' column to links table
alter table public.links 
add column if not exists is_featured boolean default false;

-- Add 'is_featured' column to posts table
alter table public.posts 
add column if not exists is_featured boolean default false;

-- Update existing rows to have default value (optional, but good practice)
update public.links set is_featured = false where is_featured is null;
update public.posts set is_featured = false where is_featured is null;
