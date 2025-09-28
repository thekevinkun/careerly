import AiPoweredCard from "./AiPoweredCard";
import BarChartCard from "./BarChartCard";

const RightPanel = ({
  isLoading,
  selectedJobId,
}: {
  isLoading?: boolean;
  selectedJobId?: string | null;
}) => {
  return (
    <aside className="h-full w-full flex flex-col sm:flex-row lg:flex-col gap-6">
      {/* AI Powered */}
      <AiPoweredCard
        isLoading={isLoading}
        selectedJobId={selectedJobId || ""}
      />

      {/* Chart */}
      <div className="hidden sm:flex sm:flex-1">
        <BarChartCard />
      </div>
    </aside>
  );
};

export default RightPanel;
