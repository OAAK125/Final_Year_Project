"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, FileText, X, Loader2 } from "lucide-react";

export default function QuizInfoPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const supabase = createClient();

  const [quiz, setQuiz] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  useEffect(() => {
    async function fetchQuizAndSubscription() {
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          `
          id,
          image,
          long_description,
          instructions,
          certification_id,
          certifications (
            name,
            code,
            max_questions,
            duration_minutes
          )
        `
        )
        .eq("certification_id", quizId)
        .single();

      if (error || !data) {
        setError("Quiz not found.");
        return;
      }
      setQuiz(data);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id, certification_id, plans(name)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setSubscription(sub);
    }

    if (quizId) fetchQuizAndSubscription();
  }, [quizId, supabase]);

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white text-red-600">
        {error}
      </section>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  const certification = quiz.certifications;
  const instructions = quiz.instructions?.split("\n").filter(Boolean) || [];
  const plan = subscription?.plans?.name;

  const handleStartQuiz = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to start the quiz.");
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: user.id,
        certification_id: quiz.certification_id,
      })
      .select("id")
      .single();

    if (sessionError || !sessionData) {
      setError("Failed to start quiz session. Please try again.");
      return;
    }

    router.push(
      `/quiz/${quizId}/start?session_id=${sessionData.id}&from=${
        from || "/dashboard/practice"
      }`
    );
  };

  const handleClose = () => {
    router.push(from || "/dashboard/practice");
  };

  const renderButtons = () => {
    if (!subscription || plan === "Free") {
      return (
        <div className="flex flex-col gap-3 w-full">
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base font-semibold"
            onClick={() => router.push(`/quiz/${quizId}/trial_start`)}
          >
            Start Trial Quiz
          </Button>
          {userId && (
            <Button
              size="lg"
              variant="default"
              className="w-full text-base font-semibold"
              onClick={() => router.push(`/pricing/${userId}`)}
            >
              Pay for Full Quiz
            </Button>
          )}
        </div>
      );
    }

    if (plan === "Standard") {
      if (subscription.certification_id === quiz.certification_id) {
        return (
          <Button
            size="lg"
            className="w-full text-base font-semibold"
            onClick={handleStartQuiz}
          >
            Start Quiz
          </Button>
        );
      } else {
        return (
          <div className="flex flex-col gap-3 w-full">
            <Button
              size="lg"
              variant="outline"
              className="w-full text-base font-semibold"
              onClick={() => router.push(`/quiz/${quizId}/trial_start`)}
            >
              Start Trial Quiz
            </Button>
            {userId && (
              <Button
                size="lg"
                variant="default"
                className="w-full text-base font-semibold"
                onClick={() => router.push(`/pricing/${userId}`)}
              >
                Pay for Full Quiz
              </Button>
            )}
          </div>
        );
      }
    }

    if (plan === "All-Access") {
      return (
        <Button
          size="lg"
          className="w-full text-base font-semibold"
          onClick={handleStartQuiz}
        >
          Start Quiz
        </Button>
      );
    }

    return null;
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-4 overflow-hidden">
      <div className="max-w-xl w-full flex flex-col items-center justify-center relative gap-4">
        {/* Top Right Instructions Button */}
        {instructions.length > 0 && (
          <div className="absolute top-6 right-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Instructions
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Instructions</AlertDialogTitle>
                  <AlertDialogDescription className="text-left space-y-1">
                    <ul className="list-disc list-inside">
                      {instructions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 left-6 text-black hover:text-primary"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Logo */}
        {quiz.image && (
          <div className="flex justify-center">
            <img src={quiz.image} alt="Certification logo" className="w-28 h-28" />
          </div>
        )}

        {/* Heading */}
        <h1 className="text-2xl font-semibold">{certification.name}</h1>
        <p className="text-muted-foreground text-lg">Code: {certification.code}</p>

        {/* Description */}
        <p className="text-muted-foreground text-base whitespace-pre-line">
          {quiz.long_description}
        </p>

        {/* Info row */}
        <div className="flex justify-center gap-6 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {certification.duration_minutes} mins
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" /> {certification.max_questions} questions
          </div>
        </div>

        {/* 🔑 Subscription-based buttons */}
        <div className="mt-4 w-full flex flex-col items-center">{renderButtons()}</div>
      </div>
    </section>
  );
}
