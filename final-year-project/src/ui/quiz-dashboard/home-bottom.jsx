"use client";

import { Clock } from "lucide-react";
import Link from "next/link";

const HomeBottom = () => {
  const features = [
    {
      id: "feature-1",
      type: "QUIZ",
      title: "AWS Cloud Architect",
      description: "Test your knowledge of AWS architecture and services.",
      image: "./assets/quiz/images.png",
    },
    {
      id: "feature-2",
      type: "QUIZ",
      title: "Google Cloud Associate Engineer",
      description: "Evaluate your understanding of Google Cloud fundamentals.",
      image: "./assets/quiz/images.png",
    },
    {
      id: "feature-3",
      type: "QUIZ",
      title: "Microsoft Azure Fundamentals",
      description: "Assess your grasp of core Azure concepts and services.",
      image: "./assets/quiz/images.png",
    },
  ];

  return (
    <section className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Recommended Quizzes</h2>
        <Link
          href="#"
          className="text-sm text-muted-foreground hover:underline"
        >
          View more
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="border border-border rounded-xl overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105"
          >
            <div className="w-full aspect-video">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
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
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>90 mins</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export { HomeBottom };
