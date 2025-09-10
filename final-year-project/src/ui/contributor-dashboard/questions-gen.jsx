"use client"
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
import {
    PlusCircle,
    Trash2,
    Sparkles,
    BookOpen,
    Clock,
    Hash,
    Type,
} from "lucide-react";
import { toast } from "sonner";


export function GenerateQuestions({ showAI = false }) {
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
    const [quizShortDescription, setQuizShortDescription] = useState("");
    const [quizLongDescription, setQuizLongDescription] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");

    useEffect(() => {
        fetchCertifications();
    }, []);

    const fetchCertifications = async () => {
        try {
            const { data, error } = await supabase
                .from("certifications")
                .select(`id,name,max_questions,code,duration_minutes, topics (name),certification_type(name)`)
                .order("name");

            if (error) {
                console.error("Error fetching certifications:", error);
                toast.error("Failed to load certifications");
                return;
            }
            setCertifications(data || []);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to load certifications");
        }
    };

    const handleAddQuestion = () => {
        if (!newQuestion.question.trim()) {
            toast.error("Question text is required");
            return;
        }

        if (newQuestion.options.some(opt => !opt.trim())) {
            toast.error("All options must be filled");
            return;
        }

        if (newQuestion.correctAnswer.length === 0) {
            toast.error("Please select a correct answer");
            return;
        }

        const questionId = Date.now().toString();
        setQuestions([...questions, { ...newQuestion, id: questionId }]);

        // Reset form
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
        // For single correct answer, replace the array with the new selection
        setNewQuestion({
            ...newQuestion,
            correctAnswer: [String.fromCharCode(65 + index)]
        });
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
        toast.info("Question removed");
    };

    const generateQuizWithAI = async () => {
        if (!selectedCertification) {
            toast.error("Please select a certification first");
            return;
        }

        setIsGenerating(true);

        try {
            const certification = certifications.find(c => c.id === selectedCertification);
            const descriptions = { short_description: quizShortDescription, long_description: quizLongDescription }

            const payload = { certification, descriptions, aiPrompt }
            console.log(payload)
            const res = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.error) {
                toast.error(data.error);
                return;
            }

            const generatedQuestions = data.questions;
            console.log("Generated questions:", generatedQuestions);

            // Ensure all questions have the correct format
            const formattedQuestions = generatedQuestions.map(q => ({
                ...q,
                // Ensure correct_answer is always an array
                correctAnswer: Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer],
                // Ensure options is always an array
                options: Array.isArray(q.options) ? q.options : []
            }));

            setQuestions(formattedQuestions);
            toast.success(`Generated ${formattedQuestions.length} questions with AI`);
            setAiPrompt("");
        } catch (error) {
            console.error("Error generating questions with AI:", error);
            toast.error("Failed to generate questions with AI");
        } finally {
            setIsGenerating(false);
        }
    };

    const saveQuiz = async () => {
        if (!quizShortDescription.trim()) {
            toast.error("Quiz short description is required");
            return;
        }

        if (!quizLongDescription.trim()) {
            toast.error("Quiz long description is required");
            return;
        }

        if (questions.length === 0) {
            toast.error("Please add at least one question");
            return;
        }

        if (!selectedCertification) {
            toast.error("Please select a certification");
            return;
        }

        try {
            const formattedQuestions = questions.map(q => ({
                question_text: q.question,
                certification_id: selectedCertification,
                options: q.options,
                correct_answer: q.correctAnswer,
                explanation: q.explanation || "",
                is_active: showAI,
                sub_topic: "N/A"
            }));

            const { data: quizData, error: quizError } = await supabase
                .from("quizzes")
                .insert({
                    short_description: quizShortDescription,
                    long_description: quizLongDescription,
                    certification_id: selectedCertification,
                    is_active: showAI,

                })
                .select();

            const { data: questionsData, error: questionsError } = await supabase
                .from("questions")
                .insert(formattedQuestions)

                .select();

            if (quizError || questionsError) {
                console.error("Error saving quiz:", quizError);
                toast.error("Failed to save quiz");
                return;
            }

            // Reset form
            setQuestions([]);
            setQuizShortDescription("");
            setQuizLongDescription("");
            setSelectedCertification("");
            setAiPrompt("");

            toast.success("Quiz saved successfully!");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to save quiz");
        }
    };

    const selectedCert = certifications.find(c => c.id === selectedCertification);

    return (
        <div className="container mx-auto p-6 space-y-6" id="quiz-gen">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">New Quiz</h1>
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                    <span className="text-sm text-muted-foreground">
                        Create custom quizzes {showAI ? "manually or with AI" : ""}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Quiz Details */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Quiz Details</CardTitle>
                        <CardDescription>
                            Set up your quiz basic information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="quiz-short-description">Title/Short Description</Label>
                            <Textarea
                                id="quiz-short-description"
                                placeholder="Briefly describe the quiz purpose and content"
                                value={quizShortDescription}
                                onChange={(e) => setQuizShortDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quiz-description">Long Description</Label>
                            <Textarea
                                id="quiz-description"
                                placeholder="Describe the quiz purpose and content"
                                value={quizLongDescription}
                                onChange={(e) => setQuizLongDescription(e.target.value)}
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certification">Certification</Label>
                            <Select
                                value={selectedCertification}
                                onValueChange={setSelectedCertification}
                            >
                                <SelectTrigger className="w-full max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                    <SelectValue placeholder="Select a certification" />
                                </SelectTrigger>
                                <SelectContent>
                                    {certifications.map((cert) => (
                                        <SelectItem key={cert.id} value={cert.id}>
                                            {cert.name} ({cert.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        {selectedCert && (
                            <div className="p-3 bg-muted rounded-md space-y-3">
                                <div className="space-y-2 pt-2 border-t">
                                    <div className="flex items-center text-sm">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        <span>Topic: {selectedCert.topics?.name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Hash className="h-4 w-4 mr-2" />
                                        <span>Max Questions: {selectedCert.max_questions}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>Duration: {selectedCert.duration_minutes} minutes</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Type className="h-4 w-4 mr-2" />
                                        <span>Type: {selectedCert.certification_type?.name || selectedCert.certification_type || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                </Card>

                {/* Right Panel - Questions */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Quiz Questions</CardTitle>
                        <CardDescription>
                            {questions.length > 0
                                ? `${questions.length} question${questions.length !== 1 ? 's' : ''} added`
                                : 'Add questions manually or generate with AI'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* AI Generator Section */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md border">
                            <h3 className="font-medium flex items-center mb-2">
                                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                                Questions Generator
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Generate relevant questions based on the selected certification
                            </p>

                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Optional: Add specific instructions for question generation"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    rows={2}
                                />
                                <Button
                                    onClick={generateQuizWithAI}
                                    disabled={!selectedCertification || isGenerating}
                                    className="w-full"
                                >
                                    {isGenerating ? (
                                        <>Generating Questions...</>
                                    ) : (
                                        <>Generate Questions</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Manual Question Input */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Add Question Manually</h3>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Question</Label>
                                    <Textarea
                                        placeholder="Enter your question"
                                        value={newQuestion.question}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
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
                                </div>

                                <div className="space-y-2">
                                    <Label>Explanation (Optional)</Label>
                                    <Textarea
                                        placeholder="Explain why the correct answer is right"
                                        value={newQuestion.explanation}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                <Button onClick={handleAddQuestion} className="w-full">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Question
                                </Button>
                            </div>
                        </div>

                        {/* Questions List */}
                        {questions.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-medium">Added Questions</h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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

                                            <p className="font-medium pr-8">
                                                {index + 1}. {q.question_text || q.question}
                                            </p>

                                            <div className="mt-2 space-y-1">
                                                {q.options.map((option, optIndex) => {
                                                    // Check if option already starts with a letter prefix
                                                    const hasPrefix = /^[A-D]\.\s/.test(option);
                                                    const optionLetter = String.fromCharCode(65 + optIndex);
                                                    const displayOption = hasPrefix ? option : `${optionLetter}. ${option}`;

                                                    // Check if this option is the correct answer
                                                    const isCorrect = q.correctAnswer &&
                                                        Array.isArray(q.correctAnswer) &&
                                                        q.correctAnswer.includes(optionLetter);

                                                    return (
                                                        <div
                                                            key={optIndex}
                                                            className={`text-sm pl-4 ${isCorrect
                                                                ? "text-green-600 dark:text-green-400 font-medium"
                                                                : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {displayOption}
                                                            {isCorrect && " ✓"}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {q.explanation && (
                                                <div className="mt-2 p-2 bg-muted text-sm rounded-md">
                                                    <span className="font-medium">Explanation: </span>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save Quiz Button */}
                        <Button
                            onClick={saveQuiz}
                            disabled={questions.length === 0 || !quizShortDescription || !quizLongDescription || !selectedCertification}
                            className="w-full"
                            size="lg"
                        >
                            Save Quiz
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}