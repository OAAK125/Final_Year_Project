"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Interactions() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [bgColor, setBgColor] = useState("bg-white");

  const supabase = createClient();

  // Get logged-in user once
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Load all comments
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at")
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading comments:", error);
      else setComments(data);
    };
    fetchComments();
  }, []);

  // Post a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          content: newComment,
          user_id: user.id,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Failed to post comment:", error.message);
    } else {
      const commentWithUser = {
        ...data,
        user: {
          email: user.email,
        },
      };
      setComments([commentWithUser, ...comments]);
      setNewComment("");
    }
  };

  // Random hover background
  const handleHover = () => {
    const colors = [
      "bg-gray-100",
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100",
      "bg-purple-100",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(randomColor);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        💬 Share Your Thoughts
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200"
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
          rows={4}
        ></textarea>

        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition"
        >
          🚀 Post Comment
        </button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-center">
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg shadow border ${bgColor} transition-colors duration-300`}
              onMouseEnter={handleHover}
            >
              <div className="text-gray-800 mb-2">{comment.content}</div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>✍️ {comment.user?.email || user?.email || "Anonymous"}</span>
                <span>
                  🕒{" "}
                  {new Date(comment.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
