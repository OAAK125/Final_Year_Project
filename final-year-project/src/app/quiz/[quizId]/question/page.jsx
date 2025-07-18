"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Flag, Timer } from "lucide-react"

export default function QuizQuestionUI() {
  const [progress, setProgress] = useState(4) // for example, 4% progress
  const [selected, setSelected] = useState(null)
  const options = [
    "To animate and add interactive elements to a design",
    "To collaborate with team members on a design project",
    "To organize and manage design assets",
    "To create high-fidelity mockups for user testing"
  ]

  return (
    <div className="max-w-3xl mx-auto min-h-screen p-6 flex flex-col justify-between">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button 
        className=" p-1 text-black" 
        variant="ghost"
        size=""> 
          <X className="w-10 h-10" />
        </Button>
        <Progress value={progress} className="flex-1 mx-4 h-2 bg-gray-200" />
        <div className="flex items-center gap-2 text-sm font-medium text-black">
          <span>1/25</span>
          <Button variant="ghost" className="p-1 mx-1">
          <Flag className="w-4 h-4 text-black" />
          </Button>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">
          What is the purpose of Figma's "Prototype" feature?
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {options.map((option, index) => (
          <Card
            key={index}
            onClick={() => setSelected(index)}
            className={`cursor-pointer px-4 py-3 border rounded-xl text-left text-base hover:bg-gray-100 ${
              selected === index ? "border-primary text-primary shadow" : ""
            }`}
          >
            {option}
          </Card>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-center border-t pt-4">
        {/* Timer */}
        <div className="flex items-center text-gray-700 text-sm">
          <span className="text-lg mr-1 mx-2"><Timer></Timer></span>
          <span>00:24:21</span>
        </div>

        {/* I don't know */}
        <Button variant="outline" className="rounded-xl">
          I don’t know
        </Button>
      </div>
    </div>
  )
}
