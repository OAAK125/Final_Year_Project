"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud } from "lucide-react";
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
  const [joinedAt, setJoinedAt] = useState("");
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
      data: { avatar_url: data.publicUrl },
    });

    if (updateError) {
      console.error("Failed to update avatar in auth:", updateError);
    } else {
      setUser((prev) => ({ ...prev, avatar: data.publicUrl }));
    }
  };

  const handleDeleteAccount = async () => {
    setShowDialog(false);
    setIsDeleting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsDeleting(false);
        return;
      }

      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Failed to delete account", {
          status: res.status,
          body: txt,
        });
        setIsDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      window.location.href = "/";
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
