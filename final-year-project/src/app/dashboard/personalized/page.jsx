"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import PersonalizeMiddle from "@/ui/quiz-dashboard/personalize-middle";
import PersonalizeTop from "@/ui/quiz-dashboard/personalize-top";
import PersonalizeBottom from "@/ui/quiz-dashboard/personalize-bottom";
import { Loader2 } from "lucide-react";

const PersonalizedPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000); 

    return () => clearTimeout(loadTimeout);
  }, []);

  return (
    <>
      <section className="p-5 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Personalized Insights</h1>
          <p className="text-muted-foreground mt-2">
            Let our AI help you to improve your practice.
          </p>
        </div>
        <Separator />
      </section>

      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          <PersonalizeTop />
          <PersonalizeMiddle />
          <PersonalizeBottom />
        </>
      )}
    </>
  );
};

export default PersonalizedPage;
