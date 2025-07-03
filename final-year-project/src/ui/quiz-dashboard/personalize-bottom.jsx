"use client";

import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


export default function PersonalizeBottom() {
  const questions = [
    {
      certificate: "AWS Cloud Practitioner",
      question: "What is the shared responsibility model?",
    },
    {
      certificate: "Google Cloud Engineer",
      question: "Explain Cloud Functions vs Cloud Run.",
    },
    {
      certificate: "Azure Administrator",
      question: "How does Azure AD differ from AD DS?",
    },
    {
      certificate: "DevOps Engineer",
      question: "What is infrastructure as code?",
    },
    {
      certificate: "Kubernetes Admin",
      question: "Describe a deployment strategy.",
    },
    {
      certificate: "Security+",
      question: "What is a zero-day vulnerability?",
    },
    {
      certificate: "CompTIA Network+",
      question: "Explain subnetting with an example.",
    },
  ];

  return (
    <div className="mx-5">
      <div className="border border-border rounded-xl overflow-hidden flex flex-col justify-between">
        <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-items-normal gap-3">
          <h3 className="text-xl font-semibold">Frequently Missed Questions</h3>
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm max-w-xs">
              This is how it works.
            </PopoverContent>
          </Popover>
          </div>
          <Table>
            <TableCaption>A list of questions you often got wrong</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Marked as Understood</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold">{item.certificate}</TableCell>
                  <TableCell>
                      {item.question}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon">
                      <Check className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
