"use client";

import { useCVData } from "@/hooks/useCVData";
import { useRouter } from "next/navigation";
import { AdminEditPage } from "@/components/admin/AdminEditPage";
import { AdminLoginModal } from "@/components/admin/AdminLoginModal";

export default function EditPage() {
  const { isAdmin, isAuthChecking } = useCVData();
  const router = useRouter();

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-xs text-muted animate-pulse uppercase tracking-[2px]">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <AdminLoginModal onClose={(success) => {
          if (success !== true) {
            router.push("/");
          }
        }} />
      </div>
    );
  }

  return <AdminEditPage />;
}
