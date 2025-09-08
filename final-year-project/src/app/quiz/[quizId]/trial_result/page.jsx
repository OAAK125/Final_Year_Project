"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import dayjs from "dayjs";

const TrialQuizResultsPage = () => {
  const { quizId } = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const supabase = createClient();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!sessionId) return;

      const { data: authData, error: userError } = await supabase.auth.getUser();
      const user = authData?.user;

      if (userError || !user) {
        router.push("/authentication/login");
        return;
      }

      const userId = user.id;

      // ✅ trial session check
      const { data: sessionData, error: sessionError } = await supabase
        .from("trial_quiz_sessions")
        .select("id, ended_at, user_id")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      if (sessionError || !sessionData) {
        router.push(`/quiz/${quizId}`);
        return;
      }

      // ✅ profile / legacy profile check
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      const { data: legacyProfile } = !profile
        ? await supabase
            .from("user_profiles")
            .select("full_name, profile_picture")
            .eq("id", userId)
            .maybeSingle()
        : { data: null };

      const displayName =
        (profile && profile.full_name) ||
        (legacyProfile && legacyProfile.full_name) ||
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        "User";

      const displayAvatar =
        (profile && profile.avatar_url) ||
        (legacyProfile && legacyProfile.profile_picture) ||
        user.user_metadata.avatar_url ||
        "";

      // ✅ answers from trial_answers + trial_questions
      const { data: rows } = await supabase
        .from("trial_answers")
        .select(
          `id, created_at, question_id, selected_answer, is_correct,
           trial_questions!inner(id, question_text, correct_answer, explanation, certification_id)`
        )
        .eq("trial_quiz_session_id", sessionId)
        .eq("user_id", userId)
        .eq("trial_questions.certification_id", quizId)
        .order("created_at", { ascending: true });

      const merged = (rows || []).map((r) => ({
        question: r.trial_questions?.question_text ?? "",
        correctAnswer: r.trial_questions?.correct_answer ?? "",
        selectedAnswer: r.selected_answer,
        isCorrect: r.selected_answer === null ? false : !!r.is_correct,
        explanation: r.trial_questions?.explanation ?? "",
      }));

      const total = merged.length;
      const correctCount = (rows || []).filter((r) => !!r.is_correct).length;
      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      // ✅ update score in trial_quiz_sessions
      await supabase
        .from("trial_quiz_sessions")
        .update({ score })
        .eq("id", sessionId)
        .eq("user_id", userId);

      setUserData({
        name: displayName,
        avatar: displayAvatar,
        score,
      });

      setAnswers(merged);
      setEndedAt(sessionData?.ended_at);
      setLoading(false);
    };

    fetchResults();
  }, [quizId, sessionId, supabase, router]);

  const title = "Trial Assessment Report";
  const description = userData
    ? `You have scored ${userData.score}% on your trial quiz.`
    : "Loading your results...";
  const formattedDate = endedAt ? dayjs(endedAt).format("MMMM D, YYYY") : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your results...</p>
      </div>
    );
  }

  return (
    <section className="py-10 px-10">
      <div className="relative">
        <div className="container max-w-5xl mx-auto flex flex-col items-center text-center space-y-4 p-4">
          <div className="w-full flex justify-start">
            <Button
              variant="ghost"
              onClick={() => router.push(`/quiz/${quizId}`)}
              className="flex items-center"
            >
              <X className="w-6 h-6 mr-1" />
            </Button>
          </div>

          <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
          <h3 className="text-muted-foreground text-lg md:text-xl">
            {description}
          </h3>

          {userData && (
            <div className="flex items-center gap-3 text-sm md:text-base">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback>
                  {(userData.name || "U")
                    .split(" ")
                    .map((n) => (n && n[0]) || "")
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span>
                <span className="font-semibold">{userData.name}</span>
                <span className="ml-1">on {formattedDate}</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-center">
            Trial Answer Breakdown
          </h2>
          {answers.length === 0 && (
            <p className="text-center text-muted-foreground">
              No answers recorded for this session.
            </p>
          )}
          {answers.map((item, index) => (
            <Card
              key={index}
              className={`p-4 border rounded-xl ${
                item.isCorrect
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <p className="font-medium mb-2">
                Q{index + 1}: {item.question}
              </p>
              <p>
                Your answer:{" "}
                <span className="font-semibold">
                  {item.selectedAnswer ?? "Not answered"}
                </span>
              </p>
              <p>
                Correct answer:{" "}
                <span className="font-semibold">{item.correctAnswer}</span>
              </p>
              {item.explanation && (
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Explanation:</span>{" "}
                  {item.explanation}
                </p>
              )}
              <p
                className={`mt-2 font-semibold ${
                  item.isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.selectedAnswer === null
                  ? "Incorrect ❌"
                  : item.isCorrect
                  ? "Correct ✅"
                  : "Incorrect ❌"}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrialQuizResultsPage;
