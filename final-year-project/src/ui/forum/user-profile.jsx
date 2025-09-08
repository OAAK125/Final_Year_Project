"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { MessageSquare, ThumbsUp, Clock, User } from "lucide-react";
import Link from "next/link";

export default function UserProfile({ userId }) {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("threads");

  useEffect(() => {
    fetchUser();
    fetchUserThreads();
    fetchUserPosts();
  }, [userId]);

  const fetchUser = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    setUser(data);
  };

  const fetchUserThreads = async () => {
    const { data, error } = await supabase
      .from("forum_threads")
      .select(`
        *,
        category:category_id (name),
        posts:forum_posts (id)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user threads:", error);
      return;
    }

    setThreads(data || []);
  };

  const fetchUserPosts = async () => {
    const { data, error } = await supabase
      .from("forum_posts")
      .select(`
        *,
        thread:thread_id (id, title)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user posts:", error);
      return;
    }

    setPosts(data || []);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* User Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.username || user.email}</h1>
              <p className="text-muted-foreground">Member since {formatDate(user.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
        </TabsList>

        <TabsContent value="threads">
          <div className="space-y-4">
            {threads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No threads yet</h3>
                    <p className="text-muted-foreground">
                      This user hasn't created any threads
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              threads.map((thread) => (
                <Card key={thread.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/dashboard/forumthreads/${thread.id}`}>
                          <CardTitle className="text-lg hover:underline cursor-pointer">
                            {thread.title}
                          </CardTitle>
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(thread.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{thread.posts?.length || 0} replies</span>
                          </div>
                          {thread.category && (
                            <span className="bg-muted px-2 py-1 rounded-md text-xs">
                              {thread.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="replies">
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No replies yet</h3>
                    <p className="text-muted-foreground">
                      This user hasn't posted any replies
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/forum/thread/${post.thread.id}`}>
                          <CardTitle className="text-lg hover:underline cursor-pointer">
                            {post.thread.title}
                          </CardTitle>
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{post.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}