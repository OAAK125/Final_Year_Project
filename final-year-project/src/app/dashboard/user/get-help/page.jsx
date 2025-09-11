"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GetHelp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <section className="scroll-py-16 py-5 md:scroll-py-32 md:py-5">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
            <div className="text-center lg:text-left space-y-3">
              <h2 className="text-3xl font-semibold md:text-4xl">Need Help?</h2>
              <p className="text-muted-foreground">
                We’ve Got You.{" "}
                <br className="lg:block block" />
                Explore common questions and find solutions below.
              </p>
            </div>

            <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
              <div className="pb-6">
                <h3 className="font-medium">How can I reset my password?</h3>
                <p className="text-muted-foreground mt-4">
                  Click on “Forgot Password” on the sign-in page. Enter your email and follow the link sent to reset your password.
                </p>
              </div>

              <div className="py-6">
                <h3 className="font-medium">Why can’t I access certain quizzes or content?</h3>
                <p className="text-muted-foreground mt-4">
                  Some quizzes are restricted to users who have completed prior assessments. Ensure you’ve completed all prerequisites.
                </p>
              </div>

              <div className="py-6">
                <h3 className="font-medium">How do I contact support?</h3>
                <p className="text-muted-foreground mt-4">
                  Reach us at <a href="mailto:certifycontact@gmail.com" className="text-primary underline">certifycontact@gmail.com</a>. We typically respond within 24 hours.
                </p>
              </div>

              <div className="py-6">
                <h3 className="font-medium">Can I delete my account and all data?</h3>
                <p className="text-muted-foreground mt-4">
                  Yes. Go to your account page and scroll to “Delete Account”. This action is irreversible.
                </p>
              </div>

              <div className="py-6">
                <h3 className="font-medium">How do I update my profile information?</h3>
                <p className="text-muted-foreground mt-4">
                  Go to your account page and click “Edit Profile” to change your name, avatar, or summary.
                </p>
              </div>

              <div className="py-6">
                <h3 className="font-medium">I didn’t receive a verification email. What now?</h3>
                <p className="text-muted-foreground mt-4">
                  Check your spam folder. If it’s still not there, click “Resend Email” or contact support to manually verify your account.
                </p>
              </div>

              <div className="py-6">
                <h3 className="font-medium">How do I become a contributor?</h3>
                <p className="text-muted-foreground mt-4">
                  Send an email to <a href="mailto:bugs@example.com" className="text-primary underline">bugs@example.com</a> applying with your credenitials. 
                </p>
              </div>

              <div className="py-6">
                <h3 className="font-medium">How do I report a bug or error?</h3>
                <p className="text-muted-foreground mt-4">
                  Send a message to <a href="mailto:bugs@example.com" className="text-primary underline">bugs@example.com</a> with details and screenshots if possible. We appreciate your help!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="my-8" />

      <section id="ContactUs" className="py-5 md:py-5">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-semibold lg:text-5xl">Get in Touch</h2>
            <p className="mt-4 text-gray-600">
              Have questions, feedback, or need assistance? We're here to help!
              Choose the method that works best for you.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-sm gap-6 text-center md:mt-16 md:max-w-4xl md:grid-cols-3">
            <Card className="group shadow-md">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Mail className="w-6 h-6" aria-hidden />
                </CardDecorator>
                <h3 className="mt-6 font-medium">Email</h3>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:certifycontact@gmail.com"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors hover:underline"
                >
                  certifycontact@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="group shadow-md">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <MapPin className="w-6 h-6" aria-hidden />
                </CardDecorator>
                <h3 className="mt-6 font-medium">Location</h3>
              </CardHeader>
              <CardContent>
                <a
                  href="https://maps.app.goo.gl/ic3Qwu2XejhaeCYJ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors hover:underline"
                >
                  KNUST Campus, Kumasi
                </a>
              </CardContent>
            </Card>

            <Card className="group shadow-md">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Phone className="w-6 h-6" aria-hidden />
                </CardDecorator>
                <h3 className="mt-6 font-medium">Phone</h3>
              </CardHeader>
              <CardContent>
                <a
                  href="tel:+233538123456"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors hover:underline"
                >
                  +233 (0) 538 123 456
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

const CardDecorator = ({ children }) => (
  <div className="relative mx-auto mb-2 h-16 w-16 rounded-full border bg-white flex items-center justify-center">
    {children}
  </div>
);
