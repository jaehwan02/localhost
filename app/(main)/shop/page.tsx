"use client";

import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/shop/ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const supabase = createClient();

  const fetchData = async () => {
    // Fetch products
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("id");
    
    if (productsData) setProducts(productsData);

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
    fetchData();
    
    // Subscribe to product changes for realtime stock updates
    const channel = supabase
      .channel("realtime-shop")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">상점</h1>
        <div className="text-xl font-bold text-primary">
          보유 코인: {userCoins.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            userCoins={userCoins}
            onPurchase={fetchData}
          />
        ))}
      </div>
    </div>
  );
}
