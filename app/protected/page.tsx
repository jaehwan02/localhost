import { redirect } from "next/navigation";

export default function ProtectedPage() {
  // This page is deprecated - redirect to community
  redirect('/community');
}
