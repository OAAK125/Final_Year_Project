"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const categories = ["AWS", "Google Cloud", "Azure", "Kubernetes", "DevOps"];
const questionOptions = [5, 10, 15, 20, 25];
const timeOptions = [30, 60, 90, 120];

export default function PersonalizeTop() {
  const [selectedQuestions, setSelectedQuestions] = React.useState(10);
  const [selectedTime, setSelectedTime] = React.useState(60);
  const [includeMissed, setIncludeMissed] = React.useState("Yes");
  const [selectedCategory, setSelectedCategory] = React.useState("AWS");

  return (
    <section className="py-5 w-[50%] mx-auto text-center">
      <div className="flex flex-col items-center text-center border border-border rounded-xl p-4 md:rounded-xl lg:p-6">
        <h3 className="text-xl font-semibold">
          Personalize Your Quiz Experience
        </h3>
        <p className="text-sm my-2 text-muted-foreground">
          Tailor your quiz based on your goals and preferences.
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Take a Custom Quiz</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center mb-5">
                Quiz Configuration
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Category */}
              <div className="space-y-2 text-center">
                <p>Select Certification</p>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[40%] text-center mx-auto">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* No. of Questions */}
              <div className="space-y-2 text-center">
                <p>No. of Questions</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {questionOptions.map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-12 px-0",
                        selectedQuestions === q &&
                          "bg-primary text-background border-primary"
                      )}
                      onClick={() => setSelectedQuestions(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Select Time */}
              <div className="space-y-2 text-center">
                <p>Select Time (seconds)</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {timeOptions.map((t) => (
                    <Button
                      key={t}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-12 px-0",
                        selectedTime === t &&
                          "bg-primary text-background border-primary"
                      )}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Include Missed Dropdown */}
              <div className="space-y-2 text-center">
                <p>Include Previously Missed Questions?</p>
                <Select
                  value={includeMissed}
                  onValueChange={setIncludeMissed}
                >
                  <SelectTrigger className="w-[30%] text-center mx-auto">
                    <SelectValue placeholder="Yes or No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Quiz Button */}
              <div className="text-center pt-2">
                <Button className="w-full">Start Quiz</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
