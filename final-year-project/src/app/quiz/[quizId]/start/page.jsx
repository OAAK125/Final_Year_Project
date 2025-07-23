"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Flag, Timer, Loader2 } from "lucide-react"

export default function QuizQuestionPage() {
  const router = useRouter()
  const { quizId } = useParams() // quizId is certification_id

  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0) // in seconds
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data: cert, error: certError } = await supabase
        .from("certifications")
        .select("duration_minutes, max_questions")
        .eq("id", quizId)
        .single()

      if (certError || !cert) {
        console.error("Certification not found.")
        return
      }

      setDuration(cert.duration_minutes * 60)
      setTimeLeft(cert.duration_minutes * 60)

      const { data: allQuestions, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("certification_id", quizId)

      if (qError || !allQuestions || allQuestions.length === 0) {
        console.error("No questions found.")
        return
      }

      let selectedQuestions = [...allQuestions]

      while (selectedQuestions.length < cert.max_questions) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length)
        selectedQuestions.push(allQuestions[randomIndex])
      }

      selectedQuestions = selectedQuestions.slice(0, cert.max_questions)

      setQuestions(selectedQuestions)
      setProgress(100 / selectedQuestions.length)
    }

    fetchQuiz()
  }, [quizId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  if (questions.length === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      );
    }

  const question = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelected(null)
      setProgress(((currentQuestionIndex + 2) / totalQuestions) * 100)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setSelected(null)
      setProgress(((currentQuestionIndex) / totalQuestions) * 100)
    }
  }

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0")
    const s = String(seconds % 60).padStart(2, "0")
    return `${m}:${s}`
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen p-6 flex flex-col justify-between">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          className="p-1 text-black"
          variant="ghost"
          size=""
          onClick={() => router.push(`/quiz/${quizId}`)}
        >
          <X className="w-10 h-10" />
        </Button>
        <Progress value={progress} className="flex-1 mx-4 h-2 bg-gray-200" />
        <div className="flex items-center gap-2 text-sm font-medium text-black">
          <span>{currentQuestionIndex + 1}/{totalQuestions}</span>
          <Button variant="ghost" className="p-1 mx-1">
            <Flag className="w-4 h-4 text-black" />
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
            className={`cursor-pointer px-4 py-3 border rounded-xl text-left text-base hover:bg-gray-100 ${
              selected === index ? "border-primary text-primary shadow" : ""
            }`}
          >
            {option}
          </Card>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-center border-t pt-4">
        {/* Timer */}
        <div className="flex items-center text-gray-700 text-sm">
          <Timer className="w-5 h-5 mr-2" />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          {currentQuestionIndex > 0 && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={handlePrev}
            >
              Previous question
            </Button>
          )}
          <Button
            className="rounded-xl"
            variant={selected !== null ? "default" : "outline"}
            onClick={handleNext}
          >
            {selected !== null ? "Next question" : "I don’t know"}
          </Button>
        </div>
      </div>
    </div>
  )
}
