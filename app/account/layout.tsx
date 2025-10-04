import Header from "@/components/Header";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}