import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tagUtils";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <div className="group relative flex flex-col h-full bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <Link href={`/blog/${post.id}`} className="absolute inset-0 z-0" aria-label={post.title} />

      {/* Cover Image (if available) */}
      {post.coverImage && (
        <div className="h-48 w-full overflow-hidden relative pointer-events-none">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col pointer-events-none">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(post.date), "yyyy-MM-dd")}</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 pointer-events-auto relative z-10">
              {post.tags.slice(0, 2).map(tag => (
                <Link key={tag} href={`/tags?tag=${encodeURIComponent(tag)}`}>
                  <span className={cn("px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity border", getTagColor(tag))}>
                    {tag}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-semibold mt-auto group/btn">
          <span>阅读全文</span>
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
        </div>
      </div>
    </div>
  );
}
