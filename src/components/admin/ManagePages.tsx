import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, User, Hammer, PenTool, LayoutGrid, Home, FileText, MessageSquare, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

const pageSchema = z.object({
  title: z.string().min(1, "页面标题不能为空"),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  searchHint: z.string().optional(),
});

export function ManagePages() {
  const { data, updateSettings } = useBookmarks();
  const [activeTab, setActiveTab] = useState("home");
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms for each page
  const homeForm = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: data.homePage?.title || data.title || "TechNav Hub",
      subtitle: data.homePage?.subtitle || data.subtitle || "Curated resources for developers & designers",
      content: data.homePage?.content || "",
      searchHint: data.homePage?.searchHint || "",
    },
  });

  const websitesForm = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: data.websitesPage?.title || "精选网站导航",
      subtitle: data.websitesPage?.subtitle || "为您整理的高质量开发者资源与设计灵感",
      content: data.websitesPage?.content || "",
      searchHint: data.websitesPage?.searchHint || "",
    },
  });

  const projectsForm = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: data.projectsPage?.title || "我的项目",
      subtitle: data.projectsPage?.subtitle || "精选的开源项目与实验性作品集合",
      content: data.projectsPage?.content || "",
      searchHint: data.projectsPage?.searchHint || "",
    },
  });

  const toolsForm = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: data.toolsPage?.title || "开发者工具箱",
      subtitle: data.toolsPage?.subtitle || "提升效率的在线工具与生产力神器",
      content: data.toolsPage?.content || "",
      searchHint: data.toolsPage?.searchHint || "",
    },
  });

  const blogForm = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: data.blogPage?.title || "技术博客",
      subtitle: data.blogPage?.subtitle || "分享技术心得与生活感悟",
      content: data.blogPage?.content || "",
      searchHint: data.blogPage?.searchHint || "",
    },
  });

  const aboutForm = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: data.aboutPage?.title || "关于本站",
      subtitle: data.aboutPage?.subtitle || "了解更多关于 TechNav Hub 的信息",
      content: data.aboutPage?.content || "",
      searchHint: data.aboutPage?.searchHint || "",
    },
  });

  const momentsForm = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: data.momentsPage?.title || "动态",
      subtitle: data.momentsPage?.subtitle || "记录当下的想法与灵感",
      content: data.momentsPage?.content || "",
      searchHint: data.momentsPage?.searchHint || "",
    },
  });

  // Sync forms when data changes (e.g. reset)
  useEffect(() => {
    homeForm.reset({
      title: data.homePage?.title || data.title || "TechNav Hub",
      subtitle: data.homePage?.subtitle || data.subtitle || "Curated resources for developers & designers",
      content: data.homePage?.content || "",
      searchHint: data.homePage?.searchHint || "",
    });
    websitesForm.reset({
      title: data.websitesPage?.title || "精选网站导航",
      subtitle: data.websitesPage?.subtitle || "为您整理的高质量开发者资源与设计灵感",
      content: data.websitesPage?.content || "",
      searchHint: data.websitesPage?.searchHint || "",
    });
    projectsForm.reset({
      title: data.projectsPage?.title || "我的项目",
      subtitle: data.projectsPage?.subtitle || "精选的开源项目与实验性作品集合",
      content: data.projectsPage?.content || "",
      searchHint: data.projectsPage?.searchHint || "",
    });
    toolsForm.reset({
      title: data.toolsPage?.title || "开发者工具箱",
      subtitle: data.toolsPage?.subtitle || "提升效率的在线工具与生产力神器",
      content: data.toolsPage?.content || "",
      searchHint: data.toolsPage?.searchHint || "",
    });
    blogForm.reset({
      title: data.blogPage?.title || "技术博客",
      subtitle: data.blogPage?.subtitle || "分享技术心得与生活感悟",
      content: data.blogPage?.content || "",
      searchHint: data.blogPage?.searchHint || "",
    });
    aboutForm.reset({
      title: data.aboutPage?.title || "关于本站",
      subtitle: data.aboutPage?.subtitle || "了解更多关于 TechNav Hub 的信息",
      content: data.aboutPage?.content || "",
      searchHint: data.aboutPage?.searchHint || "",
    });
    momentsForm.reset({
      title: data.momentsPage?.title || "动态",
      subtitle: data.momentsPage?.subtitle || "记录当下的想法与灵感",
      content: data.momentsPage?.content || "",
      searchHint: data.momentsPage?.searchHint || "",
    });
  }, [data, homeForm, websitesForm, projectsForm, toolsForm, blogForm, aboutForm, momentsForm]);

  const handlePageUpdate = async (updateData: any) => {
    setIsSubmitting(true);
    try {
      await updateSettings(updateData);
    } catch (e) {
      console.error("Update failed", e);
      toast.error(e.message || "更新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onHomeSubmit = (values: z.infer<typeof pageSchema>) => {
    handlePageUpdate({
      homePage: { title: values.title, subtitle: values.subtitle, content: values.content || "", searchHint: values.searchHint },
    });
  };

  const onWebsitesSubmit = (values: z.infer<typeof pageSchema>) => {
    handlePageUpdate({
      websitesPage: { title: values.title, subtitle: values.subtitle, content: values.content || "", searchHint: values.searchHint },
    });
  };

  const onProjectsSubmit = (values: z.infer<typeof pageSchema>) => {
    handlePageUpdate({
      projectsPage: { title: values.title, subtitle: values.subtitle, content: values.content || "", searchHint: values.searchHint },
    });
  };

  const onToolsSubmit = (values: z.infer<typeof pageSchema>) => {
    handlePageUpdate({
      toolsPage: { title: values.title, subtitle: values.subtitle, content: values.content || "", searchHint: values.searchHint },
    });
  };

  const onBlogSubmit = (values: z.infer<typeof pageSchema>) => {
    handlePageUpdate({
      blogPage: { title: values.title, subtitle: values.subtitle, content: values.content || "", searchHint: values.searchHint },
    });
  };

  const onAboutSubmit = (values: z.infer<typeof pageSchema>) => {
    handlePageUpdate({
      aboutPage: { title: values.title, subtitle: values.subtitle, content: values.content || "", searchHint: values.searchHint },
    });
  };

  const onMomentsSubmit = (values: z.infer<typeof pageSchema>) => {
    handlePageUpdate({
      momentsPage: { title: values.title, subtitle: values.subtitle, content: values.content || "", searchHint: values.searchHint },
    });
  };

  const renderEditor = (form: any, onSubmit: any, showContent = true, showSearchHint = false) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>页面大标题</FormLabel>
                <FormControl>
                  <Input placeholder="输入页面标题..." {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>页面副标题 / 描述</FormLabel>
                <FormControl>
                  <Input placeholder="输入简短描述..." {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showSearchHint && (
          <FormField
            control={form.control}
            name="searchHint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>搜索框提示语 (Placeholder)</FormLabel>
                <FormControl>
                  <Input placeholder="例如：搜索网站..." {...field} className="bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showContent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>页面内容 (Markdown)</FormLabel>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${!previewMode ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${previewMode ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}
                >
                  预览
                </button>
              </div>
            </div>
            
            {previewMode ? (
              <div className="min-h-[400px] p-6 rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 markdown-content overflow-y-auto">
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
                        className="min-h-[400px] font-mono bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10" 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isSubmitting ? "保存中..." : "保存设置"}
        </Button>
      </form>
    </Form>
  );

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/60 dark:border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle>页面设置管理</CardTitle>
        <CardDescription>自定义全站各核心页面的标题与描述信息。</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 w-full grid grid-cols-7 h-auto">
            <TabsTrigger value="home" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
              <Home className="w-4 h-4 mr-2" />
              首页
            </TabsTrigger>
            <TabsTrigger value="websites" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
              <LayoutGrid className="w-4 h-4 mr-2" />
              网站
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
              <PenTool className="w-4 h-4 mr-2" />
              工具
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
              <Hammer className="w-4 h-4 mr-2" />
              项目
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4 mr-2" />
              博客
            </TabsTrigger>
            <TabsTrigger value="moments" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              动态
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
              <User className="w-4 h-4 mr-2" />
              关于
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="animate-in fade-in zoom-in-95 duration-300">
            {renderEditor(homeForm, onHomeSubmit, false)}
          </TabsContent>

          <TabsContent value="websites" className="animate-in fade-in zoom-in-95 duration-300">
            {renderEditor(websitesForm, onWebsitesSubmit, false, true)}
          </TabsContent>

          <TabsContent value="projects" className="animate-in fade-in zoom-in-95 duration-300">
            {renderEditor(projectsForm, onProjectsSubmit, false, true)}
          </TabsContent>

          <TabsContent value="tools" className="animate-in fade-in zoom-in-95 duration-300">
            {renderEditor(toolsForm, onToolsSubmit, false, true)}
          </TabsContent>

          <TabsContent value="blog" className="animate-in fade-in zoom-in-95 duration-300">
            {renderEditor(blogForm, onBlogSubmit, false, true)}
          </TabsContent>

          <TabsContent value="moments" className="animate-in fade-in zoom-in-95 duration-300">
            {renderEditor(momentsForm, onMomentsSubmit, false, false)}
          </TabsContent>

          <TabsContent value="about" className="animate-in fade-in zoom-in-95 duration-300">
            {renderEditor(aboutForm, onAboutSubmit, true)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
