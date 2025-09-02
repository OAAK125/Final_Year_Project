"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function VideoPage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [{ data: certData, error: certError }, { data: vidData, error: vidError }] =
        await Promise.all([
          supabase.from("certifications").select("id, name"),
          supabase.from("video_courses").select("*"),
        ]);

      if (certError) console.error("Error fetching certifications:", certError);
      if (vidError) console.error("Error fetching video courses:", vidError);

      setCertifications(certData || []);

      const transformed = (vidData || []).map((vid) => ({
        id: vid.id,
        title: vid.title,
        description: vid.short_description || "No description provided.",
        instructor: vid.instructor || "Unknown Instructor",
        duration: vid.duration_minutes ? `${vid.duration_minutes} minutes` : "N/A",
        certificationName:
          certData?.find((c) => c.id === vid.certification_id)?.name || "Unknown",
        image: vid.image_url || "/assets/default-video.png",
        target_url: vid.url,
      }));

      setVideos(transformed);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Video Courses</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
        {videos.map((vid) => (
          <a
            key={vid.id}
            href={vid.target_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted"
          >
            <div className="relative w-full aspect-video overflow-hidden">
              <img
                src={vid.image}
                alt={vid.title}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Video Courses
                </p>
                <h3 className="text-lg font-semibold">{vid.title}</h3>
                <p className="text-sm text-muted-foreground py-2">
                  {vid.description}
                </p>
                 <p className="pt-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {vid.instructor} • {vid.duration}
                </p>
              </div>

              <div className="text-sm text-muted-foreground pt-2 font-bold">
                Certification: {vid.certificationName}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
