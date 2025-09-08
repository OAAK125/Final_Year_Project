"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, X, Plus, Trash2 } from "lucide-react";

export default function QuizQuestionsPage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [selectedCert, setSelectedCert] = useState("");
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: [],
    explanation: "",
    is_active: true,
    sub_topic: ""
  });

  const pageSize = 10;

  // Fetch certifications
  useEffect(() => {
    const fetchCertifications = async () => {
      const { data, error } = await supabase.from("certifications").select("id, name");
      if (error) {
        console.error("Error fetching certifications:", error);
        toast.error("Failed to load certifications");
      } else {
        setCertifications(data || []);
      }
    };
    fetchCertifications();
  }, []);

  // Fetch questions whenever certification changes
  useEffect(() => {
    if (!selectedCert) return;
    const fetchQuestions = async () => {
      let query = supabase.from("questions").select("*").eq("certification_id", selectedCert);

      if (search.trim()) {
        query = query.ilike("question_text", `%${search}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load questions");
      } else {
        setQuestions(data || []);
      }
      setPage(1);
    };
    fetchQuestions();
  }, [selectedCert, search]);

  const startEditing = (question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({
      question_text: question.question_text || "",
      options: Array.isArray(question.options) ? [...question.options] : [],
      correct_answer: Array.isArray(question.correct_answer) ? [...question.correct_answer] : [],
      explanation: question.explanation || "",
      is_active: question.is_active,
      sub_topic: question.sub_topic || ""
    });
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditedQuestion({});
  };

  const saveEdit = async (id) => {
    try {
      const { error } = await supabase
        .from("questions")
        .update(editedQuestion)
        .eq("id", id);

      if (error) {
        console.error("Error updating question:", error);
        toast.error("Failed to update question");
        return;
      }

      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, ...editedQuestion } : q
      ));
      setEditingQuestionId(null);
      setEditedQuestion({});
      toast.success("Question updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update question");
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...editedQuestion.options];
    updatedOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: updatedOptions });
  };

  const handleCorrectAnswerChange = (index, checked) => {
    const updatedCorrectAnswers = [...editedQuestion.correct_answer];
    const optionLetter = String.fromCharCode(65 + index);
    
    if (checked) {
      if (!updatedCorrectAnswers.includes(optionLetter)) {
        updatedCorrectAnswers.push(optionLetter);
      }
    } else {
      const indexToRemove = updatedCorrectAnswers.indexOf(optionLetter);
      if (indexToRemove > -1) {
        updatedCorrectAnswers.splice(indexToRemove, 1);
      }
    }
    
    setEditedQuestion({ ...editedQuestion, correct_answer: updatedCorrectAnswers });
  };

  const toggleActive = async (id, current) => {
    try {
      const { error } = await supabase
        .from("questions")
        .update({ is_active: !current })
        .eq("id", id);

      if (error) {
        console.error("Error toggling active status:", error);
        toast.error("Failed to update question status");
        return;
      }

      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, is_active: !current } : q
      ));
      toast.success("Question status updated");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update question status");
    }
  };

  const deleteQuestion = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
        return;
      }

      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleNewOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleNewCorrectAnswerChange = (index, checked) => {
    const updatedCorrectAnswers = [...newQuestion.correct_answer];
    const optionLetter = String.fromCharCode(65 + index);
    
    if (checked) {
      if (!updatedCorrectAnswers.includes(optionLetter)) {
        updatedCorrectAnswers.push(optionLetter);
      }
    } else {
      const indexToRemove = updatedCorrectAnswers.indexOf(optionLetter);
      if (indexToRemove > -1) {
        updatedCorrectAnswers.splice(indexToRemove, 1);
      }
    }
    
    setNewQuestion({ ...newQuestion, correct_answer: updatedCorrectAnswers });
  };

  const addNewQuestion = async () => {
    if (!newQuestion.question_text.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (newQuestion.options.some(opt => !opt.trim())) {
      toast.error("All options must be filled");
      return;
    }

    if (newQuestion.correct_answer.length === 0) {
      toast.error("At least one correct answer must be selected");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("questions")
        .insert([
          {
            ...newQuestion,
            certification_id: selectedCert
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding question:", error);
        toast.error("Failed to add question");
        return;
      }

      setQuestions(prev => [data, ...prev]);
      setNewQuestion({
        question_text: "",
        options: ["", "", "", ""],
        correct_answer: [],
        explanation: "",
        is_active: true,
        sub_topic: ""
      });
      setIsAddingNew(false);
      toast.success("Question added successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add question");
    }
  };

  const paginatedQuestions = questions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Questions</h1>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Certification Dropdown */}
      <Select value={selectedCert} onValueChange={setSelectedCert}>
        <SelectTrigger className="w-full max-w-md mb-4">
          <SelectValue placeholder="Select Certification" />
        </SelectTrigger>
        <SelectContent>
          {certifications.map((cert) => (
            <SelectItem key={cert.id} value={cert.id}>
              {cert.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search */}
      {selectedCert && (
        <Input
          placeholder="Search questions..."
          className="mb-4 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* Add New Question Form */}
      {isAddingNew && selectedCert && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-semibold mb-3">Add New Question</h3>
          <div className="space-y-3">
            <Textarea
              placeholder="Question text"
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
              rows={2}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 font-medium">{String.fromCharCode(65 + index)}.</span>
                  <Input
                    value={option}
                    onChange={(e) => handleNewOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                  <input
                    type="checkbox"
                    checked={newQuestion.correct_answer.includes(String.fromCharCode(65 + index))}
                    onChange={(e) => handleNewCorrectAnswerChange(index, e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Correct</span>
                </div>
              ))}
            </div>

            <Input
              placeholder="Explanation (optional)"
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
            />

            <Input
              placeholder="Sub-topic (optional)"
              value={newQuestion.sub_topic}
              onChange={(e) => setNewQuestion({...newQuestion, sub_topic: e.target.value})}
            />

            <div className="flex gap-2">
              <Button onClick={addNewQuestion}>
                <Save className="h-4 w-4 mr-2" />
                Save Question
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Table */}
      {paginatedQuestions.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Options & Correct Answers</TableHead>
                <TableHead>Explanation</TableHead>
                <TableHead>Sub-topic</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="align-top">
                    {editingQuestionId === q.id ? (
                      <Textarea
                        value={editedQuestion.question_text}
                        onChange={(e) => setEditedQuestion({...editedQuestion, question_text: e.target.value})}
                        rows={3}
                      />
                    ) : (
                      <div className="py-2">{q.question_text}</div>
                    )}
                  </TableCell>
                  
                  <TableCell className="align-top">
                    {editingQuestionId === q.id ? (
                      <div className="space-y-2">
                        {editedQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {/* <span className="w-6 font-medium">{String.fromCharCode(65 + index)}.</span> */}
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1"
                            />
                            <input
                              type="checkbox"
                              checked={editedQuestion.correct_answer.includes(String.fromCharCode(65 + index))}
                              onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                              className="w-4 h-4"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1 py-2">
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start ${q.correct_answer.includes(String.fromCharCode(65 + idx)) 
                              ? "text-green-600 font-semibold" 
                              : "text-muted-foreground"
                            }`}
                          >
                            {/* <span className="w-6">{String.fromCharCode(65 + idx)}.</span> */}
                            <span>{opt}</span>
                            {q.correct_answer.includes(String.fromCharCode(65 + idx)) && (
                              <span className="ml-2">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="align-top">
                    {editingQuestionId === q.id ? (
                      <Input
                        value={editedQuestion.explanation}
                        onChange={(e) => setEditedQuestion({...editedQuestion, explanation: e.target.value})}
                      />
                    ) : (
                      <div className="py-2">{q.explanation || "-"}</div>
                    )}
                  </TableCell>
                  
                  <TableCell className="align-top">
                    {editingQuestionId === q.id ? (
                      <Input
                        value={editedQuestion.sub_topic}
                        onChange={(e) => setEditedQuestion({...editedQuestion, sub_topic: e.target.value})}
                      />
                    ) : (
                      <div className="py-2">{q.sub_topic || "-"}</div>
                    )}
                  </TableCell>
                  
                  <TableCell className="align-top">
                    <Switch
                      checked={editingQuestionId === q.id ? editedQuestion.is_active : q.is_active}
                      onCheckedChange={() => {
                        if (editingQuestionId === q.id) {
                          setEditedQuestion({...editedQuestion, is_active: !editedQuestion.is_active});
                        } else {
                          toggleActive(q.id, q.is_active);
                        }
                      }}
                    />
                  </TableCell>
                  
                  <TableCell className="align-top">
                    {editingQuestionId === q.id ? (
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => saveEdit(q.id)}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => startEditing(q)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteQuestion(q.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {questions.length > pageSize && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </Button>
          <span className="flex items-center">Page {page} of {Math.ceil(questions.length / pageSize)}</span>
          <Button
            disabled={page * pageSize >= questions.length}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {selectedCert && questions.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-muted-foreground">
          No questions found for this certification.
        </div>
      )}
    </section>
  );
}