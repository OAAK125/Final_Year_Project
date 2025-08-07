"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function SiteHeader() {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, image, created_at, certifications(name, id)")
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: readData } = await supabase
        .from("notification_reads")
        .select("quiz_id")
        .eq("user_id", userId);

      const readIds = new Set(readData?.map((n) => n.quiz_id));

      const combined = quizzes.map((item) => ({
        ...item,
        read: readIds.has(item.id),
      }));

      setNotifications(combined);
      setUnreadCount(combined.filter((n) => !n.read).length);
    };
    fetchNotifications();
  }, [supabase]);

  const handleSearch = async (term) => {
    setSearch(term);
    if (!term) return setResults([]);

    const { data } = await supabase
      .from("certifications")
      .select("id, name")
      .ilike("name", `%${term}%`);

    setResults(data);
  };

  const markAllAsRead = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const unread = notifications.filter((n) => !n.read);
    const insertData = unread.map((n) => ({ user_id: userId, quiz_id: n.id }));

    if (insertData.length > 0) {
      await supabase.from("notification_reads").insert(insertData);
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (certId, quizId) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    await supabase.from("notification_reads").upsert({
      user_id: userId,
      quiz_id: quizId,
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === quizId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    router.push(`/quiz/${certId}`);
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
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
                  onClick={() => router.push(`/quiz/${cert.id}`)}
                >
                  {cert.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-96 max-w-sm">
              <div className="flex items-center justify-between px-2 pt-2">
                <DropdownMenuLabel>Notifications ({unreadCount})</DropdownMenuLabel>
                <button onClick={markAllAsRead} className="text-xs text-primary font-medium">
                  Mark all as read
                </button>
              </div>
              <DropdownMenuSeparator />
              {notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex gap-4 p-3 items-start cursor-pointer hover:bg-muted"
                  onClick={() => handleNotificationClick(item.certifications.id, item.id)}
                >
                  <div className="relative">
                    <img
                      src="/assets/authentication/logo-symbol.svg"
                      alt="Certify Prep"
                      className="w-6 h-6 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p>
                      <span className="font-bold">Certify Prep</span> released a new certification quiz {" "}
                      <span className="font-semibold">{item.certifications.name}</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      {!item.read && <span className="h-2 w-2 rounded-full bg-primary inline-block"></span>}
                      <span>{dayjs(item.created_at).fromNow()}</span>
                    </div>
                  </div>
                  <img
                    src={item.image}
                    alt="certification"
                    className="w-10 h-10 rounded border"
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
