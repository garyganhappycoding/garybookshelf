import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewProductForm from "@/components/NewProductForm";
import DeleteProductButton from "@/components/DeleteProductButton";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">Products</h1>

      <NewProductForm />

      <div className="mt-10 space-y-3">
        {products?.map((p) => (
          <div key={p.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-ink/60">RM {Number(p.price_myr).toFixed(2)} &middot; {p.category}</p>
            </div>
            <DeleteProductButton productId={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
