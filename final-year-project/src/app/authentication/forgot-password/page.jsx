import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  return (
    <section className="flex min-h-screen bg-muted px-4 py-16 md:py-32">
      <form className="m-auto w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        {/* Logo and Title */}
        <div className="space-y-2 text-center">
          <Image
            src="/assets/authentication/logo-symbol.svg"
            alt="CertifyPrep Logo"
            width={48}
            height={48}
            className="mx-auto"
          />
          <br />
          <h1 className="text-xl font-semibold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        {/* Email Input */}
        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" name="email" required />
          </div>

          <Button className="w-full" type="submit">
            Send Reset Link
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-md border bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/authentication/login" className="font-medium text-primary hover:underline">
              Go back to login
            </Link>
          </p>
        </div>
      </form>
    </section>
  )
}
