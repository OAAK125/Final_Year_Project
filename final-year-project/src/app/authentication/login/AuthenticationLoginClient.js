// /app/authentication/login/AuthenticationLoginClient.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function AuthenticationLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ safe now, because this is a client component
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      if (loginError.message.toLowerCase().includes("email not confirmed")) {
        setError("Email not confirmed. Check your inbox to verify your account.");
      } else {
        setError(loginError.message);
      }
      return;
    }

    if (data?.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile role:", profileError);
        setError("Unable to fetch user role. Redirecting to dashboard...");
        router.push("/dashboard");
        return;
      }

      const redirectTo = searchParams.get("redirect");

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      // Role-based redirect
      if (profile?.role === "admin") router.push("/admin");
      else if (profile?.role === "contributor") router.push("/contributor");
      else if (profile?.role === "student") router.push("/");
      else router.push("/dashboard");
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) setError(error.message);
  };

  return (
    <section className="flex min-h-screen bg-muted px-4 py-16 md:py-32">
      <form
        onSubmit={handleLogin}
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
          <h1 className="text-xl font-semibold">Sign In to CertifyPrep</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Sign in to continue.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            className="flex items-center justify-center gap-2"
            onClick={() => handleOAuthLogin("google")}
            disabled={loading}
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
            disabled={loading}
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
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1 relative py-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/authentication/forgot-password"
                className="text-sm text-muted-foreground hover:underline hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-[38px] text-muted-foreground hover:cursor-pointer hover:text-primary"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Logging In..." : "Log In"}
          </Button>
        </div>

        <div className="mt-6 rounded-md border bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/authentication/signup"
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}
