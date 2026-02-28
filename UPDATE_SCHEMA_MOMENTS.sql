-- Create moments table
create table if not exists public.moments (
  id uuid primary key default uuid_generate_v4(),
  content text,
  type text not null, -- 'text', 'link', 'image'
  media_url text,
  link_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.moments enable row level security;

-- Create policies for moments
create policy "Allow public read access" on public.moments for select using (true);
create policy "Allow admin all access" on public.moments for all using (is_admin());

-- Insert default Moments Page content into pages table
insert into pages (slug, title, subtitle, content)
values ('moments', '动态', '记录当下的想法与灵感', '')
on conflict (slug) do nothing;
