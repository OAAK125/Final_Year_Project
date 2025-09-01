import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BookOpenText,
  BrainCircuit,
  Timer,
} from "lucide-react";

export default function Features() {
  return (
    <section
      id="Features"
      className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-semibold lg:text-5xl">
            Prepare Smarter: Your Ultimate Learning Hub
          </h2>
          <p className="mt-4 text-base text-zinc-600">
            Everything you need to ace your certifications and engage with a
            thriving tech community, all in one intuitive platform.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-sm divide-y overflow-hidden rounded-md shadow-md md:mt-16 md:max-w-4xl md:grid-cols-3 md:divide-y-0 md:divide-x">
          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Timer className="w-6 h-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Realistic Mock Exams</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Practice with timed, full-length simulations that mirror actual
                certification tests, ensuring you're exam-ready.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardDecorator>
                <BrainCircuit className="w-6 h-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Expert-Reviewed Questions</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                Every question is carefully reviewed by certified professionals
                to ensure accuracy, relevance, and up-to-date exam coverage.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardDecorator>
                <BookOpenText className="w-6 h-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Expansive Question Bank</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                Access thousands of high-quality questions across various
                certifications, topics, and difficulty levels.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }) => (
  <div className="relative mx-auto h-36 w-36 transition-colors duration-200">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)]"
    />
    <div
      aria-hidden
      className="absolute inset-0 bg-gradient-radial from-transparent to-zinc-50"
    />
    <div className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center border-t border-l border-zinc-200">
      {children}
    </div>
  </div>
);
