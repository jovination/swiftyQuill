import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background text-foreground overflow-hidden">
      {/* Subtle Background Gradients for Rich Aesthetics */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-chart-2/20 blur-[100px]" />

      <div className="hidden md:block relative z-10 border-r border-border/50 bg-background/80 backdrop-blur-xl">
        <AdminSidebar />
      </div>
      <div className="flex flex-col relative z-10 h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-8 overflow-y-auto overflow-x-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="relative z-10 h-full flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
