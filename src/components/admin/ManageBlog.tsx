import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBookmarks } from "@/contexts/BookmarksContext";
import type { BlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, FileText, Calendar as CalendarIcon, Upload, Wand2, Image as ImageIcon, Loader2, Star } from "lucide-react"; // Added Star
import { format } from "date-fns";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

const postSchema = z.object({
  title: z.string().min(2, "标题至少2个字符"),
  excerpt: z.string().min(10, "摘要至少10个字符"),
  content: z.string().min(10, "内容至少10个字符"),
  coverImage: z.string().optional(),
  tags: z.string().optional(),
  date: z.string().optional(),
  isFeatured: z.boolean().optional(), // Added isFeatured
});

// Predefined tech-themed images for random generation
const TECH_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1614064641938-3e8745715e72?auto=format&fit=crop&w=800&q=80",
];

export function ManageBlog() {
  const { data, addPost, updatePost, deletePost } = useBookmarks();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      date: format(new Date(), "yyyy-MM-dd"),
      isFeatured: false, // Default isFeatured
    },
  });

  const handleEdit = (post: BlogPost) => {
    setIsEditing(true);
    setEditingId(post.id);
    form.reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || "",
      tags: post.tags?.join(", ") || "",
      date: format(new Date(post.date), "yyyy-MM-dd"),
      isFeatured: post.isFeatured || false,
    });
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingId(null);
    form.reset({
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      date: format(new Date(), "yyyy-MM-dd"),
      isFeatured: false,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit hint
        toast.warning("图片较大，可能会影响加载速度，建议压缩后上传");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue("coverImage", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomImage = () => {
    const randomImage = TECH_IMAGES[Math.floor(Math.random() * TECH_IMAGES.length)];
    form.setValue("coverImage", randomImage);
  };

  const onSubmit = async (values: z.infer<typeof postSchema>) => {
    const tagsArray = values.tags
      ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const postData = {
      title: values.title,
      excerpt: values.excerpt,
      content: values.content,
      coverImage: values.coverImage,
      tags: tagsArray,
      date: new Date(values.date || Date.now()).toISOString(),
      isFeatured: values.isFeatured || false,
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updatePost(editingId, postData);
      } else {
        await addPost(postData);
      }
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save post", error);
      toast.error("保存失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    const currentCover = form.watch("coverImage");

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {editingId ? "编辑文章" : "撰写新文章"}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting} className="rounded-xl">
            取消
          </Button>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>文章标题</FormLabel>
                      <FormControl>
                        <Input placeholder="输入标题..." {...field} className="bg-card/80 backdrop-blur-sm border-border/50 rounded-xl" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>发布日期</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="date" {...field} className="pl-9 bg-card/80 backdrop-blur-sm border-border/50 rounded-xl" disabled={isSubmitting} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end pb-2">
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            设为精选 (首页展示)
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>摘要 (Excerpt)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="简短的介绍，将显示在列表中..." {...field} className="h-20 bg-card/80 backdrop-blur-sm border-border/50 rounded-xl resize-none" disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Enhanced Cover Image Field */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>封面图片</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="输入图片 URL 或上传..." {...field} className="bg-card/80 backdrop-blur-sm border-border/50 rounded-xl flex-1" disabled={isSubmitting} />
                          </FormControl>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            title="上传图片"
                            className="shrink-0 rounded-xl"
                            disabled={isSubmitting}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleRandomImage}
                            title="随机生成"
                            className="shrink-0 rounded-xl"
                            disabled={isSubmitting}
                          >
                            <Wand2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Image Preview */}
                  <div className="relative w-full h-32 rounded-xl border border-border/50 bg-muted/50 overflow-hidden flex items-center justify-center">
                    {currentCover ? (
                      <img 
                        src={currentCover} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ""; 
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground text-xs">
                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                        <span>无封面图片</span>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>标签 (逗号分隔)</FormLabel>
                      <FormControl>
                        <Input placeholder="tech, tutorial, life" {...field} className="bg-card/80 backdrop-blur-sm border-border/50 rounded-xl" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>文章内容 (Markdown)</FormLabel>
                  <div className="flex bg-muted rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${!previewMode ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${previewMode ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}
                    >
                      预览
                    </button>
                  </div>
                </div>
                
                {previewMode ? (
                  <div className="min-h-[400px] p-6 rounded-xl border border-border/50 bg-card/80 markdown-content overflow-y-auto">
                    <Streamdown>{form.getValues("content")}</Streamdown>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="# 开始撰写..." 
                            {...field} 
                            className="min-h-[400px] font-mono bg-card/80 backdrop-blur-sm border-border/50 rounded-xl" 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting} className="rounded-xl">放弃</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px] rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? (editingId ? "更新中..." : "发布中...") : (editingId ? "更新文章" : "发布文章")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">博客文章列表</h2>
          <p className="text-sm text-muted-foreground">管理您发布的所有文章内容。</p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" />
          写新文章
        </Button>
      </div>

      <div className="space-y-3">
        {(data.posts || []).length > 0 ? (
          data.posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl hover:shadow-md transition-all group">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                  {post.isFeatured && (
                    <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                      <Star className="w-3 h-3 mr-0.5 fill-current" /> 精选
                    </span>
                  )}
                  {post.tags && post.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{format(new Date(post.date), "yyyy-MM-dd")}</span>
                  <span className="truncate max-w-[300px]">{post.excerpt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除文章?</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将永久删除文章 "{post.title}"，无法撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deletePost(post.id)} className="bg-red-600 hover:bg-red-700">
                        确认删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card/80 backdrop-blur-sm rounded-xl border border-dashed border-border/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">暂无文章，开始写作吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
