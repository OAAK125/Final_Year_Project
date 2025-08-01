"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createClient } from "@/utils/supabase/client";

dayjs.extend(relativeTime);

const SubTopicPerformanceChart = dynamic(
  () => import("@/ui/quiz-dashboard/bar-chart"),
  { ssr: false }
);

const HomeTop = ({ heading = "Retake Last Test" }) => {
  const router = useRouter();
  const supabase = createClient();

  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChartData, setHasChartData] = useState(true); // ✅ added state here

  useEffect(() => {
    const fetchLatestTest = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return setLoading(false);

      const { data: session } = await supabase
        .from("quiz_sessions")
        .select("id, certification_id, ended_at, score, completed")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("ended_at", { ascending: false })
        .limit(1)
        .single();

      if (!session) {
        setFeature(null);
        setLoading(false);
        return;
      }

      const { data: cert } = await supabase
        .from("certifications")
        .select("name, id")
        .eq("id", session.certification_id)
        .single();

      const { data: quiz } = await supabase
        .from("quizzes")
        .select("image")
        .eq("certification_id", cert.id)
        .limit(1)
        .single();

      setFeature({
        title: cert.name,
        score: session.score,
        timeAgo: dayjs(session.ended_at).fromNow(),
        image: quiz?.image || "/placeholder.png",
        id: cert.id,
      });

      setLoading(false);
    };

    fetchLatestTest();
  }, [supabase]);

  return (
    <section className="p-5">
      <h2 className="text-2xl font-semibold mb-5">{heading}</h2>

      <div className="container grid gap-5 md:grid-cols-5 md:grid-rows-3">
        {/* Retake Last Test */}
        {!loading && feature ? (
          <div className="md:col-span-3 md:row-span-2 border border-border rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="relative w-full h-64 md:h-full">
              <img
                src={feature.image}
                alt={feature.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            <div className="p-6 md:p-8 space-y-4 flex flex-col justify-center">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  QUIZ
                </p>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">
                  Retake the test and try to improve your score.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Progress value={feature.score} className="w-full" />
                  <span className="ml-3 text-sm font-medium text-muted-foreground">
                    {feature.score}%
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{feature.timeAgo}</span>
                </div>
              </div>

              <Button
                variant="default"
                size="sm"
                className="w-fit mt-2"
                onClick={() => router.push(`/quiz/${feature.id}`)}
              >
                Retake the test
              </Button>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="md:col-span-3 md:row-span-2 flex flex-col items-center justify-center border rounded-xl p-6 text-center text-muted-foreground">
              <p>No quiz history found. Take a quiz to get started!</p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => router.push("/dashboard/practice")}
              >
                Go to Practice Tests
              </Button>
            </div>
          )
        )}

        {/* Sub-topic performance chart */}
        <div className="md:col-span-2 md:row-span-3 border border-border rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">
                Your Sub-topic Strengths
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="text-sm max-w-xs">
                  This shows how many times you've correctly answered questions
                  in each sub-topic.
                </PopoverContent>
              </Popover>
            </div>

            <SubTopicPerformanceChart onDataStatusChange={setHasChartData} />

            {hasChartData ? (
              <Button variant="outline" className="mt-4 w-fit"
               onClick={() => router.push("/dashboard/personalized")}>
                Improve Your Weak Areas
              </Button>
            ) : (
              <Button
                variant="default"
                className="mt-4 w-fit"
                onClick={() => router.push("/dashboard/practice")}
              >
                Go to Practice Test
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { HomeTop };
