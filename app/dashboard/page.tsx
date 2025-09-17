import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import AddJobForm from "@/components/AddJobForm";
import JobList from "@/components/JobList";
import LogoutButton from "@/components/LogoutButton";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <header className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Signed in as {session.user.email}
        </div>
        <LogoutButton />
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1">
          <AddJobForm />
        </section>
        <section className="md:col-span-2">
          <JobList />
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
