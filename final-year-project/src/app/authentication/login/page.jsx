import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuthenticationLoginPage() {
  return (
    <section className="flex min-h-screen bg-muted px-4 py-16 md:py-32">
      <form className="m-auto w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        {/* Logo and Title */}
        <div className="space-y-2 text-center">
            <Image
              src="/assets/authentication/logo-symbol.svg"
              alt="CertifyPrep Logo"
              width={48}
              height={48}s
              className="mx-auto"
            />
          <br />
          <h1 className="text-xl font-semibold">Sign In to CertifyPrep</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Sign in to continue.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
            <Image
              src="/assets/authentication/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
          </Button>

          <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
            <Image
              src="/assets/authentication/github.svg"
              alt="Github logo"
              width={20}
              height={20}
            />
          </Button>
        </div>

        <hr className="my-6" />

        {/* Email and Password Fields */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" name="email" required />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link href="#" className="text-sm text-muted-foreground hover:underline hover:text-primary">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" name="password" required />
          </div>

          <Button className="w-full" type="submit" href="/dashboard">
            Sign In
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-md border bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/authentication/signup" className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </section>
  )
}
