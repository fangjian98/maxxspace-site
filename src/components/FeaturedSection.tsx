import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LinkItem, BlogPost } from "@/types";
import { format } from "date-fns";

interface FeaturedSectionProps {
  title: string;
  items?: LinkItem[];
  posts?: BlogPost[];
  type: 'websites' | 'tools' | 'projects' | 'blog';
}

export function FeaturedSection({ title, items, posts, type }: FeaturedSectionProps) {
  if ((!items || items.length === 0) && (!posts || posts.length === 0)) return null;

  return (
    <section className="py-8 border-t border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {type === 'blog' && posts ? (
            posts.slice(0, 6).map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <div className="group cursor-pointer bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-blue-500/30 dark:hover:border-blue-500/30 h-full flex flex-col">
                  {post.coverImage && (
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-[10px] text-slate-400 mb-1">{format(new Date(post.date), "MMM d, yyyy")}</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : items ? (
            items.slice(0, 6).map((item) => (
              <a 
                key={item.id} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md transition-all hover:border-blue-500/30 dark:hover:border-blue-500/30 h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors overflow-hidden">
                      {(() => {
                        // 1. If explicit image URL is provided in icon field, use it
                        if (item.icon && (item.icon.includes('/') || item.icon.includes('.'))) {
                          return <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />;
                        }

                        // 2. Try to fetch favicon from URL
                        if (item.url) {
                          try {
                            const domain = new URL(item.url).hostname;
                            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                            return <img src={faviconUrl} alt={item.title} className="w-full h-full object-cover" />;
                          } catch (e) {
                            // invalid url, fall through
                          }
                        }

                        // 3. Fallback to Lucide icon if specified
                        if (item.icon) {
                          const IconComponent = Icons[item.icon as keyof typeof Icons] as LucideIcon;
                          if (IconComponent) {
                            return <IconComponent className="w-4 h-4" />;
                          }
                          return <span className="font-bold text-sm">{item.icon.charAt(0)}</span>;
                        }

                        // 4. Fallback to generic icon
                        return <ExternalLink className="w-4 h-4" />;
                      })()}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </a>
            ))
          ) : null}
        </div>
      </div>
    </section>
  );
}
