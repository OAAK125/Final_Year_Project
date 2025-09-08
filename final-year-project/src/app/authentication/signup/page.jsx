"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ensureFreeSubscription } from "@/utils/ensureFreeSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function AuthenticationSignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !repassword) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{6,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must include at least one uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== repassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/authentication/auth-confirm`,
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const {
      data: { user: loggedInUser },
      error: signInError,
    } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Email not confirmed. Check your inbox to verify your account.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    const meta = loggedInUser.user_metadata || {};
    const provider = loggedInUser.app_metadata?.provider || "email";

    await supabase.from("profiles").upsert({
      id: loggedInUser.id,
      email: loggedInUser.email,
      full_name: meta.full_name || "",
      avatar_url: meta.avatar_url || "",
      provider,
    });

    // Ensure user has Free subscription
    await ensureFreeSubscription(loggedInUser.id);

    router.push("/dashboard");
  };

  const handleOAuthLogin = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      return;
    }
  };

  return (
    <section className="flex min-h-screen bg-muted px-4 py-16 md:py-32">
      <form
        onSubmit={handleSubmit}
        method="post"
        autoComplete="on"
        className="m-auto w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm"
      >
        <div className="space-y-2 text-center">
          <Image
            src="/assets/authentication/logo-symbol.svg"
            alt="CertifyPrep Logo"
            width={48}
            height={48}
            className="mx-auto"
          />
          <h1 className="text-xl font-semibold">Welcome to Certify Prep</h1>
          <p className="text-sm text-muted-foreground">Join us to continue.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            className="flex items-center justify-center gap-2"
            onClick={() => handleOAuthLogin("google")}
          >
            <Image
              src="/assets/authentication/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
          </Button>

          <Button
            variant="outline"
            type="button"
            className="flex items-center justify-center gap-2"
            onClick={() => handleOAuthLogin("github")}
          >
            <Image
              src="/assets/authentication/github.svg"
              alt="Github logo"
              width={20}
              height={20}
            />
          </Button>
        </div>

        <hr className="my-6" />

        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1 relative py-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-muted-foreground hover:cursor-pointer hover:text-primary"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="space-y-1 relative py-1">
            <label htmlFor="repassword" className="text-sm font-medium">
              Re-enter Password
            </label>
            <Input
              id="repassword"
              type={showRePassword ? "text" : "password"}
              name="repassword"
              autoComplete="new-password"
              required
              value={repassword}
              onChange={(e) => setRepassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-muted-foreground hover:cursor-pointer hover:text-primary"
              onClick={() => setShowRePassword((prev) => !prev)}
            >
              {showRePassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </div>

        <div className="mt-6 rounded-md border bg-muted p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/authentication/login"
              className="font-medium text-primary hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
        <p className="text-xs text-muted-foreground p-4 text-center">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </section>
  );
}
