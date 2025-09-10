"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// ✅ Centralized plan IDs
const FREE_PLAN_ID = "c000440f-2269-4e17-b445-e1c4510504d8";
const STANDARD_PLAN_ID = "5623589a-885c-4ac1-8842-12247cadc89e";
const FULL_ACCESS_PLAN_ID = "3ed77a5b-3fde-4bf8-ae4d-7952ec8197b6";

export default function ResourceArticles() {
  const supabase = createClient();
  const router = useRouter();

  const [certifications, setCertifications] = useState([]);
  const [articles, setArticles] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch certifications + articles + user
      const [{ data: certData }, { data: artData }, { data: userData }] =
        await Promise.all([
          supabase.from("certifications").select("id, name"),
          supabase.from("articles").select("*"),
          supabase.auth.getUser(),
        ]);

      setCertifications(certData || []);

      if (userData?.user) {
        setUserId(userData.user.id);

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_id, certification_id")
          .eq("user_id", userData.user.id)
          .eq("status", "active")
          .maybeSingle();

        setSubscription(sub);
      }

      const transformed = (artData || []).map((article) => ({
        id: article.id,
        title: article.title,
        description: article.short_description || "No description provided.",
        certificationId: article.certification_id,
        certificationName:
          certData?.find((c) => c.id === article.certification_id)?.name ||
          "Unknown",
        image: article.image_url || "/assets/default-article.png",
        target_url: article.url,
        author: article.author || "Unknown Author",
        date: article.publication_date
          ? new Date(article.publication_date).toLocaleDateString()
          : "No date",
      }));

      setArticles(transformed);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading articles...</p>
      </div>
    );
  }

  // ✅ Decide which articles to show using plan_id
  let visibleArticles = [];
  if (!subscription) {
    visibleArticles = [];
  } else if (subscription.plan_id === FREE_PLAN_ID) {
    visibleArticles = [];
  } else if (subscription.plan_id === STANDARD_PLAN_ID) {
    if (subscription.certification_id) {
      visibleArticles = articles.filter(
        (a) => a.certificationId === subscription.certification_id
      );
    }
  } else if (subscription.plan_id === FULL_ACCESS_PLAN_ID) {
    visibleArticles = articles;
  }

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Articles</h2>
        {articles.length > 0 && (
          <a
            className="text-sm text-muted-foreground hover:underline hover:text-primary"
            href={"/dashboard/resource/articles"}
          >
            View All
          </a>
        )}
      </div>

      {/* Free users: show only pay button */}
      {!subscription || subscription.plan_id === FREE_PLAN_ID ? (
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
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {visibleArticles.slice(0, 3).map((article) => (
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
                  <div className="text-sm text-muted-foreground py-2">
                    {article.description}
                  </div>
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
