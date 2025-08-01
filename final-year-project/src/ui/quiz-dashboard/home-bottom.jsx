"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  FileText,
  Users,
  Bookmark,
  Bookmark as BookmarkSolid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const HomeBottom = () => {
  const supabase = createClient();
  const router = useRouter();

  const [certifications, setCertifications] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    const fetchRecommendations = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: sessions } = await supabase
        .from("quiz_sessions")
        .select("certification_id")
        .eq("user_id", user.id);

      let topicIdToUse = null;

      if (sessions && sessions.length > 0) {
        const certIds = sessions.map((s) => s.certification_id);
        const { data: userCerts } = await supabase
          .from("certifications")
          .select("id, topic_id")
          .in("id", certIds);

        const topicFrequency = {};
        userCerts.forEach((c) => {
          topicFrequency[c.topic_id] = (topicFrequency[c.topic_id] || 0) + 1;
        });

        topicIdToUse = Object.entries(topicFrequency).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0];
      }

      let certQuery = supabase.from("certifications").select(
        `id, name, duration_minutes, max_questions, topic_id, quizzes(participants, short_description, image)`
      );

      if (topicIdToUse) {
        certQuery = certQuery.eq("topic_id", topicIdToUse);
      }

      const { data: certs } = await certQuery;

      let sortedCerts = certs;
      if (!topicIdToUse) {
        sortedCerts = [...certs].sort(
          (a, b) => (b.quizzes?.[0]?.participants || 0) - (a.quizzes?.[0]?.participants || 0)
        );
      }

      const transformed = (sortedCerts || []).map((cert) => {
        const quiz = cert.quizzes?.[0];
        return {
          id: cert.id,
          type: "QUIZ",
          title: cert.name,
          description: quiz?.short_description || "No description provided.",
          image: quiz?.image || "/assets/quiz/images.png",
          time: `${cert.duration_minutes} mins`,
          questions: cert.max_questions,
          participants: quiz?.participants || 0,
        };
      });

      setCertifications(transformed);
    };

    const fetchBookmarks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("bookmarks")
        .select("certification_id")
        .eq("user_id", user.id);

      setBookmarkedIds(new Set(data?.map((b) => b.certification_id)));
    };

    fetchRecommendations();
    fetchBookmarks();
  }, []);

  const toggleBookmark = async (certId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (bookmarkedIds.has(certId)) {
      await supabase
        .from("bookmarks")
        .delete()
        .match({ user_id: user.id, certification_id: certId });
      setBookmarkedIds((prev) => {
        const updated = new Set(prev);
        updated.delete(certId);
        return updated;
      });
    } else {
      await supabase.from("bookmarks").insert({
        user_id: user.id,
        certification_id: certId,
      });
      setBookmarkedIds((prev) => new Set(prev).add(certId));
    }
  };

  return (
    <section className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Recommended Tests</h2>
        <Link
          href="/dashboard/practice"
          className="text-sm text-muted-foreground hover:underline"
        >
          Go to Practice Tests
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {certifications.map((cert) => (
          <Link
            key={cert.id}
            href={`/quiz/${cert.id}`}
            className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted"
          >
            <div className="relative w-full aspect-video overflow-hidden">
              <img
                src={cert.image}
                alt={cert.title}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBookmark(cert.id);
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 shadow-sm rounded-full"
                >
                  {bookmarkedIds.has(cert.id) ? (
                    <BookmarkSolid className="h-4 w-4 text-primary fill-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {cert.type}
                </p>
                <h3 className="text-lg font-semibold">{cert.title}</h3>
                <p className="text-sm text-muted-foreground py-2">
                  {cert.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{cert.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{cert.questions} Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{cert.participants.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export { HomeBottom };
