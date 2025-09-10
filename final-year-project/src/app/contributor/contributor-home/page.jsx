"use client"

import React from "react"

export default function ContributorHome() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10">
      <h1 className="text-3xl font-bold text-primary">Welcome to the Contributor Dashboard</h1>
      <p className="mt-4 text-muted-foreground text-center max-w-xl">
        From here you can generate quizzes and review questions
        Use the sidebar to navigate through the contributor tools.
      </p>
    </div>
  )
}
