import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
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
          <h1 className="text-xl font-semibold">Set a New Password</h1>
          <p className="text-sm text-muted-foreground">
            Create a new password to regain access to your account.
          </p>
        </div>

        {/* New Password Inputs */}
        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium">
              New Password
            </label>
            <Input id="password" type="password" name="password" required />
          </div>

          <div className="space-y-1">
            <label htmlFor="confirm-password" className="block text-sm font-medium">
              Confirm Password
            </label>
            <Input id="confirm-password" type="password" name="confirm-password" required />
          </div>

          <Button className="w-full" type="submit">
            Reset Password
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
