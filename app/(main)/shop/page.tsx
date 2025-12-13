import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const PRODUCTS = [
  { id: 1, name: "Energy Drink", price: 50, image: "⚡️" },
  { id: 2, name: "Snack Box", price: 100, image: "🍪" },
  { id: 3, name: "Keyboard Cleaning", price: 150, image: "🧹" },
  { id: 4, name: "Mentor Help Ticket", price: 300, image: "🎫" },
  { id: 5, name: "Sleeping Bag Rental", price: 500, image: "🛌" },
  { id: 6, name: "Massage Gun Usage", price: 200, image: "💆" },
];

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
          <span className="text-xl">💰</span>
          <span className="font-bold text-secondary">1,250 Coins</span>
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
              <p className="font-bold text-secondary">{product.price} Coins</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" variant="outline">Buy</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
