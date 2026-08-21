"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/actions/admin";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this product? This can't be undone.")) {
          startTransition(() => deleteProduct(productId));
        }
      }}
      disabled={isPending}
      className="text-sm text-red-600 font-medium disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
