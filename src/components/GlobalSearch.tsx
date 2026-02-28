import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useLocation } from "wouter";
import { FileText, Globe, Hammer, PenTool, MessageSquare } from "lucide-react";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { data } = useBookmarks();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange, open]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="搜索网站、工具、项目或博客..." />
      <CommandList>
        <CommandEmpty>未找到相关结果。</CommandEmpty>
        
        {/* Websites */}
        {data.categories.length > 0 && (
          <CommandGroup heading="网站资源">
            {data.categories.map((category) =>
              category.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title + " " + item.description + " " + item.tags?.join(" ")}
                  onSelect={() => runCommand(() => window.open(item.url, "_blank"))}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  <span className="ml-2 text-muted-foreground text-xs truncate max-w-[200px]">
                    {item.description}
                  </span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}
        
        <CommandSeparator />

        {/* Tools */}
        {data.toolCategories && data.toolCategories.length > 0 && (
          <CommandGroup heading="工具">
            {data.toolCategories.map((category) =>
              category.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title + " " + item.description + " " + item.tags?.join(" ")}
                  onSelect={() => runCommand(() => window.open(item.url, "_blank"))}
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  <span className="ml-2 text-muted-foreground text-xs truncate max-w-[200px]">
                    {item.description}
                  </span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Projects */}
        {data.projectCategories && data.projectCategories.length > 0 && (
          <CommandGroup heading="项目">
            {data.projectCategories.map((category) =>
              category.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title + " " + item.description + " " + item.tags?.join(" ")}
                  onSelect={() => runCommand(() => window.open(item.url, "_blank"))}
                >
                  <Hammer className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  <span className="ml-2 text-muted-foreground text-xs truncate max-w-[200px]">
                    {item.description}
                  </span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Moments */}
        {data.moments && data.moments.length > 0 && (
          <CommandGroup heading="动态">
            {data.moments.map((moment) => (
              <CommandItem
                key={moment.id}
                value={moment.content}
                onSelect={() => runCommand(() => setLocation("/moments"))}
              >
                <div className="mr-2 flex h-4 w-4 items-center justify-center">
                  <MessageSquare className="h-3 w-3" />
                </div>
                <span className="truncate">{moment.content}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Blog Posts */}
        {data.posts && data.posts.length > 0 && (
          <CommandGroup heading="博客文章">
            {data.posts.map((post) => (
              <CommandItem
                key={post.id}
                value={post.title + " " + post.excerpt + " " + post.tags?.join(" ")}
                onSelect={() => runCommand(() => setLocation(`/blog/${post.id}`))}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{post.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
