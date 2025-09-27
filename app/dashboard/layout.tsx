"use client";

import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Header from "@/components/Header";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setOpen(true)} />

      {/* Mobile sidebar drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-80 !border-0">
          <VisuallyHidden>
            <SheetTitle>Sidebar Navigation</SheetTitle>
          </VisuallyHidden>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
