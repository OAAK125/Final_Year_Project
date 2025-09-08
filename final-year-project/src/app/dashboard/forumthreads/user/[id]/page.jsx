import UserProfile from "@/ui/forum/user-profile";

export default function UserPage({ params }) {
  return <UserProfile userId={params.id} />;
}