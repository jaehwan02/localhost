"use client";
// Force rebuild

import { PlayerControl } from "@/components/admin/PlayerControl";

export default function AdminPlayerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">플레이어 관리</h1>
      <PlayerControl />
    </div>
  );
}
