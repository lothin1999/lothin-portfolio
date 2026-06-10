"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCVData } from "@/hooks/useCVData";
import { AdminLoginModal } from "./AdminLoginModal";
import { AdminEditModal } from "./AdminEditModal";

function AdminHandler() {
  const { isAdmin } = useCVData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasEditParam = searchParams.has("edit");

  const [showLogin, setShowLogin] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (hasEditParam) {
      if (isAdmin) {
        setShowEdit(true);
        setShowLogin(false);
      } else {
        setShowLogin(true);
        setShowEdit(false);
      }
    } else {
      setShowLogin(false);
      setShowEdit(false);
    }
  }, [hasEditParam, isAdmin]);

  const handleCloseLogin = () => {
    setShowLogin(false);
    if (!isAdmin) {
      // Clear query param
      router.replace("/", { scroll: false });
    }
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    // Clear query param
    router.replace("/", { scroll: false });
  };

  return (
    <>
      {showLogin && <AdminLoginModal onClose={handleCloseLogin} />}
      {showEdit && <AdminEditModal onClose={handleCloseEdit} />}
    </>
  );
}

export function AdminButton() {
  return (
    <Suspense fallback={null}>
      <AdminHandler />
    </Suspense>
  );
}
