'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQ() {
  const faqItems = [
    {
      id: 'item-1',
      question: 'Who is Certify Prep for?',
      answer:
        'Our platform is ideal for anyone pursuing a computer science certification – from beginners starting their tech journey to experienced professionals looking to validate their skills and network with peers.',
    },
    {
      id: 'item-2',
      question: 'What certifications do you offer mock exams for?',
      answer:
        'We offer extensive mock exams for leading international computer science certifications from providers like AWS, Microsoft Azure, Google Cloud, CompTIA, Cisco, Oracle, and more. Our catalog is constantly expanding!',
    },
    {
      id: 'item-3',
      question: 'What can I do in the community forum?',
      answer:
        'The forum is your space to ask questions, share knowledge, discuss certification topics, troubleshooting, career advice, and connect with a global community. You can create threads, reply to posts, and share images, videos, and code snippets.',
    },
    {
      id: 'item-4',
      question: 'How realistic are your mock exams? ',
      answer:
        " Our mock exams are meticulously designed to mirror the format, difficulty, and question types of actual certification exams. They include timed simulations and detailed explanations to ensure you're fully prepared.",
    },
    {
      id: 'item-5',
      question: 'Can I save my quiz progress and resume later?',
      answer:
        'Absolutely! Your quiz progress is automatically saved, allowing you to pause and resume your study sessions whenever its convenient for you.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-gray-600">
            Discover quick and comprehensive answers to common questions about our platform, services, and features.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <Accordion
            type="single"
            collapsible
            className="w-full rounded-2xl border px-6 py-4 shadow-sm bg-white"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b"
              >
                <AccordionTrigger className="text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 text-base">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
