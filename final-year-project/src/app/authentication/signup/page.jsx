import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuthenticationSignupPage() {
  return (
    <section className="flex min-h-screen bg-muted px-4 py-16 md:py-32">
      <form className="m-auto w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        {/* Logo and Title */}
        <div className="space-y-2 text-center">
          <Link href="/" aria-label="Go home">
            <Image
              src="/assets/logos/logo-symbol.svg"
              alt="CertifyPrep Logo"
              width={48}
              height={48}
              className="mx-auto"
            />
          </Link>
          <br />
          <h1 className="text-xl font-semibold">Welcome to Certify Prep</h1>
          <p className="text-sm text-muted-foreground">
            Join us to continue.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
            <Image
              src="/assets/logos/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
          </Button>

          <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
            <Image
              src="/assets/logos/apple.svg"
              alt="Apple logo"
              width={20}
              height={20}
            />
          </Button>

          <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
            <Image
              src="/assets/logos/github-s.svg"
              alt="Github logo"
              width={20}
              height={20}
            />
          </Button>
        </div>

        <hr className="my-6" />

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" name="email" required />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input id="password" type="password" name="password" required />
          </div>

          <div className="space-y-1">
            <label htmlFor="repassword" className="text-sm font-medium">
              Re-enter Password
            </label>
            <Input id="repassword" type="password" name="repassword" required />
          </div>

          <Button className="w-full" type="submit">
            Sign Up
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-md border bg-muted p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/authentication/login" className="font-medium text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
        <p className="text-xs text-muted-foreground p-4 text-center">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>.
          </p>
      </form>
    </section>
  )
}
