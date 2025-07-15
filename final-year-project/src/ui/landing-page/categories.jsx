"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Book, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Features() {
  const [activeItem, setActiveItem] = useState("item-1");

  const images = {
    "item-1": {
      image: "/assets/landing/img-quizzes.svg",
      alt: "Trending Quizzes",
    },
    "item-2": {
      image: "/assets/landing/img-topics.svg",
      alt: "Trending Topics",
    },
  };

  return (
    <section id="Categories" className="bg-zinc-50 py-12 md:py-20 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-4xl font-semibold lg:text-6xl">
            A Learning Platform that inspires real growth
          </h2>
          <p>
            Dive into real-world exam simulations and explore the vibrant
            discussions happening daily. These show how our platform empowers
            you to master certifications and connect with a dynamic network of
            tech professionals.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <Accordion
            type="single"
            value={activeItem}
            onValueChange={(value) => setActiveItem(value)}
            className="w-full"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <Book className="w-4 h-4" />
                  Certification Tests & Practice Topics
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Sharpen your skills and get exam-ready with our extensive
                collection of practice quizzes tailored to popular
                certifications like CompTIA, Cisco, and AWS. Dive deep into
                specific topics and master key concepts to ace your exams.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <MessageCircle className="w-4 h-4" />
                  Trending Forum Topics & Categories
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Engage with a vibrant community in our discussion forums,
                categorized by certification-realted questions and answers.
                Explore recent threads, trending discussions, and get answers to
                your questions from peers and experts
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="relative overflow-hidden rounded-2xl border p-2 bg-white">
            <div className="relative w-full aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain rounded-xl border shadow-md"
                >
                  <Image
                    src={images[activeItem].image}
                    alt={images[activeItem].alt}
                    className="w-full h-full object-contain object-left-top"
                    width={1207}
                    height={929}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
