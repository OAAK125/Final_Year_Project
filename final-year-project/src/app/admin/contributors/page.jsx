"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Search } from "lucide-react";

export default function ApproveQuestionsPage() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [selectedCert, setSelectedCert] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  // Fetch certifications & submissions
  useEffect(() => {
    fetchCertifications();
    fetchSubmissions();
  }, []);

  async function fetchCertifications() {
    const { data, error } = await supabase
      .from("certifications")
      .select("id, name, code")
      .order("name");

    if (error) {
      toast.error("Failed to load certifications");
      return;
    }
    setCertifications(data || []);
  }

  async function fetchSubmissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contributor_submissions")
      .select(
        "id, user_id, certification_id, question_text, options, correct_answer, explanation, type, approved, created_at"
      )
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load submissions");
      setLoading(false);
      return;
    }
    setSubmissions(data || []);
    setLoading(false);
  }

  async function handleApprove(submission) {
    setProcessing(submission.id);

    try {
      // 1. Insert approved question into `questions` table
      const { error: insertError } = await supabase.from("questions").insert({
        certification_id: submission.certification_id,
        question_text: submission.question_text,
        options: submission.options,
        correct_answer: submission.correct_answer,
        explanation: submission.explanation,
      });

      if (insertError) {
        console.error("Insert error:", insertError.message || insertError);
        toast.error("Failed to insert question");
        setProcessing(null);
        return;
      }

      // 2. Mark contributor submission as approved
      const { error: updateError } = await supabase
        .from("contributor_submissions")
        .update({ approved: true })
        .eq("id", submission.id);

      if (updateError) {
        console.error("Update error:", updateError.message || updateError);
        toast.error("Failed to update submission status");
        setProcessing(null);
        return;
      }

      // 3. Update or create wallet balance
      const reward = submission.type === "edited" ? 0.1 : 0.3;

      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", submission.user_id)
        .maybeSingle();

      if (walletError) throw walletError;

      if (wallet) {
        // Wallet exists → update balance
        const { error: balanceError } = await supabase
          .from("wallets")
          .update({ balance: Number(wallet.balance) + reward })
          .eq("id", wallet.id);

        if (balanceError) throw balanceError;
      } else {
        // No wallet yet → create new wallet for this user
        const { error: insertWalletError } = await supabase
          .from("wallets")
          .insert({
            user_id: submission.user_id,
            balance: reward,
          });

        if (insertWalletError) throw insertWalletError;
      }

      toast.success("Submission approved and contributor rewarded");
      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    } catch (err) {
      console.error("Approve error:", err.message || err);
      toast.error("Failed to approve submission");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(submissionId) {
    setProcessing(submissionId);
    try {
      const { error } = await supabase
        .from("contributor_submissions")
        .update({ approved: false })
        .eq("id", submissionId);

      if (error) throw error;

      toast.info("Submission rejected");
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    } catch (err) {
      console.error("Reject error:", err.message || err);
      toast.error("Failed to reject submission");
    } finally {
      setProcessing(null);
    }
  }

  const filtered = submissions.filter((s) => {
    const matchesCert =
      selectedCert === "all" ? true : s.certification_id === selectedCert;
    const matchesSearch = s.question_text
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCert && matchesSearch;
  });

  return (
    <section className="container mx-auto px-6 py-12">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Approve Contributor Questions</CardTitle>
              <CardDescription>
                Review pending submissions before they go live
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Select value={selectedCert} onValueChange={setSelectedCert}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by certification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Certifications</SelectItem>
                  {certifications.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {selectedCert
                ? "No submissions pending approval"
                : "Choose a certification"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="max-w-xs truncate">
                      {s.question_text}
                    </TableCell>
                    <TableCell>
                      {s.type === "edited" ? "Edit (GHS 0.1)" : "Created (GHS 0.3)"}
                    </TableCell>
                    <TableCell>
                      {new Date(s.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        disabled={processing === s.id}
                        onClick={() => handleApprove(s)}
                      >
                        {processing === s.id ? (
                          <Loader2 className="w w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={processing === s.id}
                        onClick={() => handleReject(s.id)}
                      >
                        <XCircle className="w-4 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
