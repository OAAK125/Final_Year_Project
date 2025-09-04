"use client";

import { useEffect, useState } from "react";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";

export default function PersonalizeBottom() {
  const supabase = createClient();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchFlagged = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // fetch subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id, plans(name)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setSubscription(sub);

      // fetch flagged questions
      const { data } = await supabase
        .from("flagged_questions")
        .select(
          "id, question_id, quiz_session_id, questions(*, certification:certifications(name))"
        )
        .eq("user_id", user.id);

      setQuestions(data || []);
      setLoading(false);
    };

    fetchFlagged();
  }, [supabase]);

  const markAsUnderstood = async (id) => {
    await supabase.from("flagged_questions").delete().eq("id", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const plan = subscription?.plans?.name;

  return (
    <div className="mx-5">
      <div className="border border-border rounded-xl overflow-hidden flex flex-col justify-between">
        <div className="p-6 md:p-8 space-y-4">
          {/* Header + Info */}
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold">Flagged Questions</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm max-w-xs">
                These are the questions you flagged during your practice. Click to review them.
              </PopoverContent>
            </Popover>
          </div>

          {/* Free users: show pay button instead of table */}
          {(!subscription || plan === "Free") && userId && (
            <div className="text-center py-6">
              <Button
                variant="default"
                className="w-1/2 font-semibold"
                onClick={() => window.location.href = `/pricing/${userId}`}
              >
                Pay to View
              </Button>
            </div>
          )}

          {/* Standard + All-Access: show table */}
          {(plan === "Standard" || plan === "All-Access") && (
            <Table>
              <TableCaption>A list of questions you have flagged for review</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Marked as Understood</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">
                        {item.questions?.certification?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-left"
                            >
                              {item.questions?.question_text || "View Question"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Flagged Question</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-4">
                                <div>
                                  <strong>Question:</strong>{" "}
                                  {item.questions?.question_text}
                                </div>
                                <div>
                                  <strong>Options:</strong>
                                  <ul className="list-disc list-inside">
                                    {item.questions?.options?.map((opt, idx) => (
                                      <li key={idx}>{opt}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <strong>Correct Answer:</strong>{" "}
                                  {item.questions?.correct_answer}
                                </div>
                                <div>
                                  <strong>Explanation:</strong>{" "}
                                  {item.questions?.explanation}
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                              <Button onClick={() => markAsUnderstood(item.id)}>
                                Mark as Understood
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => markAsUnderstood(item.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
