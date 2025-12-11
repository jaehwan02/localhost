"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductForm } from "@/components/admin/ProductForm";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const supabase = createClient();

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id");
    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (data: any) => {
    const { error } = await supabase.from("products").insert(data);
    if (error) throw error;
    setIsCreating(false);
    fetchProducts();
  };

  const handleUpdate = async (data: any) => {
    if (!editingProduct) return;
    const { error } = await supabase
      .from("products")
      .update(data)
      .eq("id", editingProduct.id);
    if (error) throw error;
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">상점 관리</h1>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || !!editingProduct}>
          상품 추가
        </Button>
      </div>

      {(isCreating || editingProduct) && (
        <div className="max-w-md mx-auto mb-8">
          <ProductForm
            initialData={editingProduct || undefined}
            onSubmit={editingProduct ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsCreating(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">이미지</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>재고</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="text-2xl">{product.image}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.price.toLocaleString()} 코인</TableCell>
                <TableCell>{product.stock}개</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                    disabled={isCreating || !!editingProduct}
                  >
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={isCreating || !!editingProduct}
                  >
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
