"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ThumbsUp, MessageSquare, Clock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ThreadView({ threadId }) {
    const supabase = createClient();
    const [thread, setThread] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUser();
        fetchThread();
        fetchPosts();
    }, [threadId]);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchThread = async () => {
        const { data, error } = await supabase
            .from("forum_threads")
            .select(`
        *,
        user:user_id (
        id,
        email,
        avatar_url
      ),
        category:category_id (id, name)
      `)
            .eq("id", threadId)
            .single();

        if (error) {
            console.error("Error fetching thread:", error);
            toast.error("Failed to load thread");
            return;
        }

        setThread(data);

        // Increment view count
        await supabase
            .from("forum_threads")
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq("id", threadId);
    };

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from("forum_posts")
            .select(`
        *,
        user:user_id (
        id,
        email,
        avatar_url
      )
      `)
            .eq("thread_id", threadId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to load posts");
            return;
        }

        setPosts(data || []);
        setIsLoading(false);
    };

    const handleAddPost = async () => {
        if (!newPost.trim()) {
            toast.error("Please write a reply");
            return;
        }

        if (!user) {
            toast.error("You must be logged in to reply");
            return;
        }

        try {
            const { error } = await supabase
                .from("forum_posts")
                .insert([
                    {
                        content: newPost,
                        thread_id: threadId,
                        user_id: user.id,
                    },
                ]);

            if (error) {
                console.error("Error adding post:", error);
                toast.error("Failed to add reply");
                return;
            }

            toast.success("Reply added successfully");
            setNewPost("");
            fetchPosts(); // Refresh posts
            fetchThread(); // Update thread with new post count
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to add reply");
        }
    };

    const handleVote = async (postId, voteType) => {
        if (!user) {
            toast.error("You must be logged in to vote");
            return;
        }

        try {
            // Check if user already voted
            const { data: existingVote } = await supabase
                .from("forum_votes")
                .select("*")
                .eq("post_id", postId)
                .eq("user_id", user.id)
                .single();

            if (existingVote) {
                if (existingVote.type === voteType) {
                    // Remove vote if same type clicked again
                    await supabase
                        .from("forum_votes")
                        .delete()
                        .eq("id", existingVote.id);
                } else {
                    // Update vote if different type
                    await supabase
                        .from("forum_votes")
                        .update({ type: voteType })
                        .eq("id", existingVote.id);
                }
            } else {
                // Create new vote
                await supabase
                    .from("forum_votes")
                    .insert([
                        {
                            post_id: postId,
                            user_id: user.id,
                            type: voteType,
                        },
                    ]);
            }

            fetchPosts(); // Refresh to update vote counts
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading thread...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!thread) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Thread not found</h2>
                    <Link href="/dashboard/forumthreads">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forum
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            {/* Back button */}
            <Link href="/dashboard/forumthreads">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Forum
                </Button>
            </Link>

            {/* Thread Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-2">{thread.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <Link href={`/dashboard/forumthreads/user/${thread.user?.id}`}>
                                        <span>{thread.user?.email || "Anonymous"}</span></Link>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDate(thread.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{posts.length} {posts.length === 1 ? 'reply' : 'replies'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none">
                        <p>{thread.content}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Replies */}
            <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Replies</h2>
                {posts.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No replies yet</h3>
                                <p className="text-muted-foreground">
                                    Be the first to reply to this thread
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={post.user?.metadata?.avatar_url} />
                                        <AvatarFallback>
                                            {post.user?.email?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{post.user?.email || "Anonymous"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(post.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p>{post.content}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 py-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1"
                                    onClick={() => handleVote(post.id, "upvote")}
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{post.votes?.filter(vote => vote.type === "upvote").length || 0}</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            {/* Reply Form */}
            {user ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Post a Reply</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Write your reply here..."
                            rows={4}
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="mb-4"
                        />
                        <Button onClick={handleAddPost}>Post Reply</Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-4">
                            <p className="text-muted-foreground mb-4">
                                You must be logged in to reply to this thread
                            </p>
                            <Button>Log In</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}