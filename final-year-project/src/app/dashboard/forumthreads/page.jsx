"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  Clock,
  User,
  Pin,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import "@radix-ui/themes/styles.css";
import { Badge, Theme } from "@radix-ui/themes";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";



export default function ForumPage() {
  const supabase = createClient();
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newThread, setNewThread] = useState({
    title: "",
    content: "",
    category_id: "",
  });

  const threadsPerPage = 10;

  useEffect(() => {
    fetchUser();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [selectedCategory, sortBy, currentPage, searchQuery]);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("forum_categories")
      .select(`
      *,
      thread_count:forum_threads(count)
    `)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      return;
    }

    const categoriesWithCounts = data.map(cat => ({
      ...cat,
      thread_count: cat.thread_count[0]?.count || 0
    }));

    setCategories(categoriesWithCounts || []);
  };

  const fetchThreads = async () => {
    let query = supabase.from("forum_threads").select(
      `
        *,
        user:user_id (
        id,
        email,
        avatar_url
      ),
        category:category_id (id, name),
        posts:forum_posts (id),
        votes:forum_votes (id, type)
      `,
      { count: "exact" }
    );

    // Apply category filter
    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    // Apply sorting
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "popular") {
      query = query.order("view_count", { ascending: false });
    } else if (sortBy === "most_replies") {
      // This would need a different approach with a subquery
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    const from = (currentPage - 1) * threadsPerPage;
    const to = from + threadsPerPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching threads:", error);
      toast.error("Failed to load threads");
      return;
    }

    setThreads(data || []);
    setTotalPages(Math.ceil(count / threadsPerPage) || 1);
  };

  const handleCreateThread = async () => {
    if (
      !newThread.title.trim() ||
      !newThread.content.trim() ||
      !newThread.category_id
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a thread");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("forum_threads")
        .insert([
          {
            title: newThread.title,
            content: newThread.content,
            category_id: newThread.category_id,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating thread:", error);
        toast.error("Failed to create thread");
        return;
      }

      // Add the first post (which is the thread content)
      await supabase.from("forum_posts").insert([
        {
          content: newThread.content,
          thread_id: data.id,
          user_id: user.id,
        },
      ]);

      toast.success("Thread created successfully");
      setIsCreatingThread(false);
      setNewThread({ title: "", content: "", category_id: "" });
      fetchThreads(); // Refresh the thread list
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create thread");
    }
  };

  const handleVote = async (threadId, voteType) => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("forum_votes")
        .select("*")
        .eq("thread_id", threadId)
        .eq("user_id", user.id)
        .single();

      if (existingVote) {
        if (existingVote.type === voteType) {
          // Remove vote if same type clicked again
          await supabase.from("forum_votes").delete().eq("id", existingVote.id);
        } else {
          // Update vote if different type
          await supabase
            .from("forum_votes")
            .update({ type: voteType })
            .eq("id", existingVote.id);
        }
      } else {
        // Create new vote
        await supabase.from("forum_votes").insert([
          {
            thread_id: threadId,
            user_id: user.id,
            type: voteType,
          },
        ]);
      }

      fetchThreads(); // Refresh to update vote counts
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to register vote");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRepliesCount = (thread) => {
    // Subtract 1 because the first "post" is the thread content
    return (thread.posts?.length || 0);
  };

  const getUpvotes = (thread) => {
    return thread.votes?.filter((vote) => vote.type === "upvote").length || 0;
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl md:text-3xl font-bold">Community Forum</h1>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search threads..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Dialog open={isCreatingThread} onOpenChange={setIsCreatingThread}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Thread
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Thread</DialogTitle>
              <DialogDescription>
                Start a new discussion in the community forum
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Thread Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your thread"
                  value={newThread.title}
                  onChange={(e) =>
                    setNewThread({ ...newThread, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newThread.category_id}
                  onValueChange={(value) =>
                    setNewThread({ ...newThread, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your question or discussion topic here..."
                  rows={6}
                  value={newThread.content}
                  onChange={(e) =>
                    setNewThread({ ...newThread, content: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreatingThread(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateThread}>Create Thread</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - Categories */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <button
                  className={`w-full text-left px-4 py-2 rounded-none ${selectedCategory === "all"
                    ? "bg-muted font-medium"
                    : "hover:bg-muted/50"
                    }`}
                  onClick={() => setSelectedCategory("all")}
                >
                  All Topics
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`w-full text-left px-4 py-2 rounded-none flex justify-between items-center ${selectedCategory === category.id
                      ? "bg-muted font-medium"
                      : "hover:bg-muted/50"
                      }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {category.thread_count || 0}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="most_replies">Most Replies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Threads List */}
          <div className="space-y-4">
            {threads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No threads found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No threads match your search criteria"
                        : "Be the first to start a discussion in this category"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              threads.map((thread) => (
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {thread.is_pinned && (
                            <Pin className="h-4 w-4 text-yellow-500" />
                          )}
                          <Link href={`/dashboard/forumthreads/${thread.id}`} key={thread.id}>

                            <CardTitle className="text-lg hover:underline cursor-pointer">
                              {thread.title}
                            </CardTitle>
                          </Link>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Link href={`/dashboard/forumthreads/user/${thread.user?.id}`}>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {thread.user?.email || "Anonymous"}
                            </span>
                          </Link>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(thread.created_at)}
                          </span>
                          <span>•</span>
                          <Badge variant="outline">
                            {thread.category?.name}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleVote(thread.id, "upvote")}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{getUpvotes(thread)}</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{thread.content}</p>
                  </CardContent>
                  <CardFooter className="bg-muted/50 py-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{getRepliesCount(thread)} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{thread.view_count || 0} views</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && <span className="px-2">...</span>}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Add the missing Eye icon component
const Eye = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
