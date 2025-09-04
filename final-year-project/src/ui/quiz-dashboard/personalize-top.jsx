"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const questionOptions = [5, 10, 15, 20, 25];

export default function PersonalizeTop() {
  const supabase = createClient();
  const router = useRouter();

  const [certifications, setCertifications] = React.useState([]);
  const [selectedCertification, setSelectedCertification] = React.useState("");
  const [selectedQuestions, setSelectedQuestions] = React.useState(10);
  const [includeFlagged, setIncludeFlagged] = React.useState("Yes");
  const [subscription, setSubscription] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [{ data: certs }, { data: userData }] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        supabase.auth.getUser(),
      ]);

      if (certs) {
        setCertifications(certs);
        setSelectedCertification(certs[0]?.id || "");
      }

      if (userData?.user) {
        setUserId(userData.user.id);

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_id, certification_id, plans(name)")
          .eq("user_id", userData.user.id)
          .eq("status", "active")
          .maybeSingle();

        setSubscription(sub);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const handleStartQuiz = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !selectedCertification) return;

    const { data, error } = await supabase
      .from("custom_quizzes")
      .insert({
        user_id: user.id,
        certification_id: selectedCertification,
        num_questions: selectedQuestions,
        include_flagged: includeFlagged === "Yes",
      })
      .select()
      .single();

    if (!error && data) {
      router.push(`/custom/${data.id}`);
    }
  };

  const plan = subscription?.plans?.name;

  if (loading) {
    return (
      <section className="py-5 w-[90%] mx-auto text-center md:w-[90%] lg:w-[60%]">
        <div className="flex flex-col items-center border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 w-[90%] mx-auto text-center md:w-[90%] lg:w-[60%]">
      <div className="flex flex-col items-center text-center border border-border rounded-xl p-4 md:rounded-xl lg:p-6">
        <h3 className="text-xl font-semibold">Personalize Your Quiz Experience</h3>
        <p className="text-sm my-2 text-muted-foreground py-2">
          Tailor your quiz based on your goals and preferences.
        </p>

        {/* Free & Standard users: only Pay button */}
        {(!subscription || plan === "Free" || plan === "Standard") && userId && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => router.push(`/pricing/${userId}`)}
          >
            Pay Full Access to continue
          </Button>
        )}

        {/* Full Access users: show full dialog */}
        {plan === "All-Access" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">Take a Custom Quiz</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-center mb-5">
                  Quiz Configuration
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Certification Selection */}
                <div className="space-y-2 text-center">
                  <p>Select Certification</p>
                  <Select
                    value={selectedCertification}
                    onValueChange={setSelectedCertification}
                  >
                    <SelectTrigger className="w-[80%] text-center mx-auto">
                      <SelectValue placeholder="Choose a certification" />
                    </SelectTrigger>
                    <SelectContent>
                      {certifications.map((cert) => (
                        <SelectItem key={cert.id} value={cert.id}>
                          {cert.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* No. of Questions */}
                <div className="space-y-2 text-center">
                  <p>No. of Questions</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {questionOptions.map((q) => (
                      <Button
                        key={q}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-12 px-0",
                          selectedQuestions === q &&
                            "bg-primary text-background border-primary"
                        )}
                        onClick={() => setSelectedQuestions(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Include Flagged */}
                <div className="space-y-2 text-center">
                  <p>Include Flagged Questions?</p>
                  <Select
                    value={includeFlagged}
                    onValueChange={setIncludeFlagged}
                  >
                    <SelectTrigger className="w-[30%] text-center mx-auto">
                      <SelectValue placeholder="Yes or No" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Quiz Button */}
                <div className="text-center pt-2">
                  <Button className="w-full" onClick={handleStartQuiz}>
                    Start Quiz
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
}
