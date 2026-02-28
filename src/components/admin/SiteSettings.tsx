import { useEffect, useRef, useState } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const settingsSchema = z.object({
  logoIcon: z.string().min(1, "Logo图标不能为空 (请输入字符或图标名)"),
  logoText: z.string().min(1, "网站名称不能为空"),
  metaTitle: z.string().min(1, "浏览器标题不能为空"),
  copyright: z.string().optional(),
});

export function SiteSettings() {
  const { data, updateSettings } = useBookmarks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState(data.logoIcon);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      logoIcon: data.logoIcon || "N",
      logoText: data.logoText,
      metaTitle: data.metaTitle || "TechNav Hub",
      copyright: data.copyright || `© ${new Date().getFullYear()} TechNav Hub.`,
    },
  });

  // Sync form with data when data changes (e.g. on reset)
  useEffect(() => {
    form.reset({
      logoIcon: data.logoIcon || "N",
      logoText: data.logoText,
      metaTitle: data.metaTitle || "TechNav Hub",
      copyright: data.copyright,
    });
    setLogoPreview(data.logoIcon || "N");
  }, [data, form]);

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    updateSettings(values);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit hint
        toast.warning("图片较大，可能会影响加载速度，建议压缩后上传");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue("logoIcon", base64String);
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const isImage = (str?: string) => str?.startsWith("data:image") || str?.startsWith("http");

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/60 dark:border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle>站点全局设置</CardTitle>
        <CardDescription>配置网站的品牌、浏览器标题、版权信息等全局内容。页面特定的标题请前往“页面管理”修改。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">品牌与导航栏</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="logoIcon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>网站图标 (Logo Icon)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="例如：N, Zap, Code..." 
                            {...field} 
                            className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" 
                            onChange={(e) => {
                              field.onChange(e);
                              setLogoPreview(e.target.value);
                            }}
                          />
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
                          className="shrink-0"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>预览:</span>
                        <div className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center text-white font-bold overflow-hidden",
                          isImage(logoPreview) ? "bg-transparent" : "bg-blue-600"
                        )}>
                          {isImage(logoPreview) ? (
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span>{logoPreview?.substring(0, 1) || "N"}</span>
                          )}
                        </div>
                      </div>

                      <FormDescription>支持单个字符、Lucide 图标名，或点击右侧按钮上传图片。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>网站名称 (Navbar Title)</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：TechNav." {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" />
                      </FormControl>
                      <FormDescription>显示在导航栏左侧的品牌名称。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">浏览器设置</h3>
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>浏览器标签标题 (Meta Title)</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：TechNav Hub - Developer Resources" {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">底部信息</h3>
              <FormField
                control={form.control}
                name="copyright"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>版权文字 (Copyright)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="© 2026 TechNav Hub..." {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10 h-20 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
              <Save className="w-4 h-4 mr-2" />
              保存所有设置
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
