import { login } from "@/actions/auth";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-sm mx-auto px-5 py-20">
      <h1 className="text-2xl font-medium mb-6">Log in</h1>
      <form action={login} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" required className="w-full border border-ink/15 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input name="password" type="password" required className="w-full border border-ink/15 rounded-lg px-3 py-2" />
        </div>
        {params.error && (
          <p className="text-sm text-red-600">{params.error}</p>
        )}
        <button type="submit" className="btn-primary w-full">Log in</button>
      </form>
      <p className="text-sm text-ink/60 mt-4">
        No account yet?{" "}
        <Link href="/signup" className="text-clay-600 font-medium">Sign up</Link>
      </p>
    </div>
  );
}