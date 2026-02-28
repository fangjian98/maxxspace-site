import type { DataAdapter } from "../dataService";
import type { SiteConfig, Category, LinkItem, BlogPost, PageContent, Moment } from "@/types";
import type { SectionType } from "@/contexts/BookmarksContext";
import { createSupabaseClient } from "./supabase";
import type { SupabaseConfig } from "./supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export class SupabaseAdapter implements DataAdapter {
  private client: SupabaseClient<Database> | any;

  constructor(clientOrConfig: SupabaseClient<any> | SupabaseConfig) {
    if ('auth' in clientOrConfig) {
      this.client = clientOrConfig;
    } else {
      this.client = createSupabaseClient(clientOrConfig as SupabaseConfig);
    }
  }

  async init(): Promise<void> {
    // No-op for Supabase
  }

  async getData(): Promise<SiteConfig> {
    // Force ANY cast on client to bypass strict type checking for Database schema
    const client = this.client as any;

    const [
      { data: config },
      { data: pages },
      { data: categories },
      { data: links },
      { data: posts },
      { data: moments },
      { data: favorites }
    ] = await Promise.all([
      client.from('site_config').select('*').single(),
      client.from('pages').select('*'),
      client.from('categories').select('*').order('sort_order'),
      client.from('links').select('*').order('sort_order'),
      client.from('posts').select('*').order('published_at', { ascending: false }),
      client.from('moments').select('*').order('created_at', { ascending: false }),
      client.from('favorites').select('link_id')
    ]);

    const result: SiteConfig = {
      metaTitle: config?.meta_title || "Maxx Space",
      title: config?.title || "Maxx Space",
      subtitle: config?.subtitle || "",
      logoText: config?.logo_text || "Maxx.",
      logoIcon: config?.logo_icon || "M",
      copyright: config?.copyright || "",
      categories: [],
      projectCategories: [],
      toolCategories: [],
      posts: [],
      moments: [],
      homePage: undefined,
      websitesPage: undefined,
      aboutPage: undefined,
      projectsPage: undefined,
      toolsPage: undefined,
      blogPage: undefined,
      momentsPage: undefined,
      favorites: favorites?.map((f: any) => f.link_id) || []
    };

    pages?.forEach((p: any) => {
      const pageContent: PageContent = { 
        title: p.title, 
        subtitle: p.subtitle || undefined, 
        content: p.content || "",
        searchHint: p.search_hint || undefined 
      };
      if (p.slug === 'home') result.homePage = pageContent;
      if (p.slug === 'websites') result.websitesPage = pageContent;
      if (p.slug === 'projects') result.projectsPage = pageContent;
      if (p.slug === 'tools') result.toolsPage = pageContent;
      if (p.slug === 'about') result.aboutPage = pageContent;
      if (p.slug === 'blog') result.blogPage = pageContent;
      if (p.slug === 'moments') result.momentsPage = pageContent;
    });

    const mapCategory = (c: any): Category => ({
      id: c.id,
      title: c.title,
      icon: c.icon || undefined,
      items: links?.filter((l: any) => l.category_id === c.id).map((l: any) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        description: l.description || undefined,
        icon: l.icon || undefined,
        tags: l.tags || [],
        isFeatured: l.is_featured || false // Map is_featured
      })) || []
    });

    categories?.forEach((c: any) => {
      if (c.section === 'home') result.categories.push(mapCategory(c));
      if (c.section === 'projects') result.projectCategories.push(mapCategory(c));
      if (c.section === 'tools') result.toolCategories.push(mapCategory(c));
    });

    result.posts = posts?.map((p: any) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt || "",
      content: p.content || "",
      date: p.published_at || new Date().toISOString(),
      coverImage: p.cover_image || undefined,
      tags: p.tags || [],
      isFeatured: p.is_featured || false // Map is_featured
    })) || [];

    result.moments = moments?.map((m: any) => ({
      id: m.id,
      content: m.content,
      type: m.type,
      // Map images from DB (text[]) to typescript property
      images: m.images || (m.media_url ? [m.media_url] : []), 
      mediaUrl: m.media_url || undefined, // Keep for backward compat if needed, but UI should prefer images
      linkUrl: m.link_url || undefined,
      date: m.created_at
    })) || [];

    return result;
  }

  async addCategory(title: string, icon: string, section: SectionType): Promise<Category> {
    const client = this.client as any;
    const { data, error } = await client.from('categories').insert({
      title,
      icon,
      section
    }).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      icon: data.icon,
      items: []
    };
  }

  async deleteCategory(id: string, section: SectionType): Promise<void> {
    const client = this.client as any;
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  async editCategory(id: string, updates: Partial<Category>, section: SectionType): Promise<void> {
    const client = this.client as any;
    const { error } = await client.from('categories').update({
      title: updates.title,
      icon: updates.icon
    }).eq('id', id);
    if (error) throw error;
  }

  async addLink(categoryId: string, link: Omit<LinkItem, "id">, section: SectionType): Promise<LinkItem> {
    const client = this.client as any;
    const { data, error } = await client.from('links').insert({
      category_id: categoryId,
      title: link.title,
      url: link.url,
      description: link.description,
      icon: link.icon,
      tags: link.tags,
      is_featured: link.isFeatured
    }).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      url: data.url,
      description: data.description,
      icon: data.icon,
      tags: data.tags,
      isFeatured: data.is_featured
    };
  }

  async deleteLink(categoryId: string, linkId: string, section: SectionType): Promise<void> {
    const client = this.client as any;
    const { error } = await client.from('links').delete().eq('id', linkId);
    if (error) throw error;
  }

  async editLink(categoryId: string, linkId: string, updates: Partial<LinkItem>, section: SectionType): Promise<void> {
    const client = this.client as any;
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.url) payload.url = updates.url;
    if (updates.description) payload.description = updates.description;
    if (updates.tags) payload.tags = updates.tags;
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;

    const { error } = await client.from('links').update(payload).eq('id', linkId);
    if (error) throw error;
  }

  async addPost(post: Omit<BlogPost, "id">): Promise<BlogPost> {
    const client = this.client as any;
    const { data, error } = await client.from('posts').insert({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.coverImage,
      tags: post.tags,
      published_at: post.date,
      is_featured: post.isFeatured
    }).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.cover_image,
      tags: data.tags,
      date: data.published_at,
      isFeatured: data.is_featured
    };
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<void> {
    const client = this.client as any;
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.excerpt) payload.excerpt = updates.excerpt;
    if (updates.content) payload.content = updates.content;
    if (updates.coverImage) payload.cover_image = updates.coverImage;
    if (updates.tags) payload.tags = updates.tags;
    if (updates.date) payload.published_at = updates.date;
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;

    const { error } = await client.from('posts').update(payload).eq('id', id);
    if (error) throw error;
  }

  async deletePost(id: string): Promise<void> {
    const client = this.client as any;
    const { error } = await client.from('posts').delete().eq('id', id);
    if (error) throw error;
  }

  async addMoment(moment: Omit<Moment, "id">): Promise<Moment> {
    const client = this.client as any;
    const { data, error } = await client.from('moments').insert({
      content: moment.content,
      type: moment.type,
      media_url: moment.images?.[0] || moment.mediaUrl,
      images: moment.images,
      link_url: moment.linkUrl,
      created_at: moment.date
    }).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      content: data.content,
      type: data.type,
      images: data.images,
      mediaUrl: data.media_url,
      linkUrl: data.link_url,
      date: data.created_at
    };
  }

  async editMoment(id: string, updates: Partial<Moment>): Promise<void> {
    const client = this.client as any;
    const payload: any = {};
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.linkUrl !== undefined) payload.link_url = updates.linkUrl;
    if (updates.date !== undefined) payload.created_at = updates.date;
    if (updates.images !== undefined) {
      payload.images = updates.images;
      // Sync legacy column just in case
      payload.media_url = updates.images[0] || null;
    }

    await client.from('moments').update(payload).eq('id', id);
  }

  async deleteMoment(id: string): Promise<void> {
    const client = this.client as any;
    await client.from('moments').delete().eq('id', id);
  }

  async updateSettings(settings: Partial<SiteConfig>): Promise<void> {
    const client = this.client as any;
    const configPayload: any = {};
    if (settings.metaTitle) configPayload.meta_title = settings.metaTitle;
    if (settings.logoText) configPayload.logo_text = settings.logoText;
    if (settings.logoIcon) configPayload.logo_icon = settings.logoIcon;
    if (settings.copyright) configPayload.copyright = settings.copyright;
    
    if (Object.keys(configPayload).length > 0) {
      const { error } = await client.from('site_config').update(configPayload).eq('id', 1);
      if (error) throw error;
    }

    const updatePage = async (slug: string, page?: PageContent) => {
      if (!page) return;
      const { error } = await client.from('pages').upsert({
        slug,
        title: page.title,
        subtitle: page.subtitle,
        content: page.content,
        search_hint: page.searchHint
      }, { onConflict: 'slug' });
      if (error) throw error;
    };

    if (settings.homePage) await updatePage('home', settings.homePage);
    if (settings.websitesPage) await updatePage('websites', settings.websitesPage);
    if (settings.projectsPage) await updatePage('projects', settings.projectsPage);
    if (settings.toolsPage) await updatePage('tools', settings.toolsPage);
    if (settings.aboutPage) await updatePage('about', settings.aboutPage);
    if (settings.blogPage) await updatePage('blog', settings.blogPage);
    if (settings.momentsPage) await updatePage('moments', settings.momentsPage);
  }

  async resetData(): Promise<void> {
    console.warn("Reset data not fully implemented for remote DB safety");
  }

  async toggleFavorite(linkId: string): Promise<boolean> {
    const client = this.client as any;
    const { data: existing } = await client.from('favorites')
      .select('id')
      .eq('link_id', linkId)
      .eq('user_id', (await client.auth.getUser()).data.user?.id)
      .single();

    if (existing) {
      await client.from('favorites').delete().eq('id', existing.id);
      return false;
    } else {
      await client.from('favorites').insert({
        link_id: linkId,
        user_id: (await client.auth.getUser()).data.user?.id
      });
      return true;
    }
  }

  async importData(data: SiteConfig): Promise<void> {
    const client = this.client as any;
    await client.from('site_config').upsert({
      id: 1,
      meta_title: data.metaTitle,
      logo_text: data.logoText,
      logo_icon: data.logoIcon,
      copyright: data.copyright
    } as any);

    const pages = [
      { slug: 'home', ...data.homePage },
      { slug: 'websites', ...data.websitesPage },
      { slug: 'projects', ...data.projectsPage },
      { slug: 'tools', ...data.toolsPage },
      { slug: 'about', ...data.aboutPage },
      { slug: 'blog', ...data.blogPage },
      { slug: 'moments', ...data.momentsPage },
    ].filter(p => p.title);

    for (const p of pages) {
      await client.from('pages').upsert({
        slug: p.slug,
        title: p.title!,
        subtitle: p.subtitle,
        content: p.content,
        search_hint: (p as any).searchHint
      } as any);
    }

    await client.from('links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('moments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const insertSection = async (section: SectionType, cats: Category[]) => {
      for (const cat of cats) {
        const { data: catData } = await client.from('categories').insert({
          section,
          title: cat.title,
          icon: cat.icon
        }).select().single();
        
        if (catData) {
          if (cat.items.length > 0) {
            await client.from('links').insert(cat.items.map((l: any) => ({
              category_id: catData.id,
              title: l.title,
              url: l.url,
              description: l.description,
              icon: l.icon,
              tags: l.tags,
              is_featured: l.isFeatured // Support import with featured
            })));
          }
        }
      }
    };

    await insertSection('home', data.categories);
    await insertSection('projects', data.projectCategories);
    await insertSection('tools', data.toolCategories);

    if (data.posts.length > 0) {
      await client.from('posts').insert(data.posts.map((p: any) => ({
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        cover_image: p.coverImage,
        tags: p.tags,
        published_at: p.date,
        is_featured: p.isFeatured // Support import with featured
      })));
    }

    if (data.moments && data.moments.length > 0) {
      await client.from('moments').insert(data.moments.map((m: any) => ({
        content: m.content,
        type: m.type,
        media_url: m.images?.[0] || m.mediaUrl,
        images: m.images,
        link_url: m.linkUrl,
        created_at: m.date
      })));
    }
  }
}
