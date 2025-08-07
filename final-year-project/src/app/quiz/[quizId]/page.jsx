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
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // Get `from` param from URL

  useEffect(() => {
    async function fetchQuiz() {
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
      } else {
        setQuiz(data);
      }
    }

    if (quizId) fetchQuiz();
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

    // Go to the quiz start page
    router.push(`/quiz/${quizId}/start?session_id=${sessionData.id}&from=${from || "/dashboard/practice"}`);

  };

  const handleClose = () => {
  router.push(from || "/dashboard/practice"); // fallback to practice if no from
};


  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-xl w-full text-center relative space-y-3">
        {/* Top Right Instructions Button */}
        {instructions.length > 0 && (
          <div className="flex justify-end gap-2 absolute top-6 right-6">
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
          <div className="flex justify-center mt-20">
            <img
              src={quiz.image}
              alt="Certification logo"
              className="w-30 h-30"
            />
          </div>
        )}

        {/* Heading */}
        <h1 className="text-2xl font-semibold">{certification.name}</h1>
        <p className="text-muted-foreground text-lg">
          Code: {certification.code}
        </p>

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
            <FileText className="w-4 h-4" /> {certification.max_questions}{" "}
            questions
          </div>
        </div>

        {/* Start Quiz Button */}
        <Button
          size="lg"
          className="w-1/2 text-base font-semibold mt-2"
          onClick={handleStartQuiz}
        >
          Start Quiz
        </Button>
      </div>
    </section>
  );
}
