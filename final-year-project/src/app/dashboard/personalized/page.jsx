"use client";

import { Separator } from "@/components/ui/separator";
import PersonalizeMiddle from "@/ui/quiz-dashboard/personalize-middle";
import PersonalizeTop  from "@/ui/quiz-dashboard/personalize-top";
import PersonalizeBottom from "@/ui/quiz-dashboard/personalize-bottom";


const PersonalizedPage = () => {
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
    <PersonalizeTop />
    <PersonalizeMiddle />
    <PersonalizeBottom />
    
    </>
  );
};

export default PersonalizedPage;
