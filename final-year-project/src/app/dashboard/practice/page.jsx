"use client";

import { Clock, FileText, Users, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const triggerStyle =
  "text-sm px-4 py-2 border border-input rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring data-[state=open]:border-primary data-[state=open]:text-primary";

const PracticePage = () => {
  const features = [
    {
      id: "feature-1",
      type: "QUIZ",
      title: "AWS Cloud Architect",
      description: "Test your knowledge of AWS architecture and services.",
      image: "/assets/quiz/images.png",
      time: "90 mins",
      questions: 60,
      participants: 1200,
    },
    {
      id: "feature-2",
      type: "QUIZ",
      title: "Google Cloud Associate Engineer",
      description: "Evaluate your understanding of Google Cloud fundamentals.",
      image: "/assets/quiz/images.png",
      time: "75 mins",
      questions: 50,
      participants: 950,
    },
    {
      id: "feature-3",
      type: "QUIZ",
      title: "Microsoft Azure Fundamentals",
      description: "Assess your grasp of core Azure concepts and services.",
      image: "/assets/quiz/images.png",
      time: "60 mins",
      questions: 40,
      participants: 760,
    },
    {
      id: "feature-4",
      type: "QUIZ",
      title: "CompTIA Security+",
      description:
        "Challenge your knowledge in foundational security concepts.",
      image: "/assets/quiz/images.png",
      time: "90 mins",
      questions: 70,
      participants: 820,
    },
    {
      id: "feature-5",
      type: "QUIZ",
      title: "Cisco CCNA",
      description: "Test your understanding of networking fundamentals.",
      image: "/assets/quiz/images.png",
      time: "80 mins",
      questions: 65,
      participants: 690,
    },
    {
      id: "feature-6",
      type: "QUIZ",
      title: "DevOps Essentials",
      description: "Practice CI/CD, containerization and DevOps pipelines.",
      image: "/assets/quiz/images.png",
      time: "70 mins",
      questions: 55,
      participants: 980,
    },
  ];

  return (
    <section className="p-5 space-y-6 space-x-10">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold">Practice Test</h1>
        <p className="text-muted-foreground mt-2">
          Pick a test and start practising today.
        </p>
      </div>

      {/* Filters and Clear Link */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Select>
          <SelectTrigger className={triggerStyle}>
            <SelectValue placeholder="Certification Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="microsoft">Microsoft</SelectItem>
            <SelectItem value="cisco">CISCO</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="aws">AWS</SelectItem>
            <SelectItem value="comptia">CompTIA</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className={triggerStyle}>
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cloud">Cloud</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-between items-center gap-4">
          <Select>
            <SelectTrigger className={triggerStyle}>
              <SelectValue placeholder="Arrangement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <button className="text-sm text-primary hover:underline whitespace-nowrap">
            Clear filters
          </button>
        </div>
      </div>

      <Separator />

      {/* Test Cards */}
      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
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

export default PracticePage;
