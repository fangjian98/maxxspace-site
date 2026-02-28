import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import { MessageSquare, Link as LinkIcon, Image as ImageIcon, ExternalLink } from "lucide-react";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function Moments() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const moments = (data.moments || []).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pageTitle = data.momentsPage?.title || "动态";
  const pageSubtitle = data.momentsPage?.subtitle || "记录当下的想法与灵感";

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link':
        return { icon: LinkIcon, color: 'text-primary bg-primary/10' };
      case 'image':
        return { icon: ImageIcon, color: 'text-violet-500 bg-violet-500/10' };
      default:
        return { icon: MessageSquare, color: 'text-muted-foreground bg-muted' };
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Global Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className={`absolute inset-0 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
          <img src={bgImageLight} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <img src={bgImageDark} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 w-full pt-28 md:pt-32 pb-24">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground text-lg">
              {pageSubtitle}
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

            {moments.length > 0 ? (
              <div className="space-y-6">
                {moments.map((moment, index) => {
                  const images = (moment.images && moment.images.length > 0) 
                    ? moment.images 
                    : (moment.mediaUrl ? [moment.mediaUrl] : []);
                  const typeInfo = getTypeIcon(moment.type);
                  const Icon = typeInfo.icon;

                  return (
                    <div 
                      key={moment.id} 
                      className="relative flex gap-4 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 z-10",
                        typeInfo.color
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-5 transition-all hover:shadow-md">
                        {/* Date */}
                        <time className="text-xs text-muted-foreground font-mono mb-3 block">
                          {format(new Date(moment.date), "yyyy年MM月dd日 HH:mm")}
                        </time>
                        
                        {/* Content */}
                        <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                          {moment.content}
                        </div>

                        {/* Link */}
                        {moment.linkUrl && (
                          <a 
                            href={moment.linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors group"
                          >
                            <LinkIcon className="w-4 h-4 text-primary shrink-0" />
                            <span className="flex-1 text-sm text-primary truncate">
                              {moment.linkUrl}
                            </span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        )}

                        {/* Images */}
                        {images.length > 0 && (
                          <div className={cn(
                            "mt-4 grid gap-2",
                            images.length === 1 ? 'grid-cols-1' : 
                            images.length === 2 ? 'grid-cols-2' : 
                            'grid-cols-3'
                          )}>
                            {images.map((img, idx) => (
                              <div 
                                key={idx} 
                                className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-zoom-in group"
                              >
                                <img 
                                  src={img} 
                                  alt="" 
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  暂无动态
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-auto p-0 bg-transparent border-none shadow-none overflow-hidden">
          <DialogTitle className="sr-only">图片预览</DialogTitle>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="" 
              className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
