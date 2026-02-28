import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Trash2, Plus, MessageSquare, Image as ImageIcon, Link as LinkIcon, Upload, Pencil, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Moment } from "@/types";

const momentSchema = z.object({
  content: z.string().min(1, "内容不能为空"),
  type: z.enum(["text", "link", "image"]),
  images: z.array(z.string()).max(3, "最多上传 3 张图片").optional(),
  linkUrl: z.string().optional(),
  date: z.string().optional(),
});

// Helper to compress image
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Resize large images for Supabase limit
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG 0.7
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export function ManageMoments() {
  const { data, addMoment, deleteMoment, editMoment } = useBookmarks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof momentSchema>>({
    resolver: zodResolver(momentSchema),
    defaultValues: {
      content: "",
      type: "text",
      images: [],
      linkUrl: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const type = form.watch("type");
  const images = form.watch("images") || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (images.length + files.length > 3) {
        toast.warning("最多只能上传 3 张图片");
        return;
      }

      setIsUploading(true);
      const fileReaders: Promise<string>[] = [];

      Array.from(files).forEach(file => {
        fileReaders.push(compressImage(file));
      });

      try {
        const newImages = await Promise.all(fileReaders);
        const currentImages = form.getValues("images") || [];
        form.setValue("images", [...currentImages, ...newImages]);
      } catch (error) {
        console.error("Image upload failed", error);
        toast.error("图片处理失败，请重试");
      } finally {
        setIsUploading(false);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("images", newImages);
  };

  const handleEdit = (moment: Moment) => {
    setEditingId(moment.id);
    // Determine images: favor 'images' array, fallback to 'mediaUrl'
    const existingImages = (moment.images && moment.images.length > 0) 
      ? moment.images 
      : (moment.mediaUrl ? [moment.mediaUrl] : []);

    form.reset({
      content: moment.content,
      type: moment.type,
      images: existingImages,
      linkUrl: moment.linkUrl || "",
      date: format(new Date(moment.date), "yyyy-MM-dd'T'HH:mm"),
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset({
      content: "",
      type: "text",
      images: [],
      linkUrl: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const onSubmit = async (values: z.infer<typeof momentSchema>) => {
    const momentData = {
      content: values.content,
      type: values.type,
      images: values.images,
      mediaUrl: values.images?.[0] || "", // Backward compat
      linkUrl: values.linkUrl,
      date: new Date(values.date || Date.now()).toISOString(),
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await editMoment(editingId, momentData);
        setEditingId(null);
      } else {
        await addMoment(momentData);
      }

      form.reset({
        content: "",
        type: "text",
        images: [],
        linkUrl: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    } catch (error) {
      console.error("Failed to save moment", error);
      toast.error("发布失败: " + (error.message || "未知错误"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Post Form */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {editingId ? "编辑动态" : "发布新动态"}
          </h2>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isSubmitting} className="rounded-xl">取消编辑</Button>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full md:w-32">
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="bg-card/80 backdrop-blur-sm border-border/50 rounded-xl">
                          <SelectValue placeholder="类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">纯文字</SelectItem>
                        <SelectItem value="link">链接分享</SelectItem>
                        <SelectItem value="image">图片分享</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="datetime-local" {...field} className="bg-card/80 backdrop-blur-sm border-border/50 rounded-xl" disabled={isSubmitting} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="这一刻的想法..." 
                      {...field} 
                      className="bg-card/80 backdrop-blur-sm border-border/50 min-h-[100px] resize-none rounded-xl" 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "link" && (
              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="输入链接地址 (https://...)" {...field} className="pl-9 bg-card/80 backdrop-blur-sm border-border/50 rounded-xl" disabled={isSubmitting} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === "image" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    title="上传图片"
                    disabled={images.length >= 3 || isSubmitting || isUploading}
                    className="rounded-xl"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploading ? "处理中..." : `上传图片 (${images.length}/3)`}
                  </Button>
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group w-full h-32 bg-muted rounded-xl overflow-hidden border border-border/50">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={isSubmitting || isUploading}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />)}
                {isSubmitting ? (editingId ? "更新中..." : "发布中...") : (editingId ? "更新动态" : "发布")}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Moments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">历史动态</h3>
        <div className="space-y-3">
          {(data.moments || []).length > 0 ? (
            // Sort by date desc for display in list
            [...data.moments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((moment) => (
              <div key={moment.id} className={`flex flex-col gap-2 p-4 border rounded-xl hover:shadow-md transition-all group ${editingId === moment.id ? 'bg-primary/5 border-primary/30' : 'bg-card/80 backdrop-blur-sm border-border/50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        moment.type === 'text' ? 'bg-muted text-muted-foreground border-border' :
                        moment.type === 'link' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800'
                      }`}>
                        {moment.type === 'text' ? '文字' : moment.type === 'link' ? '链接' : '图片'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(moment.date), "yyyy-MM-dd HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap mb-2 line-clamp-3">
                      {moment.content}
                    </p>
                    
                    {/* Media Preview in List */}
                    {moment.images && moment.images.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {moment.images.map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-muted">
                            <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Fallback for old single mediaUrl */}
                    {!moment.images && moment.mediaUrl && (
                       <div className="w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-muted mb-2">
                         <img src={moment.mediaUrl} alt="Thumb" className="w-full h-full object-cover" />
                       </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl"
                      onClick={() => handleEdit(moment)}
                    >
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
                          <AlertDialogTitle>确认删除这条动态?</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMoment(moment.id)} className="bg-red-600 hover:bg-red-700">
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-card/80 backdrop-blur-sm rounded-xl border border-dashed border-border/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">暂无动态</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
