"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ResourceVideo() {
  const supabase = createClient();
  const router = useRouter();

  const [certifications, setCertifications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [
        { data: certData, error: certError },
        { data: vidData, error: vidError },
        { data: userData },
      ] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        supabase.from("video_courses").select("*"),
        supabase.auth.getUser(),
      ]);

      if (certError) console.error("Error fetching certifications:", certError);
      if (vidError) console.error("Error fetching video courses:", vidError);

      setCertifications(certData || []);

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

      const transformed = (vidData || []).map((vid) => ({
        id: vid.id,
        title: vid.title,
        description: vid.short_description || "No description provided.",
        instructor: vid.instructor || "Unknown Instructor",
        duration: vid.duration_minutes ? `${vid.duration_minutes} minutes` : "N/A",
        certificationId: vid.certification_id,
        certificationName:
          certData?.find((c) => c.id === vid.certification_id)?.name || "Unknown",
        image: vid.image_url || "/assets/default-video.png",
        target_url: vid.url,
      }));

      setVideos(transformed);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading videos...</p>
      </div>
    );
  }

  const plan = subscription?.plans?.name;

  // Decide which videos to show
  let visibleVideos = [];
  if (!subscription || plan === "Free") {
    visibleVideos = []; // hide all
  } else if (plan === "Standard") {
    if (subscription.certification_id) {
      visibleVideos = videos.filter(
        (v) => v.certificationId === subscription.certification_id
      );
    }
  } else if (plan === "All-Access") {
    visibleVideos = videos;
  }

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Video Courses</h2>
        {videos.length > 0 && (
          <a
            className="text-sm text-muted-foreground hover:underline hover:text-primary"
            href={"/dashboard/resource/video"}
          >
            View All
          </a>
        )}
      </div>

      {/* Free users: show pay button */}
      {(!subscription || plan === "Free") ? (
        <div className="flex justify-center">
          {userId && (
            <Button
              variant="default"
              size="lg"
              className="w-1/2 text-base font-semibold"
              onClick={() => router.push(`/pricing/${userId}`)}
            >
              Pay to view
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
          {visibleVideos.slice(0, 3).map((vid) => (
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
                    Video Course
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
      )}
    </section>
  );
}
