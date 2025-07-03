"use client";

import { Users } from "lucide-react";
import Link from "next/link";

const HomeMiddle = () => {
  const features = [
    {
      id: "feature-1",
      type: "FORUM",
      title: "What is the best cloud certification?",
      image: "./assets/quiz/images.png",
      replies: "3.2k",
    },
    {
      id: "feature-2",
      type: "FORUM",
      title: "How to prepare for AWS Certified Solutions Architect?",
      image: "./assets/quiz/images.png",
      replies: "2.1k",
    },
    {
      id: "feature-3",
      type: "FORUM",
      title: "Is Azure better than AWS in 2025?",
      image: "./assets/quiz/images.png",
      replies: "1.6k",
    },
  ];

  return (
    <section className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Popular Topics</h2>
        <Link
          href="#"
          className="text-sm text-muted-foreground hover:underline"
        >
          Go to Forum
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted cursor-pointer"
          >
            <div className="w-full aspect-video overflow-hidden">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {feature.type}
                </p>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{feature.replies} Replies</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export { HomeMiddle };
