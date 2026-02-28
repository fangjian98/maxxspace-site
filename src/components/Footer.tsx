import { useBookmarks } from "@/contexts/BookmarksContext";

export function Footer() {
  const { data } = useBookmarks();

  return (
    <footer className="py-8 mt-12 border-t border-slate-200/50 dark:border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {data.copyright || `© ${new Date().getFullYear()} Maxx Space. Built for tech enthusiasts.`}
        </p>
      </div>
    </footer>
  );
}
