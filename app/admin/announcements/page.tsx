"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "normal",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const supabase = createClient();

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("announcements").insert({
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      is_active: true,
    });

    if (error) {
      console.error("Announcement creation error:", error);
      alert(`공지사항 생성 실패: ${error.message}`);
    } else {
      setNewAnnouncement({ title: "", content: "", priority: "normal" });
      fetchAnnouncements();
      alert("공지사항이 생성되었습니다!");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) alert("오류 발생");
    else fetchAnnouncements();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("공지사항을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Announcement deletion error:", error);
      alert(`삭제 실패: ${error.message}`);
    } else {
      fetchAnnouncements();
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">긴급</Badge>;
      case 'important':
        return <Badge variant="default">중요</Badge>;
      default:
        return <Badge variant="secondary">일반</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">공지사항 관리</h1>

      {/* Create Announcement */}
      <Card>
        <CardHeader>
          <CardTitle>새 공지사항 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">제목</label>
              <Input
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">내용</label>
              <Textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">우선순위</label>
              <Select
                value={newAnnouncement.priority}
                onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">일반</SelectItem>
                  <SelectItem value="important">중요</SelectItem>
                  <SelectItem value="urgent">긴급</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">공지사항 게시</Button>
          </form>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>우선순위</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>내용</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell>
                  {getPriorityBadge(announcement.priority)}
                </TableCell>
                <TableCell>
                  <Badge variant={announcement.is_active ? "default" : "outline"}>
                    {announcement.is_active ? "활성" : "비활성"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{announcement.title}</TableCell>
                <TableCell className="max-w-xs truncate">{announcement.content}</TableCell>
                <TableCell>{new Date(announcement.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                    >
                      {announcement.is_active ? "비활성화" : "활성화"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
