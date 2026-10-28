import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-16">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-72 w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
