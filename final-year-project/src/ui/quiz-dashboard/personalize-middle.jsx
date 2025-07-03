"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import dynamic from "next/dynamic";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import data from "./data.json";

// Lazy load radar chart
const RadarChart = dynamic(() => import("./radar-chart"), { ssr: false });

// Line chart sample data
const chartData = [
  { date: "Mon", hours: 1.5, proficiency: 72 },
  { date: "Tue", hours: 2.0, proficiency: 85 },
  { date: "Wed", hours: 1.2, proficiency: 78 },
  { date: "Thu", hours: 2.3, proficiency: 92 },
  { date: "Fri", hours: 1.8, proficiency: 88 },
  { date: "Sat", hours: 2.5, proficiency: 95 },
  { date: "Sun", hours: 2.1, proficiency: 80 },
  { date: "Mon", hours: 1.9, proficiency: 84 },
  { date: "Tue", hours: 2.4, proficiency: 90 },
  { date: "Wed", hours: 2.2, proficiency: 87 },
];

const chartConfig = {
  hours: {
    label: "Hours Quizzed",
    color: "var(--chart-1)",
  },
  proficiency: {
    label: "Proficiency Change (%)",
    color: "var(--chart-2)",
  },
};

export default function PersonalizeMiddle() {
  const totals = React.useMemo(() => {
    const hoursTotal = chartData.reduce((sum, entry) => sum + entry.hours, 0);
    const proficiencyTotal = chartData.reduce(
      (sum, entry) => sum + entry.proficiency,
      0
    );
    return {
      hours: hoursTotal.toFixed(1),
      proficiency: (proficiencyTotal / chartData.length).toFixed(1),
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4">
      {/* Line Chart Section */}
      <div className="border border-border rounded-xl overflow-hidden py-4">
        <div className="flex flex-col items-stretch border-b px-6">
          <div className="flex items-center justify-items-normal gap-3">
          <h2 className="text-xl font-semibold py-3">Progress Over Time</h2>
          <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm max-w-xs">
                This is how it works.
              </PopoverContent>
            </Popover>
            </div>
          <div className="flex divide-x">
            {["hours", "proficiency"].map((key) => (
              <div
                key={key}
                className="flex flex-col justify-center gap-1 px-6 py-4 text-left"
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold">
                  {key === "hours"
                    ? `${totals.hours} hrs`
                    : `${totals.proficiency}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] w-full"
          >
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
                domain={[0, 3]}
                tickFormatter={(val) => `${val}h`}
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
                    labelFormatter={(value) => `Day: ${value}`}
                    valueFormatter={(value, name) =>
                      name === "Hours Quizzed" ? `${value} hrs` : `${value}%`
                    }
                  />
                }
              />
              <Line
                yAxisId="left"
                dataKey="hours"
                name="Hours Quizzed"
                type="monotone"
                stroke={chartConfig.hours.color}
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                dataKey="proficiency"
                name="Proficiency Change (%)"
                type="monotone"
                stroke={chartConfig.proficiency.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Radar Chart Section */}
      <div className="border border-border rounded-xl overflow-hidden p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-items-normal gap-3">
          <h3 className="text-xl font-semibold">
            Your Skill Proficiency Overview
          </h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm max-w-xs">
              This is how it works.
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full h-[250px]">
          <RadarChart data={data} />
        </div>

        <Button variant="outline" className="mt-4 w-fit">
          Improve your Skill Proficiency
        </Button>
      </div>
    </div>
  );
}
