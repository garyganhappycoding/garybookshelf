// The public address of the website, used in links inside emails and Telegram messages.
// NEXT_PUBLIC_SITE_URL is used when it holds a real address. If it is missing or still says "localhost" (easy to
// forget in Vercel), the address Vercel gives the project is used instead, so links never point at a developer's computer.
export function siteUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  const isLocal = !configured || /localhost|127\.0\.0\.1/.test(configured);
  if (!isLocal) return configured;

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.NODE_ENV === "production") return "https://garybookshelf-three.vercel.app";
  return configured || "http://localhost:3000"; // only when running on your own computer
}
