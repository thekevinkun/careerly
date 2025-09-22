import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import JobDetail from "@/components/jobs/JobDetail";

const JobPage = async ({ params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <JobDetail jobId={params.id}/>;
};

export default JobPage;
