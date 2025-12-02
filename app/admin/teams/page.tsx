"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Team {
  id: string;
  team_id: string;
  name: string;
  coins: number;
  role: 'user' | 'admin';
  members?: number; // Not in DB yet, maybe remove or mock
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", teamId: "", password: "" });
  const [editingCoins, setEditingCoins] = useState<{ id: string; coins: number } | null>(null);
  const supabase = createClient();

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("*").order("created_at", { ascending: true });
    if (data) setTeams(data);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreate = async () => {
    if (!newTeam.name || !newTeam.teamId || !newTeam.password) return;

    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeam),
    });

    if (res.ok) {
      setIsCreating(false);
      setNewTeam({ name: "", teamId: "", password: "" });
      fetchTeams();
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/admin/teams?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchTeams();
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleUpdateCoins = async () => {
    if (!editingCoins) return;

    const res = await fetch("/api/admin/teams", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCoins),
    });

    if (res.ok) {
      setEditingCoins(null);
      fetchTeams();
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">팀 관리</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>+ 새 팀 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 팀 등록</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">팀 ID (로그인용)</label>
                <Input 
                  value={newTeam.teamId} 
                  onChange={(e) => setNewTeam({ ...newTeam, teamId: e.target.value })}
                  placeholder="team1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">팀 이름 (표시용)</label>
                <Input 
                  value={newTeam.name} 
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="멋쟁이 사자처럼"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">비밀번호</label>
                <Input 
                  type="password"
                  value={newTeam.password} 
                  onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">등록</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>팀 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>팀 ID</TableHead>
                <TableHead>팀명</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>보유 코인</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.team_id}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      team.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {team.role === 'admin' ? '관리자' : '일반 팀'}
                    </span>
                  </TableCell>
                  <TableCell>{team.coins.toLocaleString()} 코인</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingCoins({ id: team.id, coins: team.coins })}
                        >
                          코인 조정
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>코인 조정</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Input 
                            type="number"
                            value={editingCoins?.coins || 0}
                            onChange={(e) => setEditingCoins(prev => prev ? { ...prev, coins: parseInt(e.target.value) } : null)}
                          />
                          <Button onClick={handleUpdateCoins} className="w-full">저장</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(team.id)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
