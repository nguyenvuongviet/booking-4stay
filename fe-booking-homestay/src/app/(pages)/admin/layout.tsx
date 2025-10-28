"use client";

import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import Loader from "@/components/loader/Loader";
import { getCurrentUser, isAdmin } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    console.log(user);

    if (!user || !isAdmin(user)) {
      router.replace("/auth/login?next=/admin");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminHeader />
      <main className="ml-64 mt-16 p-6">{children}</main>
    </div>
  );
}
