"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const triggerStyle =
  "text-sm px-4 py-2 border border-input rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring data-[state=open]:border-primary data-[state=open]:text-primary";

export default function GuidePage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [guides, setGuides] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔑 Filters
  const [certificationTypes, setCertificationTypes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({
    certificationType: "",
    topic: "",
  });

  const [selectedCertificationType, setSelectedCertificationType] =
    useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // ✅ fetch user + subscription
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_id, certification_id, plans(name)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        setSubscription(sub);
      }

      // ✅ fetch filter options
      const [{ data: certTypes }, { data: topicsData }] = await Promise.all([
        supabase.from("certification_type").select("id, name"),
        supabase.from("topics").select("id, name"),
      ]);

      setCertificationTypes(certTypes || []);
      setTopics(topicsData || []);

      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  useEffect(() => {
    const fetchGuides = async () => {
      setIsLoading(true);

      let query = supabase.from("study_guides").select("*");

      // ✅ filter by certificationType
      if (filters.certificationType) {
        query = query.eq("certification_type_id", filters.certificationType);
      }

      // ✅ filter by topic
      if (filters.topic) {
        query = query.eq("topic_id", filters.topic);
      }

      const [{ data: certData }, { data: guideData }] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        query,
      ]);

      setCertifications(certData || []);

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
          certData?.find((c) => c.id === guide.certification_id)?.name ||
          "Unknown",
        image: guide.image_url || "/assets/default-guide.png",
        target_url: guide.url,
      }));

      setGuides(transformed);
      setIsLoading(false);
    };

    fetchGuides();
  }, [filters, supabase]);

  // ✅ filtered view based on subscription
  const getVisibleGuides = () => {
    if (!subscription || subscription.plans?.name === "Free") return []; // free sees nothing
    if (subscription.plans?.name === "Standard") {
      return guides.filter(
        (g) => g.certificationId === subscription.certification_id
      );
    }
    return guides; // All-Access sees everything
  };

  const visibleGuides = getVisibleGuides();

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Study Guides</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Select
          value={selectedCertificationType}
          onValueChange={(value) => {
            setFilters({ ...filters, certificationType: value });
            setSelectedCertificationType(value);
          }}
        >
          <SelectTrigger className={triggerStyle}>
            <SelectValue placeholder="Certification Type" />
          </SelectTrigger>
          <SelectContent>
            {certificationTypes.map((ct) => (
              <SelectItem key={ct.id} value={ct.id.toString()}>
                {ct.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedTopic}
          onValueChange={(value) => {
            setFilters({ ...filters, topic: value });
            setSelectedTopic(value);
          }}
        >
          <SelectTrigger className={triggerStyle}>
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((tp) => (
              <SelectItem key={tp.id} value={tp.id.toString()}>
                {tp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          className="text-sm text-primary hover:underline whitespace-nowrap"
          onClick={() => {
            setFilters({
              certificationType: "",
              topic: "",
            });
            setSelectedCertificationType("");
            setSelectedTopic("");
          }}
        >
          Clear filters
        </button>
      </div>

      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      ) : !subscription || subscription.plans?.name === "Free" ? (
        <div className="flex justify-center">
          {userId && (
            <Button
              variant="default"
              className="text-base font-semibold"
              onClick={() => (window.location.href = `/pricing/${userId}`)}
            >
              Pay to View
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
          {visibleGuides.map((guide) => (
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
