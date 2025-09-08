"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ResourceGuide() {
  const supabase = createClient();
  const router = useRouter();

  const [certifications, setCertifications] = useState([]);
  const [guides, setGuides] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [
        { data: certData, error: certError },
        { data: guideData, error: guideError },
        { data: userData },
      ] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        supabase.from("study_guides").select("*"),
        supabase.auth.getUser(),
      ]);

      if (certError) console.error("Error fetching certifications:", certError);
      if (guideError) console.error("Error fetching study guides:", guideError);

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

      const transformed = (guideData || []).map((guide) => ({
        id: guide.id,
        title: guide.title,
        description: guide.short_description || "No description provided.",
        author: guide.author || "Unknown Author",
        published_date: guide.published_date
          ? new Date(guide.published_date).toLocaleDateString()
          : "Unknown Date",
        certificationId: guide.certification_id,
        certificationName:
          certData?.find((c) => c.id === guide.certification_id)?.name || "Unknown",
        image: guide.image_url || "/assets/default-guide.png",
        target_url: guide.url,
      }));

      setGuides(transformed);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading study guides...</p>
      </div>
    );
  }

  const plan = subscription?.plans?.name;

  // Decide which guides to show
  let visibleGuides = [];
  if (!subscription || plan === "Free") {
    visibleGuides = []; // hide all guides
  } else if (plan === "Standard") {
    if (subscription.certification_id) {
      visibleGuides = guides.filter(
        (g) => g.certificationId === subscription.certification_id
      );
    }
  } else if (plan === "All-Access") {
    visibleGuides = guides;
  }

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Study Guides</h2>
        {guides.length > 0 && (
          <a
            className="text-sm text-muted-foreground hover:underline hover:text-primary"
            href={"/dashboard/resource/study_guide"}
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
          {visibleGuides.slice(0, 3).map((guide) => (
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
      )}
    </section>
  );
}
