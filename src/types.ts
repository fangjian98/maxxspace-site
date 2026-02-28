export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string; // Lucide icon name or image URL
  tags?: string[];
  isFeatured?: boolean; // New: Featured status
}

export interface Category {
  id: string;
  title: string;
  icon?: string; // Lucide icon name
  items: LinkItem[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  date: string; // ISO date string
  coverImage?: string;
  tags?: string[];
  isFeatured?: boolean; // New: Featured status
}

export type MomentType = 'text' | 'link' | 'image';

export interface Moment {
  id: string;
  content: string;
  type: MomentType;
  images?: string[]; // New: Supports multiple images (base64 or url)
  mediaUrl?: string; // Deprecated: backward compatibility
  linkUrl?: string;  // For link type
  date: string;      // ISO date string
}

export interface PageContent {
  title: string;
  subtitle?: string; // Subtitle or description
  content: string; // Markdown
  searchHint?: string; // Search placeholder text
}

export interface SiteConfig {
  metaTitle: string; // Browser tab title
  title: string;     // Deprecated: use homePage.title
  subtitle: string;  // Deprecated: use homePage.subtitle
  logoText: string;  // Navbar brand name
  logoIcon: string;  // Navbar brand initial/icon (single char or icon name)
  copyright: string; // Footer copyright text
  
  // Navigation Sections
  categories: Category[];       // Home / Featured
  projectCategories: Category[]; // Projects
  toolCategories: Category[];    // Tools
  
  posts: BlogPost[];
  moments: Moment[]; // New: Moments
  
  // Custom Pages
  homePage?: PageContent;     // Landing Page
  websitesPage?: PageContent; // Websites Navigation Page
  aboutPage?: PageContent;
  projectsPage?: PageContent; 
  toolsPage?: PageContent;
  blogPage?: PageContent;     // Blog List Page
  momentsPage?: PageContent;  // New: Moments Page
  favorites?: string[]; // List of favorited link IDs
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}
