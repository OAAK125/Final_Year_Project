"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  LineChart,
  XAxis,
  YAxis,
  Line as ReLine,
} from "recharts";
import { createClient } from "@/utils/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  minutes: {
    label: "Minutes Spent on Quizzes",
    color: "var(--chart-1)",
  },
  proficiency: {
    label: "Proficiency Change (%)",
    color: "var(--chart-2)",
  },
};

export default function UserProgressLineChart({ onDataStatusChange }) {
  const supabase = createClient();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: sessions } = await supabase
        .from("quiz_sessions")
        .select("started_at, ended_at, score")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("started_at", { ascending: true });

      const data = (sessions || []).map((session) => {
        const start = new Date(session.started_at);
        const end = new Date(session.ended_at);
        const durationMinutes = Math.round((end - start) / (1000 * 60));

        return {
          date: start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          minutes: durationMinutes,
          proficiency: session.score,
        };
      });

      setChartData(data);
    };

    fetchChartData();
  }, [supabase]);

  useEffect(() => {
    if (typeof onDataStatusChange === "function") {
      onDataStatusChange(chartData.length > 0);
    }
  }, [chartData, onDataStatusChange]);

  if (!chartData.length) return null;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full pt-10">
      <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
        />
        <YAxis
          yAxisId="left"
          domain={[0, "auto"]}
          tickFormatter={(val) => `${val}m`}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(val) => `${val}%`}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[180px]"
              labelFormatter={(value) => `Date: ${value}`}
              valueFormatter={(value, name) =>
                name === chartConfig.minutes.label
                  ? `${value} mins`
                  : `${value}%`
              }
            />
          }
        />
        <ReLine
          yAxisId="left"
          dataKey="minutes"
          name={chartConfig.minutes.label}
          type="monotone"
          stroke={chartConfig.minutes.color}
          strokeWidth={2}
          dot={false}
        />
        <ReLine
          yAxisId="right"
          dataKey="proficiency"
          name={chartConfig.proficiency.label}
          type="monotone"
          stroke={chartConfig.proficiency.color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
