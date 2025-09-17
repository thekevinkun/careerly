import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import AddJobForm from "@/components/dashboard/AddJobForm";
import JobList from "@/components/dashboard/JobList";
import LogoutButton from "@/components/LogoutButton";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col p-6">
        <h1 className="logo text-2xl font-bold text-primary mb-8">Careerly</h1>

        <Button className="w-full mb-6 bg-primary text-primary-foreground hover:opacity-90">
          + Add Job
        </Button>

        <nav className="space-y-2 text-sm">
          <div className="flex-between px-2 py-1 rounded hover:bg-muted cursor-pointer">
            <span>Applied</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">4</span>
          </div>
          <div className="flex-between px-2 py-1 rounded hover:bg-muted cursor-pointer">
            <span>Interviewing</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              13
            </span>
          </div>
          <div className="flex-between px-2 py-1 rounded hover:bg-muted cursor-pointer">
            <span>Offer</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              20
            </span>
          </div>
          <div className="flex-between px-2 py-1 rounded hover:bg-muted cursor-pointer">
            <span>Rejected</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">3</span>
          </div>
        </nav>

        <Separator className="my-6" />

        <LogoutButton />
      </aside>

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
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Resume & Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
                Generate Suggestions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex-center text-muted-foreground">
                [Chart here]
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default DashboardPage;
