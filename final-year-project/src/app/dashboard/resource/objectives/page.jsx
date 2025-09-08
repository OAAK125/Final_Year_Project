"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function ObjectivesPage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch user subscription
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_id, certification_id, plans(name)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        setSubscription(sub);
      }

      // Fetch certs + objectives
      const [{ data: certData, error: certError }, { data: objData, error: objError }] =
        await Promise.all([
          supabase.from("certifications").select("id, name"),
          supabase.from("official_exam_objectives").select("*"),
        ]);

      if (certError) console.error("Error fetching certifications:", certError);
      if (objError) console.error("Error fetching objectives:", objError);

      setCertifications(certData || []);

      const transformed = (objData || []).map((obj) => ({
        id: obj.id,
        certificationId: obj.certification_id,
        title: obj.objective_title,
        description: obj.short_description || "No description provided.",
        certificationName:
          certData?.find((c) => c.id === obj.certification_id)?.name || "Unknown",
        image: obj.image_url || "/assets/default-objective.png",
        target_url: obj.target_url,
      }));

      // If Standard: move their certification’s objectives to the top
      let reordered = transformed;
      if (subscription?.plans?.name === "Standard" && subscription.certification_id) {
        reordered = [
          ...transformed.filter((o) => o.certificationId === subscription.certification_id),
          ...transformed.filter((o) => o.certificationId !== subscription.certification_id),
        ];
      }

      setObjectives(reordered);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center mb-5">
        <h2 className="text-2xl font-semibold">Official Objectives</h2>
      </div>

      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
          {objectives.map((obj) => (
            <a
              key={obj.id}
              href={obj.target_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted"
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <img
                  src={obj.image}
                  alt={obj.title}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Official Objective
                  </p>
                  <h3 className="text-lg font-semibold">{obj.title}</h3>
                  <p className="text-sm text-muted-foreground py-2">
                    {obj.description}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground pt-2 font-bold">
                  Certification: {obj.certificationName}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
