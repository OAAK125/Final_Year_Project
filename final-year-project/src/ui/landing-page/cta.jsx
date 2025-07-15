"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-semibold lg:text-5xl">
            Ready to Elevate Your Tech Career?
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Start Your Certification Journey Today
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/authentication/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
