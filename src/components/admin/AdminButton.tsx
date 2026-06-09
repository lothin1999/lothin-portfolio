"use client";

import { useState } from "react";
import { Pencil, Lock } from "lucide-react";
import { useCVData } from "@/hooks/useCVData";
import { AdminLoginModal } from "./AdminLoginModal";
import { AdminEditModal } from "./AdminEditModal";

export function AdminButton() {
  const { isAdmin } = useCVData();
  const [showLogin, setShowLogin] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleClick = () => {
    if (isAdmin) {
      setShowEdit(true);
    } else {
      setShowLogin(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title={isAdmin ? "Edit CV" : "Admin login"}
        className="fixed bottom-6 right-6 z-[100] w-11 h-11 rounded-full bg-ink text-white shadow-lg hover:bg-accent transition-colors flex items-center justify-center"
        aria-label={isAdmin ? "Edit CV" : "Admin login"}
      >
        {isAdmin ? <Pencil size={16} /> : <Lock size={15} />}
      </button>

      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
      {showEdit && <AdminEditModal onClose={() => setShowEdit(false)} />}
    </>
  );
}
