// src/app/edit/page.tsx
import { redirect } from "next/navigation";

export default function EditPage() {
  redirect("/?edit=true");
}
