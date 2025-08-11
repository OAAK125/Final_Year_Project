"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Timer, Flag, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function QuizQuestionPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);

  const question = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const correctLetter = question?.correct_answer?.[0];

  // 1. Initialization
  useEffect(() => {
    const initialize = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return router.push("/authentication/login");

      setUser(data.user);

      const sessionParam = new URLSearchParams(window.location.search).get(
        "session_id"
      );
      if (!sessionParam) return router.push("/dashboard");

      setSessionId(sessionParam);
    };

    initialize();
  }, [router, supabase]);

  // 2. Fetch Quiz & Questions
  useEffect(() => {
    const fetchQuiz = async () => {
      const { data: cert } = await supabase
        .from("certifications")
        .select("duration_minutes, max_questions")
        .eq("id", quizId)
        .single();

      if (!cert) return;

      setTimeLeft(cert.duration_minutes * 60);

      const { data: allQuestions } = await supabase
        .from("questions")
        .select("*")
        .eq("certification_id", quizId);

      if (!allQuestions?.length) return;

      // --------- ONLY CHANGE: pick a random set of questions ----------
      const randomSample = (arr, n) => {
        const result = [];
        const used = new Set();
        const len = arr.length;
        const take = Math.min(n, len);

        // unique picks first
        while (result.length < take) {
          const idx = Math.floor(Math.random() * len);
          if (!used.has(idx)) {
            used.add(idx);
            result.push(arr[idx]);
          }
        }

        // if not enough questions in the bank, fill remainder with random repeats
        while (result.length < n) {
          result.push(arr[Math.floor(Math.random() * len)]);
        }

        return result;
      };

      const selectedQuestions = randomSample(allQuestions, cert.max_questions);
      // ---------------------------------------------------------------

      setQuestions(selectedQuestions);
      setProgress(100 / selectedQuestions.length);
      setLoading(false);
    };

    if (quizId && sessionId) fetchQuiz();
  }, [quizId, sessionId, supabase]);

  // 3. Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Fetch Flag Status
  useEffect(() => {
    const checkFlagged = async () => {
      if (!user || !question) return;
      const { data } = await supabase
        .from("flagged_questions")
        .select("id")
        .eq("user_id", user.id)
        .eq("question_id", question.id)
        .single();

      setIsFlagged(!!data);
    };

    checkFlagged();
  }, [user, question, supabase]);

  // 5. Toggle Flag Handler
  const toggleFlag = async () => {
    if (!user || !question || !sessionId) return;

    if (isFlagged) {
      // Remove
      await supabase
        .from("flagged_questions")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", question.id);
      setIsFlagged(false);
    } else {
      // Add
      await supabase.from("flagged_questions").insert({
        user_id: user.id,
        question_id: question.id,
        quiz_session_id: sessionId,
      });
      setIsFlagged(true);
    }
  };

  // Explicit handler for "I don't know"
  const handleDontKnow = async () => {
    if (user && question) {
      await supabase.from("answers").upsert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: null, // <- store NULL when user doesn't know
        is_correct: false, // or set to null if your schema allows
        quiz_session_id: sessionId,
      });
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelected(null);
      setProgress(((currentQuestionIndex + 2) / totalQuestions) * 100);
    } else {
      await finalizeSession();
    }
  };

  const handleNext = async () => {
    if (user && question && selected !== null) {
      const selectedLetter = question.options[selected][0];
      const isCorrect = selectedLetter === correctLetter;

      await supabase.from("answers").upsert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: selectedLetter,
        is_correct: isCorrect,
        quiz_session_id: sessionId,
      });
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelected(null);
      setProgress(((currentQuestionIndex + 2) / totalQuestions) * 100);
    } else {
      await finalizeSession();
    }
  };

  const handleSubmit = async () => {
    if (selected === null) {
      // treat as "I don't know"
      await handleDontKnow();
      return;
    }

    if (user && question) {
      const selectedLetter = question.options[selected][0];
      const isCorrect = selectedLetter === correctLetter;

      await supabase.from("answers").upsert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: selectedLetter,
        is_correct: isCorrect,
        quiz_session_id: sessionId,
      });
    }

    await finalizeSession();
  };

  const finalizeSession = async () => {
    await supabase
      .from("quiz_sessions")
      .update({ ended_at: new Date().toISOString(), completed: true })
      .eq("id", sessionId);

    router.push(`/quiz/${quizId}/results?session_id=${sessionId}`);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelected(null);
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading || !question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen p-6 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" onClick={() => setShowExitDialog(true)}>
              <X className="w-10 h-10" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                If you exit, your progress will not be saved. Are you sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Resume</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  router.push(
                    `/quiz/${quizId}?from=${from || "/dashboard/practice"}`
                  )
                }
              >
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Progress value={progress} className="flex-1 mx-4 h-2 bg-gray-200" />
        <div className="flex items-center gap-2 text-sm font-medium text-black">
          <span>
            {currentQuestionIndex + 1}/{totalQuestions}
          </span>
          <Button
            variant="ghost"
            onClick={toggleFlag}
            className={`p-1 mx-1 ${isFlagged ? "text-primary" : "text-black"}`}
          >
            <Flag className={`w-4 h-4 ${isFlagged ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">{question.question_text}</h2>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {question.options.map((option, index) => (
          <Card
            key={index}
            onClick={() => setSelected(index)}
            className={`cursor-pointer px-4 py-3 border rounded-xl text-left text-base ${
              selected === index
                ? "border-primary text-primary shadow"
                : "hover:bg-gray-100"
            }`}
          >
            {option}
          </Card>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center text-gray-700 text-sm">
          <Timer className="w-5 h-5 mr-2" />
          <span>{formatTime(timeLeft)}</span>
        </div>

        <div className="flex gap-2">
          {currentQuestionIndex > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="rounded-xl"
            >
              Previous
            </Button>
          )}
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              variant={selected === null ? "outline" : "default"}
              onClick={selected === null ? handleDontKnow : handleSubmit}
              className="rounded-xl"
            >
              {selected === null ? "I don't know" : "Submit"}
            </Button>
          ) : (
            <Button
              variant={selected === null ? "outline" : "default"}
              onClick={selected === null ? handleDontKnow : handleNext}
              className="rounded-xl"
            >
              {selected === null ? "I don't know" : "Next question"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
