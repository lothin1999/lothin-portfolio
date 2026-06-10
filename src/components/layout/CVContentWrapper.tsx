"use client";

import { useCVData } from "@/hooks/useCVData";
import { LockScreen } from "../ui/LockScreen";

export function CVContentWrapper({ children }: { children: React.ReactNode }) {
  const { isLocked, isLoading } = useCVData();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-bg text-ink font-mono text-[12px] tracking-widest uppercase">
        Loading...
      </div>
    );
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return <>{children}</>;
}
