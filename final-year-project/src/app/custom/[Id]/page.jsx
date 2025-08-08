"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function CustomQuizPage() {
  const router = useRouter();
  const { Id } = useParams();
  const customId = Id;
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numQuestions, setNumQuestions] = useState(0);

  const question = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const correctLetter = question?.correct_answer?.[0];

  useEffect(() => {
    const initialize = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return router.push("/authentication/login");
      setUser(data.user);
    };
    initialize();
  }, [router, supabase]);

  useEffect(() => {
    const fetchCustomQuiz = async () => {
      const { data: quizData, error: quizError } = await supabase
        .from("custom_quizzes")
        .select("*")
        .eq("id", customId)
        .single();

      if (!quizData || quizError) {
        setError("Custom quiz not found.");
        setLoading(false);
        return;
      }

      const { certification_id, num_questions, include_flagged } = quizData;
      setNumQuestions(num_questions);

      let { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("certification_id", certification_id);

      if (!questionsData?.length) {
        setError("No questions found for this certification.");
        setLoading(false);
        return;
      }

      if (!include_flagged) {
        const { data: flagged } = await supabase
          .from("flagged_questions")
          .select("question_id")
          .eq("user_id", user.id);

        const flaggedIds = new Set(flagged?.map((f) => f.question_id));
        questionsData = questionsData.filter((q) => !flaggedIds.has(q.id));
      }

      const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
      const finalQuestions = shuffled.slice(0, num_questions);

      setQuestions(finalQuestions);
      setProgress(100 / finalQuestions.length);
      setLoading(false);
    };

    if (user && customId) fetchCustomQuiz();
  }, [user, customId, supabase]);

  const handleSubmit = async () => {
    if (!user || !question) return;
    const selectedLetter =
      selected !== null ? question.options[selected][0] : null;
    const isCorrect = selectedLetter === correctLetter;

    await supabase.from("custom_answers").insert({
      user_id: user.id,
      question_id: question.id,
      selected_answer: selectedLetter,
      is_correct: selectedLetter ? isCorrect : false,
      custom_quiz_id: customId,
    });

    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelected(null);
      setSubmitted(false);
      setShowExplanation(false);
      setProgress(((currentQuestionIndex + 2) / totalQuestions) * 100);
    } else {
      router.push(`/custom/${customId}/results`);
    }
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
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/personalized")}
        >
          <X className="w-6 h-6" />
        </Button>

        <Progress value={progress} className="flex-1 mx-4 h-2 bg-gray-200" />
        <div className="text-sm font-medium text-black">
          {currentQuestionIndex + 1}/{numQuestions}
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">{question.question_text}</h2>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = opt[0] === correctLetter;
          const isWrong = submitted && isSelected && !isCorrect;
          const isRight = submitted && isSelected && isCorrect;
          const showCorrect = submitted && !isSelected && isCorrect;

          return (
            <Card
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              className={`cursor-pointer px-4 py-3 border rounded-xl text-left text-base
                ${
                  isSelected && !submitted
                    ? "border-primary text-primary shadow"
                    : "hover:bg-gray-100"
                }
                ${isRight ? "bg-green-500 text-white" : ""}
                ${isWrong ? "bg-red-500 text-white" : ""}
                ${showCorrect ? "bg-green-500 text-white" : ""}
              `}
            >
              {opt}
            </Card>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-center items-center gap-4 border-t pt-4 flex-wrap">
        {submitted && (
          <AlertDialog open={showExplanation} onOpenChange={setShowExplanation}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost">Explanation</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Explanation</AlertDialogTitle>
                <AlertDialogDescription>
                  {question.explanation || "No explanation provided."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!submitted ? (
          <Button
            variant={selected === null ? "outline" : "default"}
            onClick={handleSubmit}
            className="rounded-xl"
          >
            {selected === null ? "I don't know" : "Submit"}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleNext} className="rounded-xl">
            {currentQuestionIndex === totalQuestions - 1
              ? "End Quiz"
              : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}
