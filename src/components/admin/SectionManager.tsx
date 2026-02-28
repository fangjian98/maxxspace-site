import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBookmarks, type SectionType } from "@/contexts/BookmarksContext";
import { ManageContent } from "@/components/admin/ManageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderPlus, Link as LinkIcon, LayoutList } from "lucide-react";

interface SectionManagerProps {
  section: SectionType;
  title: string; // "网站", "项目", "工具"
}

// Schema for adding a link
const linkSchema = z.object({
  title: z.string().min(2, "标题至少2个字符"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "请选择分类"),
  tags: z.string().optional(), // Comma separated
});

// Schema for adding a category
const categorySchema = z.object({
  title: z.string().min(2, "分类名称至少2个字符"),
  icon: z.string().optional(),
});

export function SectionManager({ section, title }: SectionManagerProps) {
  const { data, addLink, addCategory } = useBookmarks();
  const [activeTab, setActiveTab] = useState("manage");

  // Filter categories for the current section
  const categories = section === 'projects' 
    ? data.projectCategories 
    : section === 'tools' 
      ? data.toolCategories 
      : data.categories;

  const linkForm = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      categoryId: "",
      tags: "",
    },
  });

  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: "",
      icon: "Folder",
    },
  });

  async function onLinkSubmit(values: z.infer<typeof linkSchema>) {
    const tagsArray = values.tags
      ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    
    try {
      await addLink(values.categoryId, {
        title: values.title,
        url: values.url,
        description: values.description,
        tags: tagsArray,
        icon: "", // Auto-fetched in frontend
      }, section);
      linkForm.reset();
    } catch (e) {
      // Error handled by context
    }
  }

  async function onCategorySubmit(values: z.infer<typeof categorySchema>) {
    try {
      await addCategory(values.title, values.icon || "Folder", section);
      categoryForm.reset();
    } catch (e) {
      // Error handled by context
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 p-1 rounded-full shadow-sm w-full md:w-auto grid grid-cols-3 h-auto">
        <TabsTrigger value="manage" className="rounded-full px-4 py-2 text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md transition-all">
          <LayoutList className="w-3.5 h-3.5 mr-2" />
          管理列表
        </TabsTrigger>
        <TabsTrigger value="add-link" className="rounded-full px-4 py-2 text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md transition-all">
          <LinkIcon className="w-3.5 h-3.5 mr-2" />
          添加{title}
        </TabsTrigger>
        <TabsTrigger value="add-category" className="rounded-full px-4 py-2 text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md transition-all">
          <FolderPlus className="w-3.5 h-3.5 mr-2" />
          添加分类
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="animate-in fade-in zoom-in-95 duration-300">
        <ManageContent section={section} />
      </TabsContent>

      <TabsContent value="add-link" className="animate-in fade-in zoom-in-95 duration-300">
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/60 dark:border-white/10 shadow-lg">
          <CardHeader>
            <CardTitle>添加新{title}</CardTitle>
            <CardDescription>填写{title}信息添加到指定分类。</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...linkForm}>
              <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="space-y-6">
                <FormField
                  control={linkForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所属分类</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10">
                            <SelectValue placeholder="选择一个分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={linkForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{title}标题</FormLabel>
                        <FormControl>
                          <Input placeholder={`例如：${title}名称`} {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={linkForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>链接地址 (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={linkForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述 (选填)</FormLabel>
                      <FormControl>
                        <Textarea placeholder={`简短描述该${title}...`} {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10 resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={linkForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>标签 (选填，逗号分隔)</FormLabel>
                      <FormControl>
                        <Input placeholder="tag1, tag2" {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                  <Plus className="w-4 h-4 mr-2" />
                  添加到列表
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="add-category" className="animate-in fade-in zoom-in-95 duration-300">
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/60 dark:border-white/10 shadow-lg">
          <CardHeader>
            <CardTitle>添加新分类</CardTitle>
            <CardDescription>创建一个新的{title}分类板块。</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-6">
                <FormField
                  control={categoryForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分类名称</FormLabel>
                      <FormControl>
                        <Input placeholder={`例如：${section === 'home' ? 'AI 工具' : section === 'projects' ? 'Web 框架' : '效率工具'}`} {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={categoryForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图标名称 (Lucide Icon)</FormLabel>
                      <FormControl>
                        <Input placeholder="Folder (默认)" {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" />
                      </FormControl>
                      <FormDescription>
                        请输入 Lucide React 图标库中的图标名称，如 "Code", "Zap", "Globe" 等。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20">
                  <Plus className="w-4 h-4 mr-2" />
                  创建分类
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
