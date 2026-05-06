/**
 * Admin Layout
 * ✅ Protected layout for all admin pages
 */

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import AdminNav from "@/components/admin/AdminNav";
import { Toaster } from "sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
