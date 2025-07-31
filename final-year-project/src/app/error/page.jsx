'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ErrorPage() {
  const router = useRouter()

  return (
    <section className="flex min-h-screen items-center justify-center bg-muted px-4 py-16 text-center">
      <div className="max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex justify-center">
          <Image
            src="/assets/authentication/logo-symbol.svg"
            alt="CertifyPrep Logo"
            width={48}
            height={48}
          />
        </div>

        <h1 className="text-2xl font-semibold text-destructive">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          We're sorry, an unexpected error occurred. Please try again later or return to the landing page.
        </p>

        <div className="pt-4">
          <Button onClick={() => router.push('/')} variant="default">
            Go to Homepage
          </Button>
        </div>
      </div>
    </section>
  )
}
