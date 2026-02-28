import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  )
}

// 骨架卡片 - 用于资源展示
function CardSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 mt-3">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

// 骨架分类区域
function CategorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

// 骨架列表项
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
      <Skeleton className="w-8 h-8 rounded" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="w-8 h-8 rounded" />
    </div>
  )
}

// 骨架博客卡片
function BlogCardSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// 骨架动态
function MomentSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, CategorySkeleton, ListItemSkeleton, BlogCardSkeleton, MomentSkeleton }
