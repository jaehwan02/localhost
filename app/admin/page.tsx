"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState({
    teamCount: 0,
    activeAuctions: 0,
    pendingMedia: 0,
    totalTransactions: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { count: teamCount } = await supabase.from("teams").select("*", { count: "exact", head: true });
      const { count: activeAuctions } = await supabase.from("auctions").select("*", { count: "exact", head: true }).eq("status", "active");
      const { count: pendingMedia } = await supabase.from("media_queue").select("*", { count: "exact", head: true }).eq("status", "pending");
      const { count: totalTransactions } = await supabase.from("transactions").select("*", { count: "exact", head: true });

      setStats({
        teamCount: teamCount || 0,
        activeAuctions: activeAuctions || 0,
        pendingMedia: pendingMedia || 0,
        totalTransactions: totalTransactions || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">대시보드</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 팀 수</CardTitle>
            <div className="text-2xl">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중인 경매</CardTitle>
            <div className="text-2xl">🔨</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAuctions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중인 요청</CardTitle>
            <div className="text-2xl">🎵</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMedia}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 거래 수</CardTitle>
            <div className="text-2xl">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/teams">팀 및 코인 관리</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/shop">상점 물품 관리</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/auction">새 경매 시작</Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>TTS 플레이어</span>
              <span className="text-success font-bold">온라인</span>
            </div>
            <div className="flex justify-between items-center">
              <span>뮤직 플레이어</span>
              <span className="text-success font-bold">재생 중</span>
            </div>
            <div className="flex justify-between items-center">
              <span>데이터베이스</span>
              <span className="text-success font-bold">연결됨</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
