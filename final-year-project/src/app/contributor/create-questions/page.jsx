"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, BookOpen, Hash, Type } from "lucide-react";
import { toast } from "sonner";

export default function CreateQuestions() {
  const supabase = createClient();
  const [certifications, setCertifications] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: [],
    explanation: "",
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchCertifications();
    fetchUser();
  }, []);

  const fetchCertifications = async () => {
    const { data, error } = await supabase
      .from("certifications")
      .select("id, name, code, duration_minutes, topics(name), certification_type(name)")
      .order("name");

    if (error) {
      console.error("Error fetching certifications:", error);
      toast.error("Failed to load certifications");
    } else {
      setCertifications(data || []);
    }
  };

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (newQuestion.options.some((opt) => !opt.trim())) {
      toast.error("All options must be filled");
      return;
    }
    if (newQuestion.correctAnswer.length === 0) {
      toast.error("Please select a correct answer");
      return;
    }

    const questionId = crypto.randomUUID();
    setQuestions([...questions, { ...newQuestion, id: questionId }]);

    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: [],
      explanation: "",
    });

    toast.success("Question added successfully");
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleCorrectAnswerChange = (index) => {
    setNewQuestion({
      ...newQuestion,
      correctAnswer: [String.fromCharCode(65 + index)],
    });
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.info("Question removed");
  };

  const saveQuestions = async () => {
    if (!selectedCertification) {
      toast.error("Please select a certification");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    try {
      const formatted = questions.map((q) => ({
        certification_id: selectedCertification,
        user_id: userId,
        type: "created", // required for this page
        question_text: q.question,
        options: q.options,          // stored as JSONB
        correct_answer: q.correctAnswer, // stored as JSONB
        explanation: q.explanation || "",
        approved: false,
      }));

      const { error } = await supabase
        .from("contributor_submissions")
        .insert(formatted);

      if (error) {
        console.error("Error saving:", error);
        toast.error("Failed to submit questions");
        return;
      }

      setQuestions([]);
      setSelectedCertification("");
      toast.success("Questions submitted for review!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
    }
  };

  const selectedCert = certifications.find((c) => c.id === selectedCertification);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Questions</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Certification Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Certification</CardTitle>
            <CardDescription>Select certification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedCertification}
              onValueChange={setSelectedCertification}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select certification" />
              </SelectTrigger>
              <SelectContent>
                {certifications.map((cert) => (
                  <SelectItem key={cert.id} value={cert.id}>
                    {cert.name} ({cert.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCert && (
              <div className="p-3 bg-muted rounded-md space-y-3">
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Topic: {selectedCert.topics?.name || "N/A"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Hash className="h-4 w-4 mr-2" />
                  <span>Duration: {selectedCert.duration_minutes} min</span>
                </div>
                <div className="flex items-center text-sm">
                  <Type className="h-4 w-4 mr-2" />
                  <span>{selectedCert.certification_type?.name || "N/A"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Questions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manual Questions</CardTitle>
            <CardDescription>
              Add one or more questions to submit for review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Question</Label>
              <Textarea
                placeholder="Enter question"
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, question: e.target.value })
                }
              />

              <Label>Options</Label>
              {newQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isCorrect = newQuestion.correctAnswer.includes(optionLetter);
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Option ${optionLetter}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant={isCorrect ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCorrectAnswerChange(index)}
                    >
                      {isCorrect ? "Correct ✓" : "Mark Correct"}
                    </Button>
                  </div>
                );
              })}

              <Label>Explanation (optional)</Label>
              <Textarea
                placeholder="Explain the answer"
                value={newQuestion.explanation}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, explanation: e.target.value })
                }
              />

              <Button onClick={handleAddQuestion} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Added Questions</h3>
                {questions.map((q, index) => (
                  <div key={q.id} className="p-3 border rounded-md relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeQuestion(q.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <p className="font-medium">
                      {index + 1}. {q.question}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {q.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isCorrect = q.correctAnswer.includes(letter);
                        return (
                          <li
                            key={i}
                            className={isCorrect ? "text-green-600 font-medium" : ""}
                          >
                            {letter}. {opt} {isCorrect && "✓"}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={saveQuestions}
              disabled={questions.length === 0 || !selectedCertification}
              className="w-full"
              size="lg"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
