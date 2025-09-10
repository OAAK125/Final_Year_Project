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

export default function ArticlePage() {
  const supabase = createClient();
  const router = useRouter();

  const [articles, setArticles] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


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
    const fetchArticles = async () => {
      setIsLoading(true);

      let query = supabase.from("articles").select("*");

      // filter by certificationType
      if (filters.certificationType) {
        query = query.eq("certification_type_id", filters.certificationType);
      }

      // filter by topic
      if (filters.topic) {
        query = query.eq("topic_id", filters.topic);
      }

      const [{ data: certData }, { data: artData }] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        query,
      ]);

      const transformed = (artData || []).map((article) => ({
        id: article.id,
        title: article.title,
        description: article.short_description || "No description provided.",
        author: article.author || "Unknown Author",
        date: article.publication_date
          ? new Date(article.publication_date).toLocaleDateString()
          : "Unknown Date",
        certificationId: article.certification_id,
        certificationName:
          certData?.find((c) => c.id === article.certification_id)?.name ||
          "Unknown",
        image: article.image_url || "/assets/default-article.png",
        target_url: article.url,
      }));

      setArticles(transformed);
      setIsLoading(false);
    };

    fetchArticles();
  }, [filters, supabase]);

  // filtered view based on subscription using plan_id
  const getVisibleArticles = () => {
    if (!subscription) return [];

    if (subscription.plan_id === FREE_PLAN_ID) return [];

    if (subscription.plan_id === STANDARD_PLAN_ID) {
      return articles.filter(
        (a) => a.certificationId === subscription.certification_id
      );
    }

    if (subscription.plan_id === FULL_ACCESS_PLAN_ID) {
      return articles;
    }

    return [];
  };

  const visibleArticles = getVisibleArticles();

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Articles</h2>
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
          {visibleArticles.map((article) => (
            <a
              key={article.id}
              href={article.target_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted"
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Article
                  </p>
                  <h3 className="text-lg font-semibold">{article.title}</h3>
                  <p className="text-sm text-muted-foreground py-2">
                    {article.description}
                  </p>
                  <p className="pt-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {article.author} • {article.date}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground pt-2 font-bold">
                  Certification: {article.certificationName}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
