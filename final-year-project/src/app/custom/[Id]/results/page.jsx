"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import dayjs from "dayjs";

export default function CustomResultsPage() {
  const { Id } = useParams();
  const supabase = createClient();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        router.push("/authentication/login");
        return;
      }

      const userId = user.id;

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

      const { data: quizData } = await supabase
        .from("custom_quizzes")
        .select("num_questions, created_at")
        .eq("id", Id)
        .single();

      const { data: allAnswers } = await supabase
        .from("custom_answers")
        .select("question_id, selected_answer, is_correct")
        .eq("custom_quiz_id", Id)
        .eq("user_id", userId);

      const { data: questions } = await supabase
        .from("questions")
        .select("id, question_text, correct_answer, explanation");

      const safeAnswers = allAnswers || [];
      const safeQuestions = questions || [];

      const merged = safeAnswers.map((a) => {
        const q = safeQuestions.find((q) => q.id === a.question_id);
        return {
          question: q?.question_text,
          correctAnswer: q?.correct_answer,
          explanation: q?.explanation,
          selectedAnswer: a.selected_answer,
          isCorrect: a.is_correct,
        };
      });

      const correctCount = merged.filter((a) => a.isCorrect).length;
      const totalQuestions = quizData?.num_questions || merged.length || 0;
      const calculatedScore =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 100)
          : 0;

      setScore(calculatedScore);
      setAnswers(merged);
      setEndedAt(quizData?.created_at || new Date().toISOString());
      setUserData({
        name: displayName,
        avatar: displayAvatar,
      });

      setLoading(false);
    };

    fetchResults();
  }, [Id, supabase, router]);

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
              onClick={() => router.push("/dashboard/personalized")}
              className="flex items-center"
            >
              <X className="w-6 h-6 mr-1" />
            </Button>
          </div>

          <h1 className="text-4xl font-semibold md:text-5xl">
            Assessment Report
          </h1>
          <h3 className="text-muted-foreground text-lg md:text-xl">
            You scored {score}% on your custom quiz.
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
                <span className="ml-1">
                  on {dayjs(endedAt).format("MMMM D, YYYY")}
                </span>
              </span>
            </div>
          )}
        </div>

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
}
