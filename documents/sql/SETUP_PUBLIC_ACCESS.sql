-- Enable RLS on all tables
alter table site_config enable row level security;
alter table pages enable row level security;
alter table categories enable row level security;
alter table links enable row level security;
alter table posts enable row level security;
alter table moments enable row level security;

-- Allow public read access to all content tables
create policy "Public can view site config" on site_config for select using (true);
create policy "Public can view pages" on pages for select using (true);
create policy "Public can view categories" on categories for select using (true);
create policy "Public can view links" on links for select using (true);
create policy "Public can view posts" on posts for select using (true);
create policy "Public can view moments" on moments for select using (true);

-- Allow authenticated users (admins) to edit content (assuming is_admin check or similar)
-- For simplicity, we can allow authenticated users if we trust all logged-in users,
-- OR better: check against a profiles table if you implemented admin roles.
-- Here we assume logged-in users can edit for now (or you can refine this).
create policy "Authenticated can insert/update/delete" on categories for all using (auth.role() = 'authenticated');
create policy "Authenticated can insert/update/delete" on links for all using (auth.role() = 'authenticated');
create policy "Authenticated can insert/update/delete" on posts for all using (auth.role() = 'authenticated');
create policy "Authenticated can insert/update/delete" on moments for all using (auth.role() = 'authenticated');
create policy "Authenticated can insert/update/delete" on pages for all using (auth.role() = 'authenticated');
create policy "Authenticated can insert/update/delete" on site_config for all using (auth.role() = 'authenticated');

-- Favorites: Users can only manage their own
-- (Already included in ADD_FAVORITES.sql but repeating for clarity if needed)
-- create policy "Users manage own favorites" on favorites for all using (auth.uid() = user_id);
