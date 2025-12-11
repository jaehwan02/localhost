import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const PRODUCTS = [
  { id: 1, name: "에너지 드링크", price: 50, image: "⚡️" },
  { id: 2, name: "과자 박스", price: 100, image: "🍪" },
  { id: 3, name: "키보드 청소", price: 150, image: "🧹" },
  { id: 4, name: "멘토 호출권", price: 300, image: "🎫" },
  { id: 5, name: "침낭 대여", price: 500, image: "🛌" },
  { id: 6, name: "마사지건 사용", price: 200, image: "💆" },
];

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">상점</h1>
        <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
          <span className="text-xl">💰</span>
          <span className="font-bold text-secondary">1,250 코인</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:border-primary/50 transition-colors">
            <div className="aspect-square flex items-center justify-center bg-muted/50 text-6xl">
              {product.image}
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="font-bold text-secondary">{product.price} 코인</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" variant="outline">구매</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
