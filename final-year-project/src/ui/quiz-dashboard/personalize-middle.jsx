"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dynamic from "next/dynamic";

// Dynamic imports
const UserProgressLineChart = dynamic(() => import("@/ui/quiz-dashboard/line-chart"));
const SubTopicPerformanceChart = dynamic(
  () => import("@/ui/quiz-dashboard/bar-chart"),
  { ssr: false }
);

export default function PersonalizeMiddle({ subscriptionPlan }) {
  const router = useRouter();
  const [hasBarChartData, setHasBarChartData] = useState(true);

  const isPaid =
    subscriptionPlan === "standard" || subscriptionPlan === "full_access";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4">
      {/* Line Chart Section */}
      <div className="border border-border rounded-xl overflow-hidden py-4">
        <div className="flex items-center gap-3 px-6 pb-2">
          <h2 className="text-xl font-semibold">Progress Over Time</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm max-w-xs">
              This tracks how many minutes you’ve spent on quizzes and how your
              scores have changed.
            </PopoverContent>
          </Popover>
        </div>

        {isPaid ? (
          <UserProgressLineChart />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Button onClick={() => router.push("/pricing")}>
              Pay to View
            </Button>
          </div>
        )}
      </div>

      {/* Bar Chart Section */}
      <div className="border border-border rounded-xl overflow-hidden p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">Your Sub-topic Strengths</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm max-w-xs">
              This shows how many times you've correctly answered questions in
              each sub-topic.
            </PopoverContent>
          </Popover>
        </div>

        {isPaid ? (
          <>
            <SubTopicPerformanceChart onDataStatusChange={setHasBarChartData} />
            {!hasBarChartData && (
              <div className="col-span-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <Button
                  variant="default"
                  className="mt-4"
                  onClick={() => router.push("/dashboard/practice")}
                >
                  Go to Practice Test
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Button onClick={() => router.push("/pricing")}>
              Pay to View
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
