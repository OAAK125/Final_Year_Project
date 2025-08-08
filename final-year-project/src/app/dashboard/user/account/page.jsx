"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, Clock, UploadCloud } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState("");
  const [activity, setActivity] = useState({ certifications: 0, hours: 0 });
  const [joinedAt, setJoinedAt] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const fullName = user.user_metadata.full_name || "User";
      const avatar = user.user_metadata.avatar_url || "";
      const email = user.email;

      setUser({ id: user.id, name: fullName, avatar, email });
      setAvatarUrl(avatar);
      setName(fullName);
      setJoinedAt(new Date(user.created_at).toLocaleDateString());

      const { data: sessions } = await supabase
        .from("quiz_sessions")
        .select("ended_at, started_at, certification_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      const certIds = [
        ...new Set((sessions || []).map((s) => s.certification_id)),
      ];

      let totalMinutes = 0;
      const certs = [];

      for (const certId of certIds.slice(0, 3)) {
        const { data: cert } = await supabase
          .from("certifications")
          .select("id, name, duration_minutes")
          .eq("id", certId)
          .single();

        const { data: quiz } = await supabase
          .from("quizzes")
          .select("short_description, image")
          .eq("certification_id", certId)
          .limit(1)
          .single();

        const certObj = {
          id: cert.id,
          name: cert.name,
          duration_minutes: cert.duration_minutes,
          short_description: quiz?.short_description || "",
          image: quiz?.image || "",
        };

        certs.push(certObj);
      }

      for (const s of sessions || []) {
        const start = new Date(s.started_at);
        const end = new Date(s.ended_at);
        totalMinutes += Math.round((end - start) / 1000 / 60);
      }

      setCertifications(certs);
      setActivity({ certifications: certs.length, hours: totalMinutes });

      const { data: profile } = await supabase
        .from("profiles")
        .select("summary")
        .eq("id", user.id)
        .single();

      setSummary(profile?.summary || "");
      setLoading(false);
    };

    fetchUserData();
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      summary,
    });

    await supabase.auth.updateUser({
      data: { full_name: name, avatar_url: avatarUrl },
    });

    setUser((prev) => ({ ...prev, name, avatar: avatarUrl }));
    setIsEditing(false);
    setSuccess(true);
    setIsSaving(false);

    // hide success after a short delay
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      console.error("Failed to update avatar in auth:", updateError);
    } else {
      setUser((prev) => ({ ...prev, avatar: publicUrl }));
    }
  };

  const handleDeleteAccount = async () => {
    setShowDialog(false); // close dialog
    setIsDeleting(true); // show loading screen

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsDeleting(false);
        return;
      }

      // Call secure server-side route to delete all data + auth user
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const txt = await res.text(); // Grab the raw response in case it's not JSON
        console.error("Failed to delete account", {
          status: res.status,
          body: txt,
        });
        setIsDeleting(false);
        return;
      }

      // Sign out locally and redirect to landing page
      await supabase.auth.signOut();
      // This works for both localhost and your deployed Vercel site
      window.location.href = "/"; // or: router.push("/")
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  if (loading || isDeleting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <section className="py-5 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt={user.name} />
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current.click()}
                >
                  <UploadCloud className="w-4 h-4" />
                </Button>
              )}
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-semibold bg-transparent border-b focus:outline-none"
                />
              ) : (
                <h1 className="text-2xl font-semibold">{user.name}</h1>
              )}
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          {isEditing ? (
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit profile</Button>
          )}
        </div>

        {success && (
          <p className="text-green-600 text-sm mt-2">Changes saved!</p>
        )}

        <hr className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              {isEditing ? (
                <textarea
                  className="w-full min-h-[100px] border rounded-md p-3 text-sm"
                  value={summary}
                  maxLength={1000}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a short summary about yourself..."
                />
              ) : (
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {summary ||
                    "Create a delightful summary that will help users get to know you"}
                </p>
              )}
            </div>

            <div className="py-3 flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Completed Certifications
              </h2>
              <Link
                href="/dashboard/practice"
                className="text-primary text-sm font-medium hover:underline"
              >
                Explore
              </Link>
            </div>

            {certifications.length === 0 ? (
              <div className="text-sm text-muted-foreground border rounded-md p-6">
                You haven’t completed any certifications yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-border rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full aspect-video overflow-hidden">
                      <img
                        src={cert.image || "/assets/quiz/images.png"}
                        alt={cert.name}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        QUIZ
                      </p>
                      <h3 className="text-sm font-semibold leading-tight mt-1">
                        {cert.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {cert.short_description || "No description."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-border rounded-xl p-6 h-fit space-y-6">
            <h2 className="text-lg font-semibold">Your activity</h2>

            <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{activity.certifications} Completed Assessments</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{activity.hours} Minutes Spent</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-4">
              Joined on {joinedAt}
            </div>
          </div>
        </div>

        <hr className="my-8" />

        <div>
          <h2 className="text-lg font-semibold mb-2">Delete Account</h2>
          <div className="flex items-center justify-between mt-2">
            <p className="text-muted-foreground max-w-md text-sm">
              We’d hate to see you go, but you’re welcome to delete your account
              anytime. Just remember, once you delete it, it’s gone forever.
            </p>
            <Button
              variant="ghost"
              className="text-red-600 font-semibold"
              onClick={() => setShowDialog(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
            </DialogHeader>
            <div className="text-sm">
              <p>
                Click this button to delete your account and erase all of your
                personal data. You will lose your learning progress.{" "}
                <strong>Once completed this action cannot be undone.</strong>
              </p>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Erase Personal Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
