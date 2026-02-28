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
      <TabsList className="bg-muted/50 p-1 rounded-full w-full md:w-auto grid grid-cols-3 h-auto">
        <TabsTrigger value="manage" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
          <LayoutList className="w-3.5 h-3.5 mr-2" />
          管理列表
        </TabsTrigger>
        <TabsTrigger value="add-link" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
          <LinkIcon className="w-3.5 h-3.5 mr-2" />
          添加{title}
        </TabsTrigger>
        <TabsTrigger value="add-category" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
          <FolderPlus className="w-3.5 h-3.5 mr-2" />
          添加分类
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="animate-fade-in">
        <ManageContent section={section} />
      </TabsContent>

      <TabsContent value="add-link" className="animate-fade-in">
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
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
                          <SelectTrigger className="bg-card/80 backdrop-blur-sm border-border/50">
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
                          <Input placeholder={`例如：${title}名称`} {...field} className="bg-card/80 backdrop-blur-sm border-border/50" />
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
                          <Input placeholder="https://..." {...field} className="bg-card/80 backdrop-blur-sm border-border/50" />
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
                        <Textarea placeholder={`简短描述该${title}...`} {...field} className="bg-card/80 backdrop-blur-sm border-border/50 resize-none" />
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
                        <Input placeholder="tag1, tag2" {...field} className="bg-card/80 backdrop-blur-sm border-border/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" />
                  添加到列表
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="add-category" className="animate-fade-in">
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
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
                        <Input placeholder={`例如：${section === 'home' ? 'AI 工具' : section === 'projects' ? 'Web 框架' : '效率工具'}`} {...field} className="bg-card/80 backdrop-blur-sm border-border/50" />
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
                        <Input placeholder="Folder (默认)" {...field} className="bg-card/80 backdrop-blur-sm border-border/50" />
                      </FormControl>
                      <FormDescription>
                        请输入 Lucide React 图标库中的图标名称，如 "Code", "Zap", "Globe" 等。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/25">
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
