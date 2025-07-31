"use client";

import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

export default function Interactions() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [bgColor, setBgColor] = useState("bg-white");

  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await SupabaseClient.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);


  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await SupabaseClient
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading comments", error);
      else setComments(data);
    };

    fetchComments();
  }, []);

  // Random bg
  useEffect(() => {
    const colors = [
      "bg-gray-50",
      "bg-blue-50",
      "bg-green-50",
      "bg-yellow-50",
      "bg-purple-50",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(randomColor);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data, error } = await supabase.from("comments").insert([
      {
        content: newComment,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Failed to post comment:", error);
    } else {
      setComments([{ ...data[0] }, ...comments]);
      setNewComment("");
    }
  };

  const handleLogin = async () => {
    const { error } = await SupabaseClient.auth.signInWithOAuth({
      provider: "google", // or 'github', 'discord', etc.
    });
    if (error) console.error("Login error", error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className={`${bgColor} min-h-screen`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🗣 Community Interactions
          </h1>
          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md"
            >
              Login
            </button>
          )}
        </div>

        {user && (
          <form onSubmit={handleSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Start a discussion, ask a question, or share a thought..."
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
            ></textarea>
            <button
              type="submit"
              className="mt-3 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
            >
              Post
            </button>
          </form>
        )}

        {!user && (
          <p className="italic text-gray-500">
            Please log in to post a comment.
          </p>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">
              No posts yet. Be the first to interact!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="text-gray-800 mb-2">{comment.content}</div>
                <div className="text-sm text-gray-500 text-right">
                  🕒 {new Date(comment.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
