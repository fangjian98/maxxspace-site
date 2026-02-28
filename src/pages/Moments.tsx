import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import { MessageSquare, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Moments() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sort moments by date descending
  const moments = (data.moments || []).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pageTitle = data.momentsPage?.title || "动态";
  const pageSubtitle = data.momentsPage?.subtitle || "记录当下的想法与灵感";

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

      <main className="flex-1 container max-w-3xl mx-auto pt-24 md:pt-32 px-4 pb-20">
        {/* Page Header */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            {pageSubtitle}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
          {moments.length > 0 ? (
            moments.map((moment, index) => {
              // Normalize images array: prioritize 'images', fallback to 'mediaUrl' if 'images' is empty
              const images = (moment.images && moment.images.length > 0) 
                ? moment.images 
                : (moment.mediaUrl ? [moment.mediaUrl] : []);

              return (
                <div key={moment.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {moment.type === 'text' && <MessageSquare className="w-5 h-5 text-slate-500" />}
                    {moment.type === 'link' && <LinkIcon className="w-5 h-5 text-blue-500" />}
                    {moment.type === 'image' && <ImageIcon className="w-5 h-5 text-purple-500" />}
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <time className="font-mono text-xs text-slate-400 dark:text-slate-500">
                        {format(new Date(moment.date), "yyyy-MM-dd HH:mm")}
                      </time>
                    </div>
                    
                    <div className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {moment.content}
                    </div>

                    {moment.linkUrl && (
                      <a 
                        href={moment.linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-3 flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 group/link hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                        <span className="text-sm text-blue-600 dark:text-blue-400 truncate font-medium group-hover/link:underline">
                          {moment.linkUrl}
                        </span>
                      </a>
                    )}

                    {images.length > 0 && (
                      <div className={`mt-3 grid gap-2 ${
                        images.length === 1 ? 'grid-cols-1' : 
                        images.length === 2 ? 'grid-cols-2' : 
                        'grid-cols-3'
                      }`}>
                        {images.map((img, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 aspect-square">
                            <img 
                              src={img} 
                              alt={`Moment image ${idx + 1}`} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                              loading="lazy"
                              onClick={() => setPreviewImage(img)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-4 rounded-full bg-white/50 dark:bg-white/10 mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                暂无动态，去后台发布一条吧！
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-auto p-0 bg-transparent border-none shadow-none text-white overflow-hidden flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
