"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ResourcesTopPage from "@/ui/quiz-dashboard/resources-top";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function ResourcesPage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [{ data: certData, error: certError }, { data: objData, error: objError }] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        supabase.from("official_exam_objectives").select("*")
      ]);

      if (certError) console.error("Error fetching certifications:", certError);
      if (objError) console.error("Error fetching objectives:", objError);

      setCertifications(certData || []);

      // Transform objectives for UI
      const transformed = (objData || []).map((obj) => ({
        id: obj.id,
        title: obj.objective_title,
        description: obj.short_description || "No description provided.",
        certificationName: certData?.find((c) => c.id === obj.certification_id)?.name || "Unknown",
        image: obj.image_url || "/assets/default-objective.png"
      }));

      setObjectives(transformed);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      ) : (
        <section className="p-5 space-y-6 space-x-10">
          <div>
            <h1 className="text-3xl font-bold">Exam Resources</h1>
            <p className="text-muted-foreground mt-2">
              Browse our various selection of resources for your certifications
            </p>
          </div>
          <Separator />
          <ResourcesTopPage objectives={objectives} />
        </section>
      )}
    </>
  );
}
