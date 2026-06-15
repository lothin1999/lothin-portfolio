"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasEditParam = searchParams?.has("edit") ?? false;

  useEffect(() => {
    if (hasEditParam) {
      router.push("/edit");
    }
  }, [hasEditParam, router]);

  return null;
}

export function AdminButton() {
  return (
    <Suspense fallback={null}>
      <AdminHandler />
    </Suspense>
  );
}
