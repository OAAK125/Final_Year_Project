"use client";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const RadarGraph = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarGraph;
