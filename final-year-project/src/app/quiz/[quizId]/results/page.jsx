"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import dayjs from "dayjs";

const QuizResultsPage = () => {
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

      // 1) Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/authentication/login");
        return;
      }

      const userId = user.id;

      // 2) Verify quiz session belongs to user and fetch ended_at
      const { data: sessionData, error: sessionError } = await supabase
        .from("quiz_sessions")
        .select("id, ended_at, user_id")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      if (sessionError || !sessionData) {
        // session not found or not user's; kick back
        router.push(`/quiz/${quizId}`);
        return;
      }

      // 3) Profile (optional)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, profile_picture")
        .eq("id", userId)
        .single();

      // 4) Pull only answers that are part of THIS quiz_session, and join with their questions
      //    .inner join ensures we only include questions that exist and (optionally) belong to this certification
      const { data: rows } = await supabase
        .from("answers")
        .select(
          `id, created_at, question_id, selected_answer, is_correct,
           questions!inner(id, question_text, correct_answer, explanation, certification_id)`
        )
        .eq("quiz_session_id", sessionId)
        .eq("user_id", userId)
        .eq("questions.certification_id", quizId)
        .order("created_at", { ascending: true });

      const merged = (rows || []).map((r) => ({
        question: r.questions?.question_text ?? "",
        correctAnswer: r.questions?.correct_answer ?? "",
        selectedAnswer: r.selected_answer, // may be null -> display "Not answered"
        isCorrect: r.selected_answer === null ? false : !!r.is_correct,
        explanation: r.questions?.explanation ?? "",
      }));

      const total = merged.length;
      const correctCount = (rows || []).filter((r) => !!r.is_correct).length;
      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      // 5) Save score on the session (idempotent)
      await supabase
        .from("quiz_sessions")
        .update({ score })
        .eq("id", sessionId)
        .eq("user_id", userId);

      setUserData({
        name:
          profile?.full_name ||
          user.user_metadata.full_name ||
          user.user_metadata.name ||
          "User",
        avatar: profile?.profile_picture || user.user_metadata.avatar_url || "",
        score,
      });

      setAnswers(merged);
      setEndedAt(sessionData?.ended_at);
      setLoading(false);
    };

    fetchResults();
  }, [quizId, sessionId, supabase, router]);

  const title = "Assessment Report";
  const description = userData
    ? `You have scored ${userData.score}% on your recent quiz.`
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
          {/* Cancel / Close Button */}
          <div className="w-full flex justify-start">
            <Button
              variant="ghost"
              onClick={() => router.push(`/quiz/${quizId}`)}
              className="flex items-center"
            >
              <X className="w-6 h-6 mr-1" />
            </Button>
          </div>

          {/* Title & Description */}
          <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
          <h3 className="text-muted-foreground text-lg md:text-xl">{description}</h3>

          {/* User Info */}
          {userData && (
            <div className="flex items-center gap-3 text-sm md:text-base">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>
                <span className="font-semibold">{userData.name}</span>
                <span className="ml-1">on {formattedDate}</span>
              </span>
            </div>
          )}
        </div>

        {/* Answer Breakdown */}
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-center">Answer Breakdown</h2>
          {answers.length === 0 && (
            <p className="text-center text-muted-foreground">No answers recorded for this session.</p>
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
              <p className="font-medium mb-2">Q{index + 1}: {item.question}</p>
              <p>
                Your answer: {" "}
                <span className="font-semibold">
                  {item.selectedAnswer ?? "Not answered"}
                </span>
              </p>
              <p>
                Correct answer: {" "}
                <span className="font-semibold">{item.correctAnswer}</span>
              </p>
              {item.explanation && (
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Explanation:</span> {item.explanation}
                </p>
              )}
              <p className={`mt-2 font-semibold ${item.isCorrect ? "text-green-600" : "text-red-600"}`}>
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

export default QuizResultsPage;
