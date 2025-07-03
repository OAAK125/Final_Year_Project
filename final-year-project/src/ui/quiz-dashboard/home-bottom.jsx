"use client";

import { Clock, FileText, Users, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HomeBottom = () => {
  const features = [
    {
      id: "feature-1",
      type: "QUIZ",
      title: "AWS Cloud Architect",
      description: "Test your knowledge of AWS architecture and services.",
      image: "./assets/quiz/images.png",
      time: "90 mins",
      questions: 60,
      participants: 1200,
    },
    {
      id: "feature-2",
      type: "QUIZ",
      title: "Google Cloud Associate Engineer",
      description: "Evaluate your understanding of Google Cloud fundamentals.",
      image: "./assets/quiz/images.png",
      time: "75 mins",
      questions: 50,
      participants: 950,
    },
    {
      id: "feature-3",
      type: "QUIZ",
      title: "Microsoft Azure Fundamentals",
      description: "Assess your grasp of core Azure concepts and services.",
      image: "./assets/quiz/images.png",
      time: "60 mins",
      questions: 40,
      participants: 760,
    },
  ];

  return (
    <section className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Recommended Tests</h2>
        <Link
          href="#"
          className="text-sm text-muted-foreground hover:underline"
        >
          Go to Practice Tests
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted hover:cursor-pointer"
          >
            <div className="relative w-full aspect-video overflow-hidden">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 shadow-sm rounded-full"
              >
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {feature.type}
                </p>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground py-2">
                  {feature.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{feature.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{feature.questions} Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{feature.participants.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export { HomeBottom };
