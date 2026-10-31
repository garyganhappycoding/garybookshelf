import Link from "next/link";

// Shown instead of the question / result form when the visitor is not logged in.
export default function LoginWall({ next, what }: { next: string; what: string }) {
  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <div className="card text-center">
      <p className="text-3xl mb-2">🔑</p>
      <h2 className="text-lg font-medium mb-1">Log in to {what}</h2>
      <p className="text-sm text-ink/70 mb-4">
        You need a free account so you can come back and read my reply here on the website. It takes less than a minute.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href={`/login${q}`} className="btn-primary">Log in</Link>
        <Link href={`/signup${q}`} className="btn-secondary">Create a free account</Link>
      </div>
    </div>
  );
}
