"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Auction {
  id: number;
  item_name: string;
  start_price: number;
  status: string;
  end_time: string;
}

export default function AdminAuctionPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [newAuction, setNewAuction] = useState({
    item_name: "",
    start_price: 0,
    duration_minutes: 10,
  });
  const supabase = createClient();

  const fetchAuctions = async () => {
    const { data } = await supabase
      .from("auctions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAuctions(data);
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-close all active auctions before creating a new one
    const { error: closeError } = await supabase
      .from("auctions")
      .update({ status: "completed" })
      .eq("status", "active");

    if (closeError) {
      console.error("Error closing active auctions:", closeError);
      alert(`기존 경매 종료 실패: ${closeError.message}`);
      return;
    }

    // Calculate end time
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + newAuction.duration_minutes);

    const { error } = await supabase.from("auctions").insert({
      item_name: newAuction.item_name,
      start_price: newAuction.start_price,
      end_time: endTime.toISOString(),
      status: "active",
    });

    if (error) {
      console.error("Auction creation error:", JSON.stringify(error, null, 2));
      alert(`경매 생성 실패: ${error.message || error.code || JSON.stringify(error)}`);
    } else {
      setNewAuction({ item_name: "", start_price: 0, duration_minutes: 10 });
      fetchAuctions();
      alert("새 경매가 시작되었습니다!");
    }
  };

  const handleStop = async (id: number) => {
    if (!confirm("경매를 종료하시겠습니까?")) return;

    const { error } = await supabase
      .from("auctions")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) alert("오류 발생");
    else fetchAuctions();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("경매를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    const { error } = await supabase
      .from("auctions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Auction deletion error:", error);
      alert(`삭제 실패: ${error.message}`);
    } else {
      fetchAuctions();
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">경매 관리</h1>

      {/* Create Auction */}
      <Card>
        <CardHeader>
          <CardTitle>새 경매 시작</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">물품명</label>
              <Input 
                value={newAuction.item_name}
                onChange={(e) => setNewAuction({ ...newAuction, item_name: e.target.value })}
                required 
              />
            </div>
            <div className="space-y-2 w-32">
              <label className="text-sm font-medium">시작가</label>
              <Input 
                type="number" 
                value={newAuction.start_price === 0 ? "" : newAuction.start_price}
                onChange={(e) => setNewAuction({ ...newAuction, start_price: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                placeholder="0"
                required 
              />
            </div>
            <div className="space-y-2 w-32">
              <label className="text-sm font-medium">진행 시간(분)</label>
              <Input 
                type="number" 
                value={newAuction.duration_minutes === 0 ? "" : newAuction.duration_minutes}
                onChange={(e) => setNewAuction({ ...newAuction, duration_minutes: e.target.value === "" ? 10 : parseInt(e.target.value) })}
                placeholder="10"
                required 
              />
            </div>
            <Button type="submit">경매 시작</Button>
          </form>
        </CardContent>
      </Card>

      {/* Auction List */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상태</TableHead>
              <TableHead>물품명</TableHead>
              <TableHead>시작가</TableHead>
              <TableHead>종료 시간</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auctions.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>
                  <Badge variant={auction.status === "active" ? "default" : "secondary"}>
                    {auction.status === "active" ? "진행 중" : "종료됨"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{auction.item_name}</TableCell>
                <TableCell>{auction.start_price} 코인</TableCell>
                <TableCell>{new Date(auction.end_time).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {auction.status === "active" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStop(auction.id)}
                      >
                        종료
                      </Button>
                    )}
                    {auction.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(auction.id)}
                      >
                        삭제
                      </Button>
                    )}
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
