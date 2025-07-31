"use client";

import { useEffect, useState } from "react";


export default function Interactions() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [bgColor, setBgColor] = useState("bg-white");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now(),
      content: newComment,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setComments([commentObj, ...comments]);
    setNewComment("");
  };

  return (
     <div className="{${bgColor} min-h-screen}">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🗣 Community Interactions
        </h1>

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
                  🕒 {comment.time}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}