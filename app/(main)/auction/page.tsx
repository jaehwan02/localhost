"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuctionCard } from "@/components/auction/AuctionCard";

interface Auction {
  id: number;
  item_name: string;
  start_price: number;
  end_time: string;
  status: string;
}

interface BidHistory {
  id: number;
  amount: number;
  created_at: string;
  teams: {
    name: string;
  };
}

export default function AuctionPage() {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([]);
  const supabase = createClient();

  const fetchAuctionData = async () => {
    // Fetch active auction (most recent one if multiple exist)
    const { data: auctionList, error } = await supabase
      .from("auctions")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("Auction fetch result:", { auctionList, error });

    if (error) {
      console.error("Error fetching auction:", error);
      setAuction(null);
      return;
    }

    const auctionData = auctionList?.[0] || null;

    if (auctionData) {
      setAuction(auctionData);

      // Fetch all bids for this auction (for history)
      const { data: allBids } = await supabase
        .from("bids")
        .select("id, amount, created_at, teams(name)")
        .eq("auction_id", auctionData.id)
        .order("amount", { ascending: false });

      if (allBids && allBids.length > 0) {
        // @ts-ignore
        setBidHistory(allBids);
        setCurrentBid(allBids[0].amount);
        // @ts-ignore
        setHighestBidder(allBids[0].teams?.name || "Unknown");
      } else {
        setBidHistory([]);
        setCurrentBid(auctionData.start_price);
        setHighestBidder(null);
      }
    } else {
      setAuction(null);
      setBidHistory([]);
    }

    // Fetch user coins
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: teamData } = await supabase
        .from("teams")
        .select("coins")
        .eq("id", user.id)
        .single();
      
      if (teamData) setUserCoins(teamData.coins);
    }
  };

  useEffect(() => {
    fetchAuctionData();

    // Realtime subscription for bids
    const channel = supabase
      .channel("realtime-auction")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids" },
        (payload) => {
          // Optimistically update or re-fetch
          // For simplicity and accuracy (getting bidder name), we re-fetch
          fetchAuctionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBid = async (amount: number) => {
    if (!auction) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { error } = await supabase.rpc("place_bid", {
      a_id: auction.id,
      t_id: user.id,
      bid_amount: amount,
    });

    if (error) throw error;
    
    // Success handled by realtime update
    alert("입찰에 성공했습니다!");
  };

  if (!auction) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="text-6xl">😴</div>
        <h2 className="text-2xl font-bold">현재 진행 중인 경매가 없습니다.</h2>
        <p className="text-muted-foreground">다음 경매를 기다려주세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-8 gap-6">
      <AuctionCard
        auction={auction}
        currentBid={currentBid}
        highestBidder={highestBidder}
        userCoins={userCoins}
        onBid={handleBid}
      />

      {/* Bid History */}
      {bidHistory.length > 0 && (
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📜</span> 입찰 기록
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {bidHistory.map((bid, index) => (
                <div
                  key={bid.id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    index === 0
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <span className="text-lg">👑</span>}
                    <div>
                      <p className="font-semibold">{bid.teams.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bid.created_at).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${index === 0 ? 'text-primary' : ''}`}>
                    {bid.amount.toLocaleString()} 코인
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
