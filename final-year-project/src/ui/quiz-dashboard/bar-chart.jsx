"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function SubTopicPerformanceChart({ onDataStatusChange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        onDataStatusChange?.(false);
        return;
      }

      const { data: correctAnswers, error } = await supabase
        .from("answers")
        .select(`
          question_id,
          is_correct,
          quiz_session:quiz_session_id (
            id,
            completed,
            user_id
          ),
          questions:question_id (
            sub_topic
          )
        `)
        .eq("is_correct", true)
        .eq("quiz_session.user_id", user.id)
        .eq("quiz_session.completed", true);

      if (error) {
        setLoading(false);
        onDataStatusChange?.(false);
        return;
      }

      const counts = {};
      for (const row of correctAnswers || []) {
        const sub_topic = row.questions?.sub_topic;
        if (sub_topic) {
          counts[sub_topic] = (counts[sub_topic] || 0) + 1;
        }
      }

      const chartData = Object.entries(counts)
        .map(([sub_topic, correct_count]) => ({
          sub_topic,
          correct_count,
        }))
        .sort((a, b) => b.correct_count - a.correct_count)
        .slice(0, 5);

      setData(chartData);
      setLoading(false);
      onDataStatusChange?.(chartData.length > 0);
    };

    fetchData();
  }, []);



  if (loading || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        {loading ? "Loading..." : "No data available. Try more Practice Tests!"}
      </div>
    );
  }

  return (
    <ChartContainer
      className="h-[250px] w-full"
      config={{
        correct_count: {
          label: "Correct Answers",
          color: "var(--chart-1)",
        },
        label: {
          color: "var(--background)",
        },
      }}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ right: 16 }}
        barSize={24}
      >
        <CartesianGrid horizontal={false} />
        <YAxis type="category" dataKey="sub_topic" hide />
        <XAxis type="number" dataKey="correct_count" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="correct_count"
          fill="var(--color-desktop)"
          radius={4}
        >
          <LabelList
            dataKey="sub_topic"
            position="insideLeft"
            offset={8}
            className="fill-[var(--color-label)]"
            fontSize={12}
          />
          <LabelList
            dataKey="correct_count"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
