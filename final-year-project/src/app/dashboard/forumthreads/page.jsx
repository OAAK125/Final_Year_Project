"use client";

import { useEffect, useState } from "react";

export default function ForumThreads() {
  const [bgColor, setBgColor] = useState("bg-white");

  const threads = [
    {
      id: 1,
      title: "Best resources to study AWS?",
      author: "Kwame Mensah",
      replies: 5,
    },
    {
      id: 2,
      title: "How did you prepare for your Cloud Practitioner exam?",
      author: "Ama Boateng",
      replies: 8,
    },
    {
      id: 3,
      title: "What’s the difference between S3 and EBS?",
      author: "Yaw Owusu",
      replies: 2,
    },
  ];

  useEffect(() => {
    const colors = [
      "bg-gray-50",
      "bg-blue-50",
      "bg-green-50",
      "bg-yellow-50",
      "bg-purple-50",
    ];
    const random = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(random);
  }, []);

  return (
    <div className="{${bgColor} min-h-screen}">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🧵 Forum Threads</h1>
        <p className="text-gray-600 mb-6">Browse community questions and discussions.</p>

        <div className="space-y-4">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all border border-gray-200 p-4"
            >
              <h2 className="text-lg font-semibold text-green-700 mb-1">
                {thread.title}
              </h2>
              <div className="text-sm text-gray-600">
                Posted by <span className="font-medium">{thread.author}</span> · {thread.replies} replies
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}