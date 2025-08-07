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

      // Step 1: Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/authentication/login");
        return;
      }

      const userId = user.id;

      // Step 2: Get profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, profile_picture")
        .eq("id", userId)
        .single();

      // Step 3: Get quiz session
      const { data: sessionData } = await supabase
        .from("quiz_sessions")
        .select("ended_at")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      // Step 4: Get user answers
      const { data: userAnswers } = await supabase
        .from("answers")
        .select("question_id, selected_answer, is_correct")
        .eq("quiz_session_id", sessionId)
        .eq("user_id", userId);

      // Step 5: Get all questions
      const { data: allQuestions } = await supabase
        .from("questions")
        .select("id, question_text, correct_answer, explanation")
        .eq("certification_id", quizId);

      // Step 6: Merge
      const merged = allQuestions.map((q) => {
        const userAnswer = userAnswers.find((a) => a.question_id === q.id);
        return {
          question: q.question_text,
          correctAnswer: q.correct_answer,
          selectedAnswer: userAnswer?.selected_answer || null,
          isCorrect: userAnswer?.is_correct ?? false,
          explanation: q.explanation,
        };
      });

      const correctCount = merged.filter((a) => a.isCorrect).length;
      const score =
        merged.length > 0
          ? Math.round((correctCount / merged.length) * 100)
          : 0;

      // ✅ Step 7: Save score to quiz_sessions table
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
          <h3 className="text-muted-foreground text-lg md:text-xl">
            {description}
          </h3>

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
          <h2 className="text-xl font-semibold text-center">
            Answer Breakdown
          </h2>
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
                  {item.selectedAnswer || "Not answered"}
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
                {item.isCorrect ? "Correct ✅" : "Incorrect ❌"}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuizResultsPage;
