import Header from "@/components/Header";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen bg-muted/20 flex flex-col">
      <Header />

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
