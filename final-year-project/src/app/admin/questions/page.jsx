"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function QuizQuestionsPage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [selectedCert, setSelectedCert] = useState("");
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const pageSize = 10;

  // Fetch certifications
  useEffect(() => {
    const fetchCertifications = async () => {
      const { data, error } = await supabase.from("certifications").select("id, name");
      if (error) console.error(error);
      else setCertifications(data || []);
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

      const { data, error } = await query.order("id", { ascending: true });
      if (error) console.error(error);
      else setQuestions(data || []);
      setPage(1);
    };
    fetchQuestions();
  }, [selectedCert, search]);

  const saveEdit = async (id) => {
    const { error } = await supabase.from("questions").update({ question_text: editedText }).eq("id", id);
    if (error) console.error(error);
    else {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, question_text: editedText } : q)));
      setEditingQuestionId(null);
    }
  };

  const toggleActive = async (id, current) => {
    const { error } = await supabase.from("questions").update({ is_active: !current }).eq("id", id);
    if (error) console.error(error);
    else {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, is_active: !current } : q)));
    }
  };

  const paginatedQuestions = questions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6">Quiz Questions</h1>

      {/* Certification Dropdown */}
      <Select value={selectedCert} onValueChange={setSelectedCert}>
        <SelectTrigger>
          <SelectValue placeholder="Select Certification" />
        </SelectTrigger>
        <SelectContent>
          {certifications.map((cert) => (
            <SelectItem key={cert.id} value={cert.id.toString()}>
              {cert.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search */}
      {selectedCert && (
        <Input
          placeholder="Search questions..."
          className="mt-4 mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* Questions Table */}
      {paginatedQuestions.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Correct Answer</TableHead>
              <TableHead>Explanation</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell>
                  {editingQuestionId === q.id ? (
                    <Input
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                  ) : (
                    q.question_text
                  )}
                </TableCell>
                <TableCell>
                  <ul className="list-disc pl-5">
                    {Object.values(q.options || {}).map((opt, idx) => (
                      <li key={idx}>{opt}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <ul className="list-disc pl-5 text-green-700 font-semibold">
                    {Object.values(q.correct_answer || {}).map((ans, idx) => (
                      <li key={idx}>{ans}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{q.explanation}</TableCell>
                <TableCell>
                  <Switch
                    checked={q.is_active}
                    onCheckedChange={() => toggleActive(q.id, q.is_active)}
                  />
                </TableCell>
                <TableCell>
                  {editingQuestionId === q.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(q.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingQuestionId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => { setEditingQuestionId(q.id); setEditedText(q.question_text); }}>
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          <span className="flex items-center">Page {page}</span>
          <Button
            disabled={page * pageSize >= questions.length}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
