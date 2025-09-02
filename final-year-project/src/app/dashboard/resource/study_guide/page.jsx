"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function GuidePage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [{ data: certData, error: certError }, { data: guideData, error: guideError }] =
        await Promise.all([
          supabase.from("certifications").select("id, name"),
          supabase.from("study_guides").select("*"),
        ]);

      if (certError) console.error("Error fetching certifications:", certError);
      if (guideError) console.error("Error fetching study guides:", guideError);

      setCertifications(certData || []);

      const transformed = (guideData || []).map((guide) => ({
        id: guide.id,
        title: guide.title,
        description: guide.short_description || "No description provided.",
        author: guide.author || "Unknown Author",
        published_date: guide.published_date
          ? new Date(guide.published_date).toLocaleDateString()
          : "Unknown Date",
        certificationName:
          certData?.find((c) => c.id === guide.certification_id)?.name || "Unknown",
        image: guide.image_url || "/assets/default-guide.png",
        target_url: guide.url,
      }));

      setGuides(transformed);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Study Guides</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
        {guides.map((guide) => (
          <a
            key={guide.id}
            href={guide.target_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted"
          >
            <div className="relative w-full aspect-video overflow-hidden">
              <img
                src={guide.image}
                alt={guide.title}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Study Guide
                </p>
                <h3 className="text-lg font-semibold">{guide.title}</h3>
                <p className="text-sm text-muted-foreground py-2">
                  {guide.description}
                </p>
                <p className="pt-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {guide.author} • {guide.published_date}
                </p>
              </div>

              <div className="text-sm text-muted-foreground pt-2 font-bold">
                Certification: {guide.certificationName}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
