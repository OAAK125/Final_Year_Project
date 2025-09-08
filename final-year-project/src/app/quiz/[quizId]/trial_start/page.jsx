"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Timer, Loader2 } from "lucide-react";

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

export default function TrialQuestionPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const sessionId = searchParams.get("session_id");
  const from = searchParams.get("from");

  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const question = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const correctLetter = question?.correct_answer?.[0];

  useEffect(() => {
    const initialize = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return router.push("/authentication/login");
      setUser(data.user);

      if (!sessionId) return router.push("/dashboard");
    };

    initialize();
  }, [router, supabase, sessionId]);

  // 2. Fetch Quiz & Questions (trial_questions)
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
        .from("trial_questions")
        .select("*")
        .eq("certification_id", quizId);

      if (!allQuestions?.length) return;

      // random sampling
      const randomSample = (arr, n) => {
        const result = [];
        const used = new Set();
        const len = arr.length;
        const take = Math.min(n, len);
        while (result.length < take) {
          const idx = Math.floor(Math.random() * len);
          if (!used.has(idx)) {
            used.add(idx);
            result.push(arr[idx]);
          }
        }
        while (result.length < n) {
          result.push(arr[Math.floor(Math.random() * len)]);
        }
        return result;
      };

      const selectedQuestions = randomSample(allQuestions, cert.max_questions);
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

  // Handlers
  const handleDontKnow = async () => {
    if (user && question) {
      await supabase.from("trial_answers").upsert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: null, // no answer
        is_correct: false,
        trial_quiz_session_id: sessionId,
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

      await supabase.from("trial_answers").upsert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: selectedLetter,
        is_correct: isCorrect,
        trial_quiz_session_id: sessionId,
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
      await handleDontKnow();
      return;
    }

    if (user && question) {
      const selectedLetter = question.options[selected][0];
      const isCorrect = selectedLetter === correctLetter;

      await supabase.from("trial_answers").upsert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: selectedLetter,
        is_correct: isCorrect,
        trial_quiz_session_id: sessionId,
      });
    }

    await finalizeSession();
  };

  const finalizeSession = async () => {
    await supabase
      .from("trial_quiz_sessions")
      .update({
        ended_at: new Date().toISOString(),
        completed: true,
      })
      .eq("id", sessionId);

    router.push(`/quiz/${quizId}/trial_result?session_id=${sessionId}`);
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
        <p className="text-sm text-gray-600">Loading trial quiz...</p>
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
                  router.push(`/quiz/${quizId}?from=${from || "/dashboard"}`)
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
