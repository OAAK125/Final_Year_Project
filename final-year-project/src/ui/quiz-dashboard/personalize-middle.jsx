"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";

// Dynamic imports
const UserProgressLineChart = dynamic(() => import("@/ui/quiz-dashboard/line-chart"));
const SubTopicPerformanceChart = dynamic(
  () => import("@/ui/quiz-dashboard/bar-chart"),
  { ssr: false }
);

// ✅ Plan IDs (centralize in /constants/planIds.js ideally)
const FREE_PLAN_ID = "c000440f-2269-4e17-b445-e1c4510504d8";
const STANDARD_PLAN_ID = "5623589a-885c-4ac1-8842-12247cadc89e";
const FULL_ACCESS_PLAN_ID = "3ed77a5b-3fde-4bf8-ae4d-7952ec8197b6";

export default function PersonalizeMiddle() {
  const router = useRouter();
  const supabase = createClient();

  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasBarChartData, setHasBarChartData] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setSubscription(sub);
      setLoading(false);
    };

    fetchSubscription();
  }, [supabase]);

  const planId = subscription?.plan_id;
  const isFree = !subscription || planId === FREE_PLAN_ID;
  const isStandard = planId === STANDARD_PLAN_ID;
  const isFullAccess = planId === FULL_ACCESS_PLAN_ID;
  const isPaid = isStandard || isFullAccess;

  if (loading) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

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
            {userId && (
              <Button
                onClick={() => router.push(`/pricing/${userId}`)}
                className="text-base font-semibold"
              >
                Pay to View
              </Button>
            )}
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
            {userId && (
              <Button
                onClick={() => router.push(`/pricing/${userId}`)}
                className="text-base font-semibold"
              >
                Pay to View
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
