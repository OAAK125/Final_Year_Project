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

const UserProgressLineChart = dynamic(
  () => import("@/ui/quiz-dashboard/line-chart"),
  { ssr: false }
);
const SubTopicPerformanceChart = dynamic(
  () => import("@/ui/quiz-dashboard/bar-chart"),
  { ssr: false }
);

export default function PersonalizeMiddle() {
  const router = useRouter();
  const [hasLineChartData, setHasLineChartData] = useState(true);
  const [hasBarChartData, setHasBarChartData] = useState(true);

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

        <UserProgressLineChart onDataStatusChange={setHasLineChartData} />

        {!hasLineChartData && (
          <div className="md:col-span-3 md:row-span-2 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <p>
              Sorry, can't get enough information for this. Try a Practice Test!
            </p>
            <Button
              variant="default"
              className="mt-4"
              onClick={() => router.push("/dashboard/practice")}
            >
              Go to Practice Tests
            </Button>
          </div>
        )}
      </div>

      {/* Sub-topic Performance Chart Section */}
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

        <SubTopicPerformanceChart onDataStatusChange={setHasBarChartData} />

        {!hasBarChartData && (
          <div className="md:col-span-3 md:row-span-2 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <p>
              Try a Practice Test for more information.
            </p>
            <Button
              variant="default"
              className="mt-4"
              onClick={() => router.push("/dashboard/practice")}
            >
              Go to Practice Tests
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
