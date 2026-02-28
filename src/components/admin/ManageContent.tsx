import { useState } from "react";
import { useBookmarks, type SectionType } from "@/contexts/BookmarksContext";
import type { Category, LinkItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Globe, ExternalLink, Loader2, Star } from "lucide-react"; // Added Star
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

interface ManageContentProps {
  section?: SectionType;
}

export function ManageContent({ section = 'home' }: ManageContentProps) {
  const { data, deleteCategory, editCategory, deleteLink, editLink } = useBookmarks();

  // Determine which categories to display
  const categories = section === 'projects' 
    ? data.projectCategories 
    : section === 'tools' 
      ? data.toolCategories 
      : data.categories;

  // State for Category Edit
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Link Edit
  const [editingLink, setEditingLink] = useState<{ categoryId: string; link: LinkItem } | null>(null);
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    description: "",
    tags: "",
    isFeatured: false, // Added isFeatured
  });

  const openCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.title);
    setCategoryIcon(category.icon || "Folder");
  };

  const handleCategorySave = async () => {
    if (!editingCategory) return;
    if (!categoryName.trim()) {
      toast.error("分类名称不能为空");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await editCategory(editingCategory.id, {
        title: categoryName,
        icon: categoryIcon,
      }, section);
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to update category", error);
      toast.error("更新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id, section);
  };

  const openLinkEdit = (categoryId: string, link: LinkItem) => {
    setEditingLink({ categoryId, link });
    setLinkForm({
      title: link.title,
      url: link.url,
      description: link.description || "",
      tags: link.tags ? link.tags.join(", ") : "",
      isFeatured: link.isFeatured || false, // Initialize isFeatured
    });
  };

  const handleLinkSave = async () => {
    if (!editingLink) return;
    if (!linkForm.title.trim() || !linkForm.url.trim()) {
      toast.error("标题和URL不能为空");
      return;
    }
    const tagsArray = linkForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    
    setIsSubmitting(true);
    try {
      await editLink(editingLink.categoryId, editingLink.link.id, {
        title: linkForm.title,
        url: linkForm.url,
        description: linkForm.description,
        tags: tagsArray,
        isFeatured: linkForm.isFeatured, // Save isFeatured
      }, section);
      setEditingLink(null);
    } catch (error) {
      console.error("Failed to update link", error);
      toast.error("更新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full space-y-4">
        {categories.map((category) => {
           const IconComponent = (category.icon && (Icons[category.icon as keyof typeof Icons] as LucideIcon)) || Icons.Folder;
           
           return (
            <AccordionItem key={category.id} value={category.id} className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl px-4 shadow-sm">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <div className="p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg shadow-sm">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-lg">{category.title}</span>
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {category.items.length} 个网站
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {/* Category Actions */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-white/5">
                  <span className="text-sm text-slate-500 font-medium ml-1">分类操作:</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 bg-white dark:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-white/10"
                    onClick={() => openCategoryEdit(category)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    编辑信息
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="h-8 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-none">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        删除分类
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除分类 "{category.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作将永久删除该分类及其包含的 {category.items.length} 个网站链接，无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-red-600 hover:bg-red-700">
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Links List */}
                <div className="space-y-2 pl-2">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-white/10 rounded-lg border border-transparent hover:border-slate-100 dark:border-white/10 transition-all group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{item.title}</span>
                            {item.isFeatured && (
                              <span className="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                <Star className="w-3 h-3 mr-0.5 fill-current" /> 精选
                              </span>
                            )}
                            <a href={item.url} target="_blank" className="text-slate-300 hover:text-blue-500">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[300px]">{item.url}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => openLinkEdit(category.id, item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => deleteLink(category.id, item.id, section)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {category.items.length === 0 && (
                    <p className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm italic">此分类下暂无链接</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
           );
        })}
      </Accordion>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && !isSubmitting && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
            <DialogDescription>
              修改分类标题和图标。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-name" className="text-right">名称</Label>
              <Input
                id="cat-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-icon" className="text-right">图标</Label>
              <Input
                id="cat-icon"
                value={categoryIcon}
                onChange={(e) => setCategoryIcon(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCategorySave} className="bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSubmitting ? "保存中..." : "保存更改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && !isSubmitting && setEditingLink(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑网站信息</DialogTitle>
            <DialogDescription>修改网站详情。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-title" className="text-right">标题</Label>
              <Input
                id="link-title"
                value={linkForm.title}
                onChange={(e) => setLinkForm({...linkForm, title: e.target.value})}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-url" className="text-right">URL</Label>
              <Input
                id="link-url"
                value={linkForm.url}
                onChange={(e) => setLinkForm({...linkForm, url: e.target.value})}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-desc" className="text-right">描述</Label>
              <Textarea
                id="link-desc"
                value={linkForm.description}
                onChange={(e) => setLinkForm({...linkForm, description: e.target.value})}
                className="col-span-3 resize-none"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-tags" className="text-right">标签</Label>
              <Input
                id="link-tags"
                value={linkForm.tags}
                onChange={(e) => setLinkForm({...linkForm, tags: e.target.value})}
                className="col-span-3"
                placeholder="逗号分隔"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-featured" className="text-right">精选推荐</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="link-featured" 
                  checked={linkForm.isFeatured}
                  onCheckedChange={(checked) => setLinkForm({...linkForm, isFeatured: checked as boolean})}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="link-featured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  显示在首页“精选{section === 'home' ? '网站' : section === 'projects' ? '项目' : '工具'}”板块
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleLinkSave} className="bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSubmitting ? "保存中..." : "保存更改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
