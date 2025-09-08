"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Supabase client (browser-safe anon key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// TODO: Replace with your actual plan IDs from Supabase
const STANDARD_PLAN_ID = "5623589a-885c-4ac1-8842-12247cadc89e";
const FULL_ACCESS_PLAN_ID = "3ed77a5b-3fde-4bf8-ae4d-7952ec8197b6";

export default function Pricing() {
  const [certifications, setCertifications] = useState([]);
  const [chosenCert, setChosenCert] = useState("");

  // Fetch certifications from Supabase
  useEffect(() => {
    async function fetchCerts() {
      const { data, error } = await supabase.from("certifications").select("id, name");
      if (!error && data) {
        setCertifications(data);
      }
    }
    fetchCerts();
  }, []);

  // Subscribe handler
  async function handleSubscribe(planId, certId) {
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          certification_id: certId || null,
          // backend can infer user_id/email from Supabase session
        }),
      });

      const data = await res.json();
      if (data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url; // redirect to Paystack
      } else {
        alert("Unable to start payment. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong starting your payment.");
    }
  }

  return (
    <section id="Pricing" className="min-h-screen flex items-center justify-center bg-white px-6 py-12 overflow-hidden">
      <div className="w-full max-w-6xl flex flex-col items-center gap-10">
        {/* Heading */}
        <div className="max-w-2xl text-center space-y-4">
          <h1 className="text-4xl font-semibold lg:text-5xl">Pricing Tiers</h1>
          <p>
            Choose a plan that fits your certification journey — from first-time learners to
            professionals pursuing certifications.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3 w-full">
          {/* Free Plan */}
          <Card className="flex flex-col h-full justify-between">
            <div>
              <CardHeader>
                <CardTitle className="font-medium">Free</CardTitle>
                <span className="my-3 block text-2xl font-semibold">$0 / mo</span>
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
          </Card>

          {/* Standard Plan */}
          <Card className="relative flex flex-col h-full justify-between">
            <span className="bg-linear-to-br/increasing absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
              Popular
            </span>
            <div>
              <CardHeader>
                <CardTitle className="font-medium">Standard</CardTitle>
                <span className="my-3 block text-2xl font-semibold">$15 / mo</span>
                <CardDescription className="text-sm">Per user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <hr className="border-dashed my-4" />
                <ul className="list-outside space-y-3 text-sm text-left">
                  {[
                    "Everything from Free, plus:",
                    "Full Access to 1 Chosen Certification",
                    "Unlimited Practice Tests for that Cert",
                    "Curated list of Resources for that Cert",
                    "Question Flagging for Review",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="size-3" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">Choose Certification</label>
                  <select
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    value={chosenCert}
                    onChange={(e) => setChosenCert(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {certifications.map((cert) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </div>
            <CardContent>
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  if (!chosenCert) {
                    alert("Please select a certification first.");
                    return;
                  }
                  handleSubscribe(STANDARD_PLAN_ID, chosenCert);
                }}
              >
                Subscribe
              </Button>
            </CardContent>
          </Card>

          {/* Full-Access Plan */}
          <Card className="flex flex-col h-full justify-between">
            <div>
              <CardHeader>
                <CardTitle className="font-medium">Full-Access</CardTitle>
                <span className="my-3 block text-2xl font-semibold">$40 / mo</span>
                <CardDescription className="text-sm">Per user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <hr className="border-dashed my-4" />
                <ul className="list-outside space-y-3 text-sm text-left">
                  {[
                    "Everything from Standard, plus:",
                    "Access to All Certifications",
                    "Unlimited Practice Tests Across All Certs",
                    "All Resources",
                    "Question Flagging for Review",
                    "Custom Quiz Builder",
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
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleSubscribe(FULL_ACCESS_PLAN_ID)}
              >
                Subscribe
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
