"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  const [certifications, setCertifications] = useState([]);
  const [certificationTypes, setCertificationTypes] = useState([]);
  const [topics, setTopics] = useState([]);

  const [filters, setFilters] = useState({
    certificationType: "",
    topic: "",
    arrangement: "",
  });

  // ⬇ State to reset dropdown placeholder text
  const [selectedCertificationType, setSelectedCertificationType] =
    useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedArrangement, setSelectedArrangement] = useState("");

  // ✅ Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      const [
        { data: certTypes, error: certTypeError },
        { data: topicsData, error: topicsError },
      ] = await Promise.all([
        supabase.from("certification_type").select("id, name"),
        supabase.from("topics").select("id, name"),
      ]);

      if (certTypeError) {
        console.error(
          "Error fetching certification types:",
          certTypeError.message
        );
      } else if (certTypes) {
        setCertificationTypes(certTypes);
      }

      if (topicsError) {
        console.error("Error fetching topics:", topicsError.message);
      } else if (topicsData) {
        setTopics(topicsData);
      }
    };

    fetchFilters();
  }, []);

  // ✅ Fetch Certifications + Quizzes
  useEffect(() => {
    const fetchCertificationsAndQuizzes = async () => {
      let query = supabase.from("certifications").select(`
          id,
          name,
          duration_minutes,
          max_questions,
          certification_type_id,
          topic_id,
          quizzes(short_description, participants, image, created_at)
        `);

      if (filters.certificationType) {
        query = query.eq("certification_type_id", filters.certificationType);
      }
      if (filters.topic) {
        query = query.eq("topic_id", filters.topic);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Supabase Error:", error);
        return;
      }

      const transformed = data.map((cert) => {
        const firstQuiz = cert.quizzes?.[0];

        return {
          id: cert.id,
          type: "QUIZ",
          title: cert.name,
          description:
            firstQuiz?.short_description || "No description provided.",
          image: firstQuiz?.image || "/assets/quiz/images.png",
          time: `${cert.duration_minutes} mins`,
          questions: cert.max_questions,
          participants:
            firstQuiz?.participants ?? Math.floor(Math.random() * 9000) + 1000,
          created_at: firstQuiz?.created_at || "1970-01-01T00:00:00Z",
        };
      });

      switch (filters.arrangement) {
        case "popular":
          transformed.sort((a, b) => b.participants - a.participants);
          break;
        case "newest":
          transformed.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          break;
        case "alphabetical":
          transformed.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }

      setCertifications(transformed);
    };

    fetchCertificationsAndQuizzes();
  }, [filters]);

  return (
    <section className="p-5 space-y-6 space-x-10">
      <div>
        <h1 className="text-3xl font-bold">Practice Test</h1>
        <p className="text-muted-foreground mt-2">
          Pick a test and start practising today.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* Certification Type */}
        <Select
          value={selectedCertificationType}
          onValueChange={(value) => {
            setFilters({ ...filters, certificationType: value });
            setSelectedCertificationType(value);
          }}
        >
          <SelectTrigger className={triggerStyle}>
            <SelectValue placeholder="Certification Type" />
          </SelectTrigger>
          <SelectContent>
            {certificationTypes.map((ct) => (
              <SelectItem key={ct.id} value={ct.id.toString()}>
                {ct.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Topics */}
        <Select
          value={selectedTopic}
          onValueChange={(value) => {
            setFilters({ ...filters, topic: value });
            setSelectedTopic(value);
          }}
        >
          <SelectTrigger className={triggerStyle}>
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((tp) => (
              <SelectItem key={tp.id} value={tp.id.toString()}>
                {tp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Arrangement + Clear */}
        <div className="flex justify-between items-center gap-4">
          <Select
            value={selectedArrangement}
            onValueChange={(value) => {
              setFilters({ ...filters, arrangement: value });
              setSelectedArrangement(value);
            }}
          >
            <SelectTrigger className={triggerStyle}>
              <SelectValue placeholder="Arrangement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <button
            className="text-sm text-primary hover:underline whitespace-nowrap"
            onClick={() => {
              setFilters({
                certificationType: "",
                topic: "",
                arrangement: "",
              });
              setSelectedCertificationType("");
              setSelectedTopic("");
              setSelectedArrangement("");
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <Separator />

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
        {certifications.map((feature) => (
          <Link
            key={feature.id}
            href={`/quiz/${feature.id}`}
            className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted"
          >
            <div className="relative w-full aspect-video overflow-hidden">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />

              {/* Bookmark button — works safely inside Link if not submitting anything */}
              <div
                onClick={(e) => {
                  e.preventDefault(); // prevent redirect if button is clicked
                  e.stopPropagation();
                  // Add bookmark logic here
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 shadow-sm rounded-full"
                >
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
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
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PracticePage;
