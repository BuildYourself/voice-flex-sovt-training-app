import { cn } from "@/lib/utils";

export function Progress({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-slate-200", className)}>
      <div className={cn("h-full rounded-full bg-electric-500 transition-all", indicatorClassName)} style={{ width: `${value}%` }} />
    </div>
  );
}
