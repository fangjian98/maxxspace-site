import type { SiteConfig, Category, LinkItem, BlogPost, PageContent, Moment } from "@/types";
import type { SectionType } from "@/contexts/BookmarksContext";

export interface DataAdapter {
  init(): Promise<void>;
  
  // Read
  getData(): Promise<SiteConfig>;
  
  // Write Categories
  addCategory(title: string, icon: string, section: SectionType): Promise<Category>;
  deleteCategory(id: string, section: SectionType): Promise<void>;
  editCategory(id: string, updates: Partial<Category>, section: SectionType): Promise<void>;
  
  // Write Links
  addLink(categoryId: string, link: Omit<LinkItem, "id">, section: SectionType): Promise<LinkItem>;
  deleteLink(categoryId: string, linkId: string, section: SectionType): Promise<void>;
  editLink(categoryId: string, linkId: string, updates: Partial<LinkItem>, section: SectionType): Promise<void>;
  
  // Write Posts
  addPost(post: Omit<BlogPost, "id">): Promise<BlogPost>;
  updatePost(id: string, updates: Partial<BlogPost>): Promise<void>;
  deletePost(id: string): Promise<void>;

  // Write Moments
  addMoment(moment: Omit<Moment, "id">): Promise<Moment>;
  deleteMoment(id: string): Promise<void>;
  editMoment(id: string, updates: Partial<Moment>): Promise<void>;
  
  // Write Settings
  updateSettings(settings: Partial<SiteConfig>): Promise<void>;
  
  // Maintenance
  resetData(): Promise<void>;
  importData(data: SiteConfig): Promise<void>;
}
