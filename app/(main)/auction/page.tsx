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

export default function AuctionPage() {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const supabase = createClient();

  const fetchAuctionData = async () => {
    // Fetch active auction
    const { data: auctionData } = await supabase
      .from("auctions")
      .select("*")
      .eq("status", "active")
      .single();

    if (auctionData) {
      setAuction(auctionData);
      
      // Fetch highest bid for this auction
      const { data: bidData } = await supabase
        .from("bids")
        .select("amount, teams(name)")
        .eq("auction_id", auctionData.id)
        .order("amount", { ascending: false })
        .limit(1)
        .single();

      if (bidData) {
        setCurrentBid(bidData.amount);
        // @ts-ignore
        setHighestBidder(bidData.teams?.name || "Unknown");
      } else {
        setCurrentBid(auctionData.start_price);
        setHighestBidder(null);
      }
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-8">
      <AuctionCard
        auction={auction}
        currentBid={currentBid}
        highestBidder={highestBidder}
        userCoins={userCoins}
        onBid={handleBid}
      />
    </div>
  );
}
