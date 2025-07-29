import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"

export default function OtpVerificationPage() {
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
          <h1 className="text-xl font-semibold">Enter OTP Code</h1>
          <p className="text-sm text-muted-foreground">
            We’ve sent a 6-digit code to your email. Please enter it below.
          </p>
        </div>

        {/* OTP Input */}
        <div className="mt-6 space-y-4 text-center mx-10">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button className="w-full mt-4" type="submit">
            Verify Code
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-md border bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Didn’t get the code?{" "}
            <Link
              href="#"
              className="font-medium text-primary hover:underline"
            >
              Resend OTP
            </Link>
          </p>
        </div>
      </form>
    </section>
  )
}
