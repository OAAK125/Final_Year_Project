"use client"

import React from "react"

export default function AdminHome() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10">
      <h1 className="text-3xl font-bold text-primary">Welcome to the Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground text-center max-w-xl">
        From here you can manage certifications, generate quizzes, review questions, 
        manage users, and handle contributor access. 
        Use the sidebar to navigate through the admin tools.
      </p>
    </div>
  )
}
