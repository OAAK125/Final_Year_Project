"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";

export function SiteHeader() {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (term) => {
    setSearch(term);
    if (!term) return setResults([]);

    const { data } = await supabase
      .from("certifications")
      .select("id, name")
      .ilike("name", `%${term}%`);

    setResults(data || []);
  };

  const handleSearchClick = (certId) => {
    router.push(`/quiz/${certId}?from=/dashboard`);
    setSearch("");
    setResults([]);
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Sidebar Trigger */}
        <SidebarTrigger className="-ml-1" />

        {/* Separator */}
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

        {/* Search Bar */}
        <div className="w-full max-w-xs relative">
          <Input
            type="search"
            placeholder="Search for certification..."
            className="h-8 w-full"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {results.length > 0 && (
            <div className="absolute mt-1 w-full bg-white shadow z-10 rounded border">
              {results.map((cert) => (
                <div
                  key={cert.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSearchClick(cert.id)}
                >
                  {cert.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
