import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import MainContent from "@/components/dashboard/MainContent";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <MainContent />;
};

export default DashboardPage;
