"use client";

import { useTransition } from "react";
import { deleteResource } from "@/actions/admin";

export default function DeleteResourceButton({ resourceId }: { resourceId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this item?")) {
          startTransition(() => deleteResource(resourceId));
        }
      }}
      disabled={isPending}
      className="text-sm text-red-600 font-medium disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}