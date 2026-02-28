import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tagUtils";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:id");
  const { data } = useBookmarks();
  const { theme } = useTheme();

  if (!match || !params) return null;

  const post = (data.posts || []).find(p => p.id === params.id);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
            <Link href="/blog">
              <span className="text-blue-500 hover:underline cursor-pointer">返回博客列表</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
      {/* Global Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
           <img src={bgImageLight} alt="" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-white/60 backdrop-blur-[0px]" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
           <img src={bgImageDark} alt="" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/60 backdrop-blur-[0px]" />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 container max-w-4xl mx-auto pt-24 md:pt-32 px-4 pb-20">
        <article className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Header */}
          <div className="mb-10 text-center">
            <Link href="/blog">
              <button className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回列表
              </button>
            </Link>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(post.date), "yyyy年MM月dd日")}</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <div className="flex gap-2 flex-wrap justify-center">
                    {post.tags.map(tag => (
                      <Link key={tag} href={`/tags?tag=${encodeURIComponent(tag)}`}>
                        <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border cursor-pointer hover:opacity-80 transition-opacity", getTagColor(tag))}>
                          {tag}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/50">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="markdown-content
            bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/40 dark:border-white/10 shadow-sm"
          >
            <Streamdown>{post.content}</Streamdown>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
