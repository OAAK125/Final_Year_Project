"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function EditQuestionsPage() {
  const supabase = createClient();
  const [questions, setQuestions] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchCertifications();
  }, []);

  useEffect(() => {
    if (selectedCertification) {
      fetchQuestions(selectedCertification);
    }
  }, [selectedCertification]);

  const fetchCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("id, name, code")
        .order("name");

      if (error) {
        console.error(error);
        toast.error("Failed to load certifications");
        return;
      }
      setCertifications(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const fetchQuestions = async (certId) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("id, question_text, options, correct_answer, explanation, certification_id")
        .eq("certification_id", certId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Failed to load questions");
        return;
      }
      setQuestions(data || []);
      setPage(1); // reset page when certification changes
    } catch (err) {
      console.error(err);
      toast.error("Error loading questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion({ ...question, options: [...(question.options || [])] });
    setIsEditDialogOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...editingQuestion.options];
    updatedOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: updatedOptions });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;

    try {
      if (!selectedCertification) {
        toast.error("Choose a certification");
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error(userError);
        toast.error("Failed to get user");
        return;
      }

      const { error } = await supabase
        .from("contributor_submissions")
        .insert({
          certification_id: editingQuestion.certification_id,
          user_id: user.id,
          type: "edited", // must match schema check constraint
          question_text: editingQuestion.question_text,
          options: editingQuestion.options,
          correct_answer: editingQuestion.correct_answer,
          explanation: editingQuestion.explanation || "",
          approved: false,
        });

      if (error) {
        console.error("Insert error:", error.message || error);
        toast.error("Failed to submit edit for review");
        return;
      }

      toast.success("Edit submitted for review! ");
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      fetchQuestions(selectedCertification);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Error saving edit");
    }
  };

  // paginate
  const startIndex = (page - 1) * pageSize;
  const paginatedQuestions = questions.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(questions.length / pageSize);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Edit Questions</h1>
        <div className="w-full sm:w-64">
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
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">
          {selectedCertification ? "Loading..." : "Choose a certification"}
        </div>
      ) : paginatedQuestions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {selectedCertification
            ? "No questions found for this certification"
            : "Choose a certification"}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-lg truncate">
                    {q.question_text}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditQuestion(q)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Make your edits and submit for admin review.
            </DialogDescription>
          </DialogHeader>

          {editingQuestion && (
            <div className="space-y-4">
              <div>
                <Label>Question</Label>
                <Textarea
                  value={editingQuestion.question_text}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question_text: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {editingQuestion.options.map((opt, i) => (
                  <Input
                    key={i}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                ))}
              </div>

              <div>
                <Label>Correct Answer (letters like A,B)</Label>
                <Input
                  value={editingQuestion.correct_answer}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      correct_answer: e.target.value.split(","),
                    })
                  }
                />
              </div>

              <div>
                <Label>Explanation</Label>
                <Textarea
                  value={editingQuestion.explanation}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Submit Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
