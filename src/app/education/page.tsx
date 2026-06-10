import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Education",
    description: "IT degree from Setec Institute, full-stack Java bootcamp at Piset Java School, and ongoing DevOps self-study.",
    path: "/education",
  });
}

export default function EducationPage() {
  redirect("/#education");
}
