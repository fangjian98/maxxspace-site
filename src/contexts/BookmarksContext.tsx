import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import type { SiteConfig, Category, LinkItem, BlogPost, Moment } from "@/types";
import bookmarksData from "@/data/bookmarks.json";
import { toast } from "sonner";
import { LocalAdapter } from "@/lib/db/localAdapter";
import { SupabaseAdapter } from "@/lib/db/supabaseAdapter";
import type { DataAdapter } from "@/lib/dataService";
import { checkConnection } from "@/lib/db/supabase";
import type { SupabaseConfig } from "@/lib/db/supabase";
import { PROJECT_CONFIG, hasValidConfig } from "@/lib/supabaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export type SectionType = 'home' | 'projects' | 'tools';

interface BookmarksContextType {
  data: SiteConfig;
  isConnected: boolean;
  adapterType: 'local' | 'supabase';
  isLoadingData: boolean;
  
  // Setup
  connectSupabase: (config: SupabaseConfig) => Promise<boolean>;
  disconnectSupabase: () => void;
  syncLocalToRemote: () => Promise<void>;
  importData: (data: SiteConfig) => Promise<void>;

  addCategory: (title: string, icon?: string, section?: SectionType) => Promise<void>;
  deleteCategory: (id: string, section?: SectionType) => Promise<void>;
  editCategory: (id: string, updates: Partial<Omit<Category, "id" | "items">>, section?: SectionType) => Promise<void>;
  addLink: (categoryId: string, link: Omit<LinkItem, "id">, section?: SectionType) => Promise<void>;
  deleteLink: (categoryId: string, linkId: string, section?: SectionType) => Promise<void>;
  editLink: (categoryId: string, linkId: string, updates: Partial<Omit<LinkItem, "id">>, section?: SectionType) => Promise<void>;
  
  // Blog Actions
  addPost: (post: Omit<BlogPost, "id">) => Promise<void>;
  updatePost: (id: string, updates: Partial<BlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;

  // Moments Actions
  addMoment: (moment: Omit<Moment, "id">) => Promise<void>;
  deleteMoment: (id: string) => Promise<void>;
  editMoment: (id: string, updates: Partial<Moment>) => Promise<void>;

  updateSettings: (settings: Partial<SiteConfig>) => Promise<void>;
  resetData: () => Promise<void>;
  
  // Favorites
  toggleFavorite: (linkId: string) => Promise<void>;
  isFavorite: (linkId: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading, supabase: authClient } = useAuth();
  
  // Initialize state from LocalStorage if available to prevent flicker
  const [data, setData] = useState<SiteConfig>(() => {
    try {
      const stored = localStorage.getItem("tech-nav-hub-data");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return bookmarksData as unknown as SiteConfig;
  });
  
  // Persist data to LocalStorage on every update (Debounced)
  const isStorageQuotaExceeded = useRef(false);
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // If we already know quota is exceeded, don't try to save again automatically
    // This prevents UI freezing on every update when storage is full
    if (isStorageQuotaExceeded.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Optimize LocalStorage: Only save lightweight config and structure
        // Exclude heavy content like posts (with base64), moments, and favorites (user specific)
        const lightweightData = {
          ...data,
          posts: [], // Don't cache posts content
          moments: [], // Don't cache moments content
          // Keep categories and links as they are critical for navigation, but maybe we should strip descriptions if too large?
          // For now, removing posts/moments is the biggest win.
        };
        localStorage.setItem("tech-nav-hub-data", JSON.stringify(lightweightData));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
          console.error("LocalStorage quota exceeded.");
          isStorageQuotaExceeded.current = true;
        }
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data]);

  const [adapterType, setAdapterType] = useState<'local' | 'supabase'>('local');
  const [adapter, setAdapter] = useState<DataAdapter>(new LocalAdapter());
  
  // Set initial loading state based on whether we successfully hydrated from localStorage
  const [isLoadingData, setIsLoadingData] = useState(() => {
    // If we have data from localStorage, we are not "loading" in a blocking sense
    // We can show cached data while revalidating
    return !localStorage.getItem("tech-nav-hub-data"); 
  });
  
