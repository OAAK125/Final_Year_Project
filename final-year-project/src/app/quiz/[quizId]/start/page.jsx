"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Flag, Timer, Loader2 } from "lucide-react";

export default function QuizQuestionPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFlagged, setIsFlagged] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/authentication/login");
        return;
      }

      setUser(data.user);

      const urlParams = new URLSearchParams(window.location.search);
      const sessionParam = urlParams.get("session_id");
      if (!sessionParam) {
        router.push("/dashboard");
        return;
      }

      setSessionId(sessionParam);
    };

    initialize();
  }, [router, supabase]);

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data: cert } = await supabase
        .from("certifications")
        .select("duration_minutes, max_questions")
        .eq("id", quizId)
        .single();

      if (!cert) return;

      setDuration(cert.duration_minutes * 60);
      setTimeLeft(cert.duration_minutes * 60);

      const { data: allQuestions } = await supabase
        .from("questions")
        .select("*")
        .eq("certification_id", quizId);

      if (!allQuestions || allQuestions.length === 0) return;

      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, cert.max_questions);

      setQuestions(selectedQuestions);
      setProgress(100 / selectedQuestions.length);
      setLoading(false);
    };

    if (quizId && sessionId) fetchQuiz();
  }, [quizId, sessionId, supabase]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFlagStatus = async () => {
      if (!user || !sessionId || !questions[currentQuestionIndex]) return;

      const { data, error } = await supabase
        .from("answers")
        .select("flagged")
        .eq("user_id", user.id)
        .eq("quiz_session_id", sessionId)
        .eq("question_id", questions[currentQuestionIndex].id)
        .single();

      setIsFlagged(data?.flagged || false);
    };

    fetchFlagStatus();
  }, [user, sessionId, currentQuestionIndex, questions]);

  const question = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const correctLetter = question?.correct_answer?.[0];

  const handleNext = async () => {
    if (user && question && selected !== null) {
      const selectedLetter = question.options[selected][0];
      const isCorrect = selectedLetter === correctLetter;

      await supabase.from("answers").insert({
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
      await supabase
        .from("quiz_sessions")
        .update({
          ended_at: new Date().toISOString(),
          completed: true,
        })
        .eq("id", sessionId);
      router.push("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelected(null);
    }
  };

  const toggleFlag = async () => {
    if (!user || !question) return;

    const { data: existing } = await supabase
      .from("answers")
      .select("id")
      .eq("user_id", user.id)
      .eq("quiz_session_id", sessionId)
      .eq("question_id", question.id)
      .single();

    if (existing) {
      await supabase
        .from("answers")
        .update({ flagged: !isFlagged })
        .eq("id", existing.id);
    } else {
      await supabase.from("answers").insert({
        user_id: user.id,
        question_id: question.id,
        quiz_session_id: sessionId,
        flagged: true,
      });
    }

    setIsFlagged((prev) => !prev);
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
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push(`/quiz/${quizId}`)}>
          <X className="w-10 h-10" />
        </Button>
        <Progress value={progress} className="flex-1 mx-4 h-2 bg-gray-200" />
        <div className="flex items-center gap-2 text-sm font-medium text-black">
          <span>
            {currentQuestionIndex + 1}/{totalQuestions}
          </span>
          <Button
            variant="ghost"
            className={`p-1 mx-1 ${isFlagged ? "text-primary" : "text-black"}`}
            onClick={toggleFlag}
          >
            <Flag className={`w-4 h-4 ${isFlagged ? "fill-primary" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">{question.question_text}</h2>
      </div>

      <div className="space-y-4 mb-6">
        {question.options.map((option, index) => (
          <Card
            key={index}
            onClick={() => setSelected(index)}
            className={`cursor-pointer px-4 py-3 border rounded-xl text-left text-base
              ${selected === index ? "border-primary text-primary shadow" : "hover:bg-gray-100"}`}
          >
            {option}
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center text-gray-700 text-sm">
          <Timer className="w-5 h-5 mr-2" />
          <span>{formatTime(timeLeft)}</span>
        </div>

        <div className="flex gap-2">
          {currentQuestionIndex > 0 && (
            <Button variant="outline" onClick={handlePrevious} className="rounded-xl">
              Previous
            </Button>
          )}
          <Button
            variant={selected === null ? "outline" : "default"}
            onClick={handleNext}
            className="rounded-xl"
          >
            {selected === null ? "I don't know" : "Next question"}
          </Button>
        </div>
      </div>
    </div>
  );
}
