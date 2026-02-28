import type { DataAdapter } from "../dataService";
import type { SiteConfig, Category, LinkItem, BlogPost, PageContent, Moment } from "@/types";
import type { SectionType } from "@/contexts/BookmarksContext";
import bookmarksData from "@/data/bookmarks.json";
import { nanoid } from "nanoid";
import { hasValidConfig, PROJECT_CONFIG } from "../supabaseConfig";
import { SupabaseAdapter } from "./supabaseAdapter";

const STORAGE_KEY = "maxx-space-data";

export class LocalAdapter implements DataAdapter {
  private data: SiteConfig;

  constructor() {
    this.data = JSON.parse(JSON.stringify(bookmarksData)) as SiteConfig;
  }

  async init(): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration logic
        if (!parsed.posts) parsed.posts = bookmarksData.posts || [];
        if (!parsed.moments) parsed.moments = bookmarksData.moments || [];
        if (!parsed.projectCategories) parsed.projectCategories = bookmarksData.projectCategories || [];
        if (!parsed.toolCategories) parsed.toolCategories = bookmarksData.toolCategories || [];
        
        // Ensure new page fields exist if missing (Deep clone defaults)
        const defaults = JSON.parse(JSON.stringify(bookmarksData));
        if (!parsed.homePage) parsed.homePage = defaults.homePage;
        if (!parsed.websitesPage) parsed.websitesPage = defaults.websitesPage;
        if (!parsed.projectsPage) parsed.projectsPage = defaults.projectsPage;
        if (!parsed.toolsPage) parsed.toolsPage = defaults.toolsPage;
        if (!parsed.aboutPage) parsed.aboutPage = defaults.aboutPage;
        if (!parsed.blogPage) parsed.blogPage = defaults.blogPage;
        if (!parsed.momentsPage) parsed.momentsPage = defaults.momentsPage;

        // Migrate moments mediaUrl to images array if missing
        if (parsed.moments) {
          parsed.moments = parsed.moments.map((m: any) => {
            if (!m.images && m.mediaUrl) {
              return { ...m, images: [m.mediaUrl] };
            }
            if (!m.images) {
              return { ...m, images: [] };
            }
            return m;
          });
        }

        // Migrate featured flag if missing
        if (parsed.posts) {
          parsed.posts = parsed.posts.map((p: any) => ({
            ...p,
            isFeatured: p.isFeatured !== undefined ? p.isFeatured : false
          }));
        }

        const migrateCategories = (categories: any[]) => {
          return categories.map((c: any) => ({
            ...c,
            items: (c.items || []).map((item: any) => ({
              ...item,
              isFeatured: item.isFeatured !== undefined ? item.isFeatured : false
            }))
          }));
        };

        if (parsed.categories) parsed.categories = migrateCategories(parsed.categories);
        if (parsed.projectCategories) parsed.projectCategories = migrateCategories(parsed.projectCategories);
        if (parsed.toolCategories) parsed.toolCategories = migrateCategories(parsed.toolCategories);

