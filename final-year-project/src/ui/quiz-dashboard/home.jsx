"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Bookmark, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardHome() {
  return (
    <section className="p-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Section */}
      <div className="space-y-6 lg:col-span-2">
        {/* Continue Quiz */}
        <div className="space-y-4 lg:col-span-2 order-1">
          <h2 className="text-xl font-bold tracking-tight">Continue Quiz</h2>
          <Card className="flex flex-col md:flex-row items-center md:items-stretch p-4">
            <div className="w-full md:w-1/3 bg-muted flex items-center justify-center rounded-lg">
              <Image
                src="/assets/quiz/images.png"
                alt="UX Design"
                width={120}
                height={120}
              />
            </div>
            <div className="flex flex-col justify-between w-full md:w-2/3 p-4">
              <p className="text-xs font-semibold text-muted-foreground">QUIZ</p>
              <h3 className="font-bold text-lg">Google AWS Cloud</h3>
              <p className="text-sm text-muted-foreground">Try to improve your score</p>
              <div className="flex items-center gap-2">
                <Progress value={94} className="w-2xs h-2" />
                <span className="text-xs">94%</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">6h ago</span>
              </div>
              <Button className="mt-3 w-full md:w-fit">Retake Quiz</Button>
            </div>
          </Card>
        </div>

        {/* Trending Topics */}
<div className="lg:col-span-3 space-y-4 order-4 pt-5">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold tracking-tight">Trending Topics</h2>
    <Link href="#" className="text-sm text-muted-foreground hover:underline">
      View all
    </Link>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
    {[1, 2].map((i) => (
      <Card key={i} className="p-4">
        <div className="flex gap-4">
          <div className="w-1/3 flex items-center justify-center rounded-md bg-muted">
            <Image
              src="/assets/quiz/images.png"
              alt="Trending"
              width={100}
              height={100}
              className="rounded-md"
            />
          </div>
          <div className="w-2/3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">TOPIC</p>
            <h3 className="font-bold text-base">
              {i === 1 ? "The Future of AWS" : "Mastering Cloud Skills"}
            </h3>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{i === 1 ? "5 mins ago" : "1h ago"}</span>
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
</div>
    </div>

      {/* Right Section */}
      <div className="space-y-1">
        {/* Score Chart */}
        <Card className="p-4 my-6 lg:mt-0">
          <div className="space-y-2 order-2 lg:order-1">
            <h2 className="text-lg font-medium">Skill Level</h2>
            <p className="text-sm text-muted-foreground">Part of top 30%</p>
            <div className="w-full h-48 bg-muted rounded-md" />
            <Button className="w-full mt-3">Improve your knowledge</Button>
          </div>
        </Card>
      </div>

      {/* Recommended Section */}
      <div className="lg:col-span-3 space-y-4  order-3 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Recommended for you</h2>
          <Link href="#" className="text-sm text-muted-foreground hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card className="p-4">
              <Image
                src={`/assets/quiz/images.png`}
                alt="Course"
                width={60}
                height={60}
              />
              <div className="mt-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Quiz</p>
                <h3 className="font-bold">{i === 1 ? "AWS ReStart" : "Microsoft Cloud Services"}</h3>
                <p className="text-sm text-muted-foreground">
                  {i === 1
                    ? "Begin your journey in cloud computing with AWS ReStart."
                    : "Learn the fundamentals of Microsoft Cloud Services."}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Clock className="h-4 w-4" />
                  <span className="pr-2">90 mins</span>
                  <Users className="h-4 w-4 text-yellow-500" />
                  <span>{i === 1 ? "1.8k" : "3.3k"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
