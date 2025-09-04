"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ArticlePage() {
  const supabase = createClient();

  const [articles, setArticles] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

      // ✅ fetch certs + articles
      const [{ data: certData }, { data: artData }] = await Promise.all([
        supabase.from("certifications").select("id, name"),
        supabase.from("articles").select("*"),
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

    fetchData();
  }, [supabase]);

  // ✅ filtered view based on subscription
  const getVisibleArticles = () => {
    if (!subscription || subscription.plans?.name === "Free") return []; // free sees nothing
    if (subscription.plans?.name === "Standard") {
      return articles.filter(
        (a) => a.certificationId === subscription.certification_id
      );
    }
    return articles; // All-Access sees everything
  };

  const visibleArticles = getVisibleArticles();

  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Articles</h2>
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
