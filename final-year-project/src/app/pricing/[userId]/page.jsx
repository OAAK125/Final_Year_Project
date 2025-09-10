"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const FREE_PLAN_ID = "c000440f-2269-4e17-b445-e1c4510504d8"; // adjust
const STANDARD_PLAN_ID = "5623589a-885c-4ac1-8842-12247cadc89e";
const FULL_ACCESS_PLAN_ID = "3ed77a5b-3fde-4bf8-ae4d-7952ec8197b6";

export default function Pricing() {
  const supabase = createClient();
  const router = useRouter();

  const [certifications, setCertifications] = useState([]);
  const [chosenCert, setChosenCert] = useState("");
  const [userId, setUserId] = useState(null);
  const [userPlan, setUserPlan] = useState(null); // track current plan
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/authentication/login");
        return;
      }
      setUserId(user.id);

      // fetch certifications
      const { data: certData } = await supabase
        .from("certifications")
        .select("id, name")
        .order("name", { ascending: true });

      if (certData) setCertifications(certData);

      // fetch subscription plan
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subData) {
        setUserPlan(subData.plan_id);
      }

      setIsLoading(false);
    }

    fetchData();
  }, [supabase, router]);

  async function handleSubscribe(planId, certId) {
    if (!userId) {
      router.push("/authentication/login");
      return;
    }

    if (planId === STANDARD_PLAN_ID && !certId) {
      alert("Please select a certification first.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          certification_id: certId || null,
        }),
      });

      const data = await res.json();
      if (data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert("Unable to start payment. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong starting your payment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDowngrade() {
    try {
      setSubmitting(true);
      const res = await fetch("/api/subscriptions/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, plan_id: FREE_PLAN_ID }),
      });

      if (!res.ok) {
        alert("Failed to downgrade to Free plan.");
        return;
      }

      alert("Your subscription has been downgraded to Free.");
      setUserPlan(FREE_PLAN_ID);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="Pricing"
      className="min-h-screen flex items-center justify-center bg-white px-6 py-12 overflow-hidden"
    >
      <div className="w-full max-w-6xl flex flex-col items-center gap-10">
        <div className="max-w-2xl text-center space-y-4">
          <h1 className="text-4xl font-semibold lg:text-5xl">Pricing Tiers</h1>
          <p>
            Choose a plan that fits your certification journey — from first-time
            learners to professionals pursuing certifications.
          </p>
        </div>

        {isLoading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 w-full">
            {/* Free Plan */}
            <Card className="flex flex-col h-full justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="font-medium">Free</CardTitle>
                  <span className="my-3 block text-2xl font-semibold">
                    $0 / mo
                  </span>
                  <CardDescription className="text-sm">Per user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <hr className="border-dashed my-4" />
                  <ul className="list-outside space-y-3 text-sm text-left">
                    {[
                      "1 Trial Practice Test per Certification",
                      "Access to exam objectives",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
              <CardContent>
                {userPlan === FREE_PLAN_ID ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={submitting}
                      >
                        Downgrade to Free
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Downgrade to Free Plan?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          If you downgrade, you’ll lose access to Standard or
                          Full-Access features.{" "}
                          <strong>
                            Payments already made will not be refunded.
                          </strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDowngrade}>
                          Confirm Downgrade
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>

            {/* Standard + Full (same as your existing code)... */}
          </div>
        )}
      </div>
    </section>
  );
}
