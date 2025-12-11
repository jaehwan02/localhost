"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
  userCoins: number;
  onPurchase: () => void;
}

export function ProductCard({ product, userCoins, onPurchase }: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleBuy = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("buy_product", {
        p_id: product.id,
        t_id: user.id,
      });

      if (error) throw error;

      alert("구매 성공!");
      onPurchase(); // Refresh parent data
    } catch (error: any) {
      console.error("Purchase error:", error);
      alert(error.message || "구매 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const canBuy = product.stock > 0 && userCoins >= product.price;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50">
      <div className="aspect-square bg-muted/20 flex items-center justify-center text-6xl">
        {product.image}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
            {product.stock > 0 ? `재고 ${product.stock}` : "품절"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {product.price} <span className="text-sm font-normal text-muted-foreground">코인</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleBuy} 
          disabled={!canBuy || loading}
          variant={canBuy ? "default" : "secondary"}
        >
          {loading ? "처리 중..." : product.stock === 0 ? "품절" : userCoins < product.price ? "코인 부족" : "구매하기"}
        </Button>
      </CardFooter>
    </Card>
  );
}