        this.data = parsed;
      } else {
        // Try to hydrate from Supabase if config exists
        if (hasValidConfig()) {
          try {
            console.log("Hydrating local data from Supabase...");
            const sbAdapter = new SupabaseAdapter(PROJECT_CONFIG);
            const remoteData = await sbAdapter.getData();
            this.data = JSON.parse(JSON.stringify(remoteData));
            this.persist(); // Save to local storage immediately
            return;
          } catch (e) {
            console.error("Failed to hydrate from Supabase, falling back to json", e);
          }
        }
        this.data = JSON.parse(JSON.stringify(bookmarksData)) as SiteConfig;
      }
    } catch (e) {
      console.error("Failed to load local data", e);
      this.data = JSON.parse(JSON.stringify(bookmarksData)) as SiteConfig;
    }
  }

  private isQuotaExceeded = false;

  private persist() {
    // Redundant persistence removed. 
    // BookmarksContext manages the application state and handles persistence to LocalStorage (as cache).
    // LocalAdapter only needs to maintain in-memory state for the current session.
    // This prevents double-writes and performance issues with large data.
  }

  async getData(): Promise<SiteConfig> {
    return this.data;
  }

  private getSectionKey(section: SectionType = 'home'): keyof Pick<SiteConfig, 'categories' | 'projectCategories' | 'toolCategories'> {
    switch (section) {
      case 'projects': return 'projectCategories';
      case 'tools': return 'toolCategories';
      case 'home':
      default: return 'categories';
    }
  }

  async addCategory(title: string, icon: string, section: SectionType): Promise<Category> {
    const key = this.getSectionKey(section);
    const newCategory: Category = { id: nanoid(), title, icon, items: [] };
    this.data = { ...this.data, [key]: [...this.data[key], newCategory] };
    this.persist();
    return Promise.resolve(newCategory);
  }

  async deleteCategory(id: string, section: SectionType): Promise<void> {
    const key = this.getSectionKey(section);
    this.data = { ...this.data, [key]: this.data[key].filter(c => c.id !== id) };
    this.persist();
  }

  async editCategory(id: string, updates: Partial<Category>, section: SectionType): Promise<void> {
    const key = this.getSectionKey(section);
    this.data = {
      ...this.data,
      [key]: this.data[key].map(c => c.id === id ? { ...c, ...updates } : c)
    };
    this.persist();
  }

  async addLink(categoryId: string, link: Omit<LinkItem, "id">, section: SectionType): Promise<LinkItem> {
    const key = this.getSectionKey(section);
    const newLink = { ...link, id: nanoid() };
    this.data = {
      ...this.data,
      [key]: this.data[key].map(c => c.id === categoryId ? { ...c, items: [newLink, ...c.items] } : c)
    };
    this.persist();
    return Promise.resolve(newLink);
  }

  async deleteLink(categoryId: string, linkId: string, section: SectionType): Promise<void> {
    const key = this.getSectionKey(section);
    this.data = {
      ...this.data,
      [key]: this.data[key].map(c => c.id === categoryId ? { ...c, items: c.items.filter(i => i.id !== linkId) } : c)
    };
    this.persist();
  }

  async editLink(categoryId: string, linkId: string, updates: Partial<LinkItem>, section: SectionType): Promise<void> {
    const key = this.getSectionKey(section);
    this.data = {
      ...this.data,
      [key]: this.data[key].map(c => 
        c.id === categoryId ? { 
          ...c, 
          items: c.items.map(i => i.id === linkId ? { ...i, ...updates } : i) 
        } : c
      )
    };
    this.persist();
  }

  async addPost(post: Omit<BlogPost, "id">): Promise<BlogPost> {
    const newPost = { ...post, id: nanoid() };
    this.data = { ...this.data, posts: [newPost, ...(this.data.posts || [])] };
    this.persist();
    return Promise.resolve(newPost);
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<void> {
    this.data = {
      ...this.data,
      posts: (this.data.posts || []).map(p => p.id === id ? { ...p, ...updates } : p)
    };
    this.persist();
  }

  async deletePost(id: string): Promise<void> {
    this.data = {
      ...this.data,
      posts: (this.data.posts || []).filter(p => p.id !== id)
    };
    this.persist();
  }

  async addMoment(moment: Omit<Moment, "id">): Promise<Moment> {
    const newMoment = { 
      ...moment, 
      id: nanoid(),
      images: moment.images || [] // Ensure images array exists
    };
    this.data = { ...this.data, moments: [newMoment, ...(this.data.moments || [])] };
    this.persist();
    return Promise.resolve(newMoment);
  }

  async editMoment(id: string, updates: Partial<Moment>): Promise<void> {
    this.data = {
      ...this.data,
      moments: (this.data.moments || []).map(m => m.id === id ? { ...m, ...updates } : m)
    };
    this.persist();
  }

  async deleteMoment(id: string): Promise<void> {
    this.data = {
      ...this.data,
      moments: (this.data.moments || []).filter(m => m.id !== id)
    };
    this.persist();
  }

  async updateSettings(settings: Partial<SiteConfig>): Promise<void> {
    this.data = { ...this.data, ...settings };
    this.persist();
  }

  async resetData(): Promise<void> {
    if (hasValidConfig()) {
       try {
          const sbAdapter = new SupabaseAdapter(PROJECT_CONFIG);
          const remoteData = await sbAdapter.getData();
          this.data = JSON.parse(JSON.stringify(remoteData));
       } catch {
          this.data = JSON.parse(JSON.stringify(bookmarksData)) as SiteConfig;
       }
    } else {
       this.data = JSON.parse(JSON.stringify(bookmarksData)) as SiteConfig;
    }
    this.persist();
  }

  async importData(data: SiteConfig): Promise<void> {
    this.data = data;
    this.persist();
  }
}