  // Adapter Selection & Data Revalidation Logic
  useEffect(() => {
    if (authLoading) return;

    const initAdapter = async () => {
      let newAdapter: DataAdapter;
      let type: 'local' | 'supabase';

      // Determine Adapter Type: Always prefer Supabase if client is available
      // This enforces Supabase usage for all users (admin, logged-in, anonymous)
      if (authClient) {
        newAdapter = new SupabaseAdapter(authClient);
        type = 'supabase';
      } else {
        newAdapter = new LocalAdapter();
        type = 'local';
      }

      // Initialize Adapter
      await newAdapter.init();
      setAdapter(newAdapter);
      setAdapterType(type);
      
      // Fetch latest data (Revalidation)
      try {
        const newData = await newAdapter.getData();
        setData(prevData => {
          // Optional: Deep compare to avoid unnecessary re-renders if data is identical
          if (JSON.stringify(prevData) === JSON.stringify(newData)) {
            return prevData;
          }
          return newData;
        });
      } catch (e) {
        console.error("Failed to load data", e);
        // Fallback to local data if remote fetch fails
        if (type === 'supabase') {
           console.warn("Falling back to local data due to remote error");
           const localFallback = new LocalAdapter();
           await localFallback.init();
           const localData = await localFallback.getData();
           setData(localData);
           setAdapter(localFallback);
           setAdapterType('local');
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    initAdapter();
  }, [user, isAdmin, authLoading, authClient]);

  // Clear favorites when user changes to prevent data bleeding between sessions
  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, favorites: [] }));
    }
  }, [user]);

  // Sync document title and favicon with site settings immediately when data changes
  useEffect(() => {
    if (data.metaTitle) {
      document.title = data.metaTitle;
    }
    
    // Update favicon logic
    const updateFavicon = (icon: string) => {
      const existingLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      const link = existingLink || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      
      // If it's an image URL or Base64, use it directly
      if (icon.startsWith('http') || icon.startsWith('data:')) {
        link.href = icon;
      } else {
        // If it's a text/emoji/icon name, we can't easily set it as favicon without canvas generation
        // For now, fall back to default or a placeholder if needed. 
        // Or we could generate a simple SVG favicon dynamically?
        // Let's stick to only updating if it's a valid image source for now.
        return; 
      }
      
      if (!existingLink) {
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    };

    if (data.logoIcon) {
      updateFavicon(data.logoIcon);
    }
  }, [data.metaTitle, data.logoIcon]);

  // --- Connection Management ---

  const connectSupabase = async (config: SupabaseConfig): Promise<boolean> => {
    const isValid = await checkConnection(config);
    if (isValid) {
      localStorage.setItem("supabase-config", JSON.stringify(config));
      window.location.reload(); 
      return true;
    } else {
      toast.error("连接失败，请检查 URL 和 Key");
      return false;
    }
  };

  const disconnectSupabase = () => {
    localStorage.removeItem("supabase-config");
    window.location.reload();
  };

  const syncLocalToRemote = async () => {
    if (adapterType !== 'supabase') {
      toast.error("必须连接到云端数据库才能同步");
      return;
    }
    
    const local = new LocalAdapter();
    await local.init();
    const localData = await local.getData();
    
    try {
      await adapter.importData(localData);
      setData(await adapter.getData());
      toast.success("本地数据已成功同步到云端");
    } catch (e: any) {
      console.error(e);
      toast.error("同步失败: " + e.message);
    }
  };

  const importData = async (newData: SiteConfig) => {
    try {
      await adapter.importData(newData);
      refresh();
      toast.success("数据导入成功");
    } catch (e: any) {
      console.error("Import failed", e);
      toast.error("导入失败：" + e.message);
    }
  };

  // --- CRUD Wrappers ---

  const refresh = async () => {
    const freshData = await adapter.getData();
    setData({ ...freshData });
  };

  // Helper to get section key
  const getSectionKey = (section: SectionType = 'home'): keyof Pick<SiteConfig, 'categories' | 'projectCategories' | 'toolCategories'> => {
    switch (section) {
      case 'projects': return 'projectCategories';
      case 'tools': return 'toolCategories';
      case 'home':
      default: return 'categories';
    }
  };

  const addCategory = async (title: string, icon: string = "Folder", section: SectionType = 'home') => {
    try {
      // 1. Write to DB
      const newCategory = await adapter.addCategory(title, icon, section);
      
      // 2. Optimistic Update Local State
      const key = getSectionKey(section);
      setData(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), newCategory]
      }));
      
      toast.success("分类已添加");
    } catch (e: any) {
      console.error(e);
      toast.error("添加分类失败: " + e.message);
      throw e;
    }
  };

  const deleteCategory = async (id: string, section: SectionType = 'home') => {
    const key = getSectionKey(section);
    const prevData = data;
    
    // Optimistic Update
    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(c => c.id !== id)
    }));
    toast.success("分类已删除");

    try {
      await adapter.deleteCategory(id, section);
    } catch (e: any) {
      console.error(e);
      toast.error("删除分类失败，正在撤销: " + e.message);
      setData(prevData);
      throw e;
    }
  };

  const editCategory = async (id: string, updates: Partial<Omit<Category, "id" | "items">>, section: SectionType = 'home') => {
    const key = getSectionKey(section);
    // Optimistic Update
    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(c => c.id === id ? { ...c, ...updates } : c)
    }));
    toast.success("分类已更新");

    try {
      await adapter.editCategory(id, updates, section);
    } catch (e: any) {
      console.error(e);
      toast.error("更新分类失败，正在撤销: " + e.message);
      // Revert on error (fetching fresh data is safest)
      await refresh(); 
      throw e;
    }
  };

  const addLink = async (categoryId: string, link: Omit<LinkItem, "id">, section: SectionType = 'home') => {
    try {
      const newLink = await adapter.addLink(categoryId, link, section);
      
      const key = getSectionKey(section);
      setData(prev => ({
        ...prev,
        [key]: (prev[key] || []).map(c => 
          c.id === categoryId ? { ...c, items: [newLink, ...c.items] } : c
        )
      }));
      
      toast.success("网站已添加");
    } catch (e: any) {
      console.error(e);
      toast.error("添加网站失败: " + e.message);
      throw e;
    }
  };

  const deleteLink = async (categoryId: string, linkId: string, section: SectionType = 'home') => {
    const key = getSectionKey(section);
    const prevData = data;

    // Optimistic Update
    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(c => 
        c.id === categoryId ? { ...c, items: c.items.filter(i => i.id !== linkId) } : c
      )
    }));
    toast.success("网站已删除");

    try {
      await adapter.deleteLink(categoryId, linkId, section);
    } catch (e: any) {
      console.error(e);
      toast.error("删除网站失败，正在撤销: " + e.message);
      setData(prevData);
      throw e;
    }
  };

  const editLink = async (categoryId: string, linkId: string, updates: Partial<Omit<LinkItem, "id">>, section: SectionType = 'home') => {
    const key = getSectionKey(section);
    
    // Optimistic Update
    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(c => 
        c.id === categoryId ? { 
          ...c, 
          items: c.items.map(i => i.id === linkId ? { ...i, ...updates } : i) 
        } : c
      )
    }));
    toast.success("网站已更新");

    try {
      await adapter.editLink(categoryId, linkId, updates, section);
    } catch (e: any) {
      console.error(e);
      toast.error("更新网站失败，正在撤销: " + e.message);
      await refresh();
      throw e;
    }
  };

  const addPost = async (post: Omit<BlogPost, "id">) => {
    try {
      const newPost = await adapter.addPost(post);
      
      setData(prev => ({
        ...prev,
        posts: [newPost, ...(prev.posts || [])]
      }));
      
      toast.success("博客已发布");
    } catch (e: any) {
      console.error(e);
      toast.error("发布失败: " + e.message);
      throw e;
    }
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    // Optimistic Update
    setData(prev => ({
      ...prev,
      posts: (prev.posts || []).map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    toast.success("博客已更新");

    try {
      await adapter.updatePost(id, updates);
    } catch (e: any) {
      console.error(e);
      toast.error("更新失败，正在撤销: " + e.message);
      await refresh();
      throw e;
    }
  };

  const deletePost = async (id: string) => {
    const prevData = data;
    // Optimistic Update
    setData(prev => ({
      ...prev,
      posts: (prev.posts || []).filter(p => p.id !== id)
    }));
    toast.success("博客已删除");

    try {
      await adapter.deletePost(id);
    } catch (e: any) {
      console.error(e);
      toast.error("删除失败，正在撤销: " + e.message);
      setData(prevData);
      throw e;
    }
  };

  const addMoment = async (moment: Omit<Moment, "id">) => {
    try {
      const newMoment = await adapter.addMoment(moment);
      
      setData(prev => ({
        ...prev,
        moments: [newMoment, ...(prev.moments || [])]
      }));
      
      toast.success("动态已发布");
    } catch (e: any) {
      console.error(e);
      toast.error("发布失败: " + e.message);
      throw e;
    }
  };

  const deleteMoment = async (id: string) => {
    try {
      await adapter.deleteMoment(id);
      
      setData(prev => ({
        ...prev,
        moments: (prev.moments || []).filter(m => m.id !== id)
      }));
      
      toast.success("动态已删除");
    } catch (e: any) {
      console.error(e);
      toast.error("删除失败: " + e.message);
      throw e;
    }
  };

  const editMoment = async (id: string, updates: Partial<Moment>) => {
    try {
      await adapter.editMoment(id, updates);
      
      setData(prev => ({
        ...prev,
        moments: (prev.moments || []).map(m => m.id === id ? { ...m, ...updates } : m)
      }));
      
      toast.success("动态已更新");
    } catch (e: any) {
      console.error(e);
      toast.error("更新失败: " + e.message);
      throw e;
    }
  };

  const updateSettings = async (settings: Partial<SiteConfig>) => {
    try {
      // Optimistic update
      setData(prev => {
        const newData = { ...prev, ...settings };
        if (settings.homePage) newData.homePage = { ...prev.homePage!, ...settings.homePage };
        if (settings.websitesPage) newData.websitesPage = { ...prev.websitesPage!, ...settings.websitesPage };
        if (settings.projectsPage) newData.projectsPage = { ...prev.projectsPage!, ...settings.projectsPage };
        if (settings.toolsPage) newData.toolsPage = { ...prev.toolsPage!, ...settings.toolsPage };
        if (settings.aboutPage) newData.aboutPage = { ...prev.aboutPage!, ...settings.aboutPage };
        if (settings.blogPage) newData.blogPage = { ...prev.blogPage!, ...settings.blogPage };
        if (settings.momentsPage) newData.momentsPage = { ...prev.momentsPage!, ...settings.momentsPage };
        return newData;
      });

      await adapter.updateSettings(settings);
      // Skip heavy refresh(), relying on optimistic update
      toast.success("站点设置已更新");
    } catch (e: any) {
      console.error(e);
      toast.error("设置更新失败: " + e.message);
      // Revert or refresh on error? For now just warn.
      await refresh(); 
      throw e;
    }
  };

  const resetData = async () => {
    setIsLoadingData(true);
    try {
      await adapter.resetData();
      await refresh();
      toast.info("数据已重置");
    } catch (e: any) {
      console.error("Reset failed", e);
      toast.error("重置失败: " + e.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Only block full page loading if we truly have NO data (no cache, no default)
  // Otherwise we render with cached/default data and update when Supabase returns
  if (authLoading || (isLoadingData && !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">正在加载资源...</p>
        </div>
      </div>
    );
  }

  return (
    <BookmarksContext.Provider
      value={{
        data,
        isConnected: adapterType === 'supabase',
        adapterType,
        isLoadingData,
        connectSupabase,
        disconnectSupabase,
        syncLocalToRemote,
        importData,
        addCategory,
        deleteCategory,
        editCategory,
        addLink,
        deleteLink,
        editLink,
        addPost,
        updatePost,
        deletePost,
        addMoment,
        deleteMoment,
        editMoment,
        updateSettings,
        resetData,
        toggleFavorite: async (linkId: string) => {
          if (!user) {
            toast.error("请先登录后收藏");
            return;
          }
          if (adapterType !== 'supabase') {
            toast.error("收藏功能需要连接数据库");
            return;
          }

          const wasFavorite = data.favorites?.includes(linkId);
          
          // 1. Optimistic Update: Update local state immediately
          setData(prev => ({
            ...prev,
            favorites: wasFavorite 
              ? (prev.favorites || []).filter(id => id !== linkId)
              : [...(prev.favorites || []), linkId]
          }));
          toast.success(wasFavorite ? "已取消收藏" : "已收藏");

          // 2. Fire network request in background
          try {
            await (adapter as any).toggleFavorite(linkId);
          } catch (e) {
            console.error(e);
            toast.error("操作失败，正在撤销更改");
            // Revert on error
            setData(prev => ({
              ...prev,
              favorites: wasFavorite 
                ? [...(prev.favorites || []), linkId]
                : (prev.favorites || []).filter(id => id !== linkId)
            }));
          }
        },
        isFavorite: (linkId: string) => {
          return data.favorites?.includes(linkId) || false;
        }
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}
