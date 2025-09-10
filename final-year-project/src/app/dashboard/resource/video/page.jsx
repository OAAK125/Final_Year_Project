"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const FREE_PLAN_ID = "c000440f-2269-4e17-b445-e1c4510504d8";
const STANDARD_PLAN_ID = "5623589a-885c-4ac1-8842-12247cadc89e";
const FULL_ACCESS_PLAN_ID = "3ed77a5b-3fde-4bf8-ae4d-7952ec8197b6";

const triggerStyle =
  "text-sm px-4 py-2 border border-input rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring data-[state=open]:border-primary data-[state=open]:text-primary";

export default function VideoPage() {
  const supabase = createClient();
  const router = useRouter();

  const [certifications, setCertifications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [certificationTypes, setCertificationTypes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({
    certificationType: "",
    topic: "",
  });

  const [selectedCertificationType, setSelectedCertificationType] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // fetch user + subscription
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_id, certification_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        setSubscription(sub);
      }

      // fetch filter options
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
    const fetchVideos = async () => {
      setIsLoading(true);

      let query = supabase.from("video_courses").select("*");

      if (filters.certificationType) {
        query = query.eq("certification_type_id", filters.certificationType);
      }

      if (filters.topic) {
        query = query.eq("topic_id", filters.topic);
      }

      const [{ data: certData }, { data: vidData }] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        query,
      ]);

      setCertifications(certData || []);

      const transformed = (vidData || []).map((vid) => ({
        id: vid.id,
        title: vid.title,
        description: vid.short_description || "No description provided.",
        instructor: vid.instructor || "Unknown Instructor",
        duration: vid.duration_minutes
          ? `${vid.duration_minutes} minutes`
          : "N/A",
        certificationId: vid.certification_id,
        certificationName:
          certData?.find((c) => c.id === vid.certification_id)?.name ||
          "Unknown",
        image: vid.image_url || "/assets/default-video.png",
        target_url: vid.url,
      }));

      setVideos(transformed);
      setIsLoading(false);
    };

    fetchVideos();
  }, [filters, supabase]);

  // Filtered view based on subscription using plan_id
  const getVisibleVideos = () => {
    if (!subscription) return [];

    if (subscription.plan_id === FREE_PLAN_ID) return [];

    if (subscription.plan_id === STANDARD_PLAN_ID) {
      return videos.filter(
        (v) => v.certificationId === subscription.certification_id
      );
    }

    if (subscription.plan_id === FULL_ACCESS_PLAN_ID) {
      return videos;
    }

    return [];
  };

  const visibleVideos = getVisibleVideos();

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Video Courses</h2>
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
      ) : !subscription || subscription.plan_id === FREE_PLAN_ID ? (
        <div className="flex justify-center">
          {userId && (
            <Button
              variant="default"
              className="text-base font-semibold"
              onClick={() => router.push(`/pricing/${userId}`)}
            >
              Pay to View
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
          {visibleVideos.map((vid) => (
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
