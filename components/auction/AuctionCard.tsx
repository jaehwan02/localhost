"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Auction {
  id: number;
  item_name: string;
  start_price: number;
  end_time: string;
  status: string;
}

interface Bid {
  amount: number;
  team_id: string;
}

interface AuctionCardProps {
  auction: Auction;
  currentBid: number;
  highestBidder: string | null;
  userCoins: number;
  onBid: (amount: number) => Promise<void>;
}

export function AuctionCard({ auction, currentBid, highestBidder, userCoins, onBid }: AuctionCardProps) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isEnded, setIsEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.end_time).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("경매 종료");
        setIsEnded(true);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}분 ${seconds}초`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.end_time]);

  const handleBid = async () => {
    if (loading || isEnded) return;
    
    const amount = parseInt(bidAmount);
    if (isNaN(amount)) {
      alert("유효한 금액을 입력해주세요.");
      return;
    }

    if (amount <= currentBid) {
      alert(`현재 최고 입찰가(${currentBid})보다 높게 입력해야 합니다.`);
      return;
    }

    if (amount > userCoins) {
      alert("보유 코인이 부족합니다.");
      return;
    }

    setLoading(true);
    try {
      await onBid(amount);
      setBidAmount("");
    } catch (error: any) {
      console.error("Bid error:", error);
      alert(error.message || "입찰 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const minBid = currentBid + 10; // Minimum increment

  return (
    <Card className="w-full max-w-md mx-auto border-primary/50 bg-card/50 backdrop-blur-sm shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)]">
      <CardHeader className="text-center pb-2">
        <Badge variant="outline" className="w-fit mx-auto mb-2 border-primary text-primary animate-pulse">
          LIVE AUCTION
        </Badge>
        <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          {auction.item_name}
        </CardTitle>
        <div className="text-4xl font-black mt-4 font-mono">
          {timeLeft}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/30 p-6 rounded-xl text-center space-y-2">
          <p className="text-muted-foreground text-sm">현재 최고 입찰가</p>
          <div className="text-5xl font-bold text-primary">
            {currentBid.toLocaleString()} <span className="text-2xl">코인</span>
          </div>
          <p className="text-sm font-medium text-secondary">
            {highestBidder ? `By ${highestBidder}` : "입찰자 없음"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm px-1">
            <span>내 보유 코인: {userCoins.toLocaleString()}</span>
            <span>최소 입찰: {minBid.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="입찰 금액"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="text-lg h-12"
              disabled={isEnded}
            />
            <Button 
              size="lg" 
              className="h-12 px-8 font-bold"
              onClick={handleBid}
              disabled={loading || isEnded}
            >
              {loading ? "처리 중..." : "입찰하기"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
