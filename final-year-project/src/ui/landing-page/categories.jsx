'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
    Brain,
  ChartBarIcon,
  Database,
  FilePlus,
  Fingerprint,
  GraduationCap,
  IdCard,
  MessageCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Features() {
  const [activeItem, setActiveItem] = useState('item-1')

  const images = {
    'item-1': {
      image: '/assets/images/img-categories.svg',
      alt: 'Database visualization',
    },
    'item-2': {
      image: '/assets/images/img-categories.svg',
      alt: 'Security authentication',
    },
    'item-3': {
      image: '/assets/images/img-categories.svg',
      alt: 'Identity management',
    },
    'item-4': {
      image: '/assets/images/img-categories.svg',
      alt: 'Analytics dashboard',
    },
  }

  return (
    <section id='Categories' className="bg-zinc-50 py-12 md:py-20 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-4xl font-semibold lg:text-6xl">A Learning Platform that inspires real growth</h2>
          <p>
            Dive into real-world exam simulations and explore the vibrant discussions happening daily. 
            These numbers show how our platform empowers you to master certifications and connect with a dynamic network of tech professionals.
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
                  <GraduationCap className="w-4 h-4" />
                  Certification Quizzes & Mock Exams
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Sharpen your knowledge and prepare for your certification exams with our extensive question bank and realistic, timed mock tests.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <Brain className="w-4 h-4" />
                  Adaptive Practice & Performance Insights
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Experience personalized learning as our quizzes adapt to your skill level, offering harder or easier questions based on your performance.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <MessageCircle className="w-4 h-4" />
                  Community Discussions
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Connect with a vibrant community of tech professionals. Create and reply to discussion threads on various certification topics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <FilePlus className="w-4 h-4" />
                  Resource Exchange 
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Easily share images, videos, and code snippets, and discover valuable content through our advanced search and tagging system. 
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
                  className="w-full h-full overflow-hidden rounded-xl border shadow-md"
                >
                  <Image
                    src={images[activeItem].image}
                    alt={images[activeItem].alt}
                    className="w-full h-full object-cover object-left-top"
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
  )
}
