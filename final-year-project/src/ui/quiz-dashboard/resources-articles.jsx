"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResourceArticles() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [{ data: certData, error: certError }, { data: artData, error: artError }] =
        await Promise.all([
          supabase.from("certifications").select("id, name"),
          supabase.from("articles").select("*"),
        ]);

      if (certError) console.error("Error fetching certifications:", certError);
      if (artError) console.error("Error fetching articles:", artError);

      setCertifications(certData || []);
      const transformed = (artData || []).map((article) => ({
        id: article.id,
        title: article.title,
        description: article.short_description || "No description provided.",
        certificationName:
          certData?.find((c) => c.id === article.certification_id)?.name || "Unknown",
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
  }, []);

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

      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
        {articles.slice(0, 3).map((article) => (
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
    </section>
  );
}
