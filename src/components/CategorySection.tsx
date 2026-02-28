import type { Category } from "@/types";
import { LinkCard } from "./LinkCard";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";


interface CategorySectionProps {
  category: Category;
}

export function CategorySection({ category }: CategorySectionProps) {
  const IconComponent = (category.icon && (Icons[category.icon as keyof typeof Icons] as LucideIcon)) || Icons.Folder;

  if (category.items.length === 0) return null;

  return (
    <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-4 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {category.title}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {category.items.map((item) => (
          <div key={item.id} className="h-full">
            <LinkCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
