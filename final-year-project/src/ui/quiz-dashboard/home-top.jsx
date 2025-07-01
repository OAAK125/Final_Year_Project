"use client";

import { Clock, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dynamic from "next/dynamic";
import data from "./data.json";

const RadarChart = dynamic(() => import("./radar-chart"), { ssr: false });

const HomeTop = ({
  heading = "Continue Last Test",
  features = [
    {
      id: "feature-1",
      type: "QUIZ",
      title: "Google Cloud Certification",
      description: "Retake the test and try to improve your score.",
      image: "./assets/quiz/images.png",
    },
  ],
}) => {
  const feature = features[0];
  const progressPercent = 80;

  return (
    <section className="p-5">
      <h2 className="text-2xl font-semibold mb-5">{heading}</h2>

      <div className="container grid gap-5 md:grid-cols-5 md:grid-rows-3">
        {/* Feature 1 – spans 3 columns and 2 rows */}
        <div className="md:col-span-3 md:row-span-2 border border-border rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative w-full h-64 md:h-full">
            <img
              src={feature.image}
              alt={feature.title}
              className="absolute inset-0 w-full h-full object-fill"
            />
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-4 flex flex-col justify-center">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {feature.type}
              </p>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Progress value={progressPercent} className="w-full" />
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  {progressPercent}%
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>6 mins ago</span>
              </div>
            </div>

            <Button variant="default" size="sm" className="w-fit mt-2">
              Retake the test
            </Button>
          </div>
        </div>

        {/* Radar Chart – spans 2 columns and all 3 rows */}
        <div className="md:col-span-2 md:row-span-3 border border-border rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
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
      </div>
    </section>
  );
};

export { HomeTop };
