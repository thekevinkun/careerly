import JobDetail from "@/components/jobs/JobDetail";

const JobPage = async ({ params }: { params: { id: string } }) => {
  return <JobDetail jobId={params.id}/>;
};

export default JobPage;
