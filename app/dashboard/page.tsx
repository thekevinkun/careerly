import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/dashboard/Sidebar";
import RightPanel from "@/components/dashboard/RightPanel";
import JobList from "@/components/dashboard/JobList";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-3 gap-6">
        {/* Job applications */}
        <section className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <JobList />
            </CardContent>
          </Card>
        </section>

        {/* Right Panel */}
        <RightPanel />
      </main>
    </div>
  );
};

export default DashboardPage;
