import NextLink from "next/link";
import type { ComponentProps } from "react";

// Use THIS instead of "next/link" everywhere. Next.js normally loads the page behind every link on screen in the background,
// and each of those is a counted request on Vercel (the header alone would add 4 to every page view). Here it is off by default.
// To turn it on for one important link, write prefetch={true} on it.
export default function Link({ prefetch = false, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}
