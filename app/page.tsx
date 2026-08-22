import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import ResourceCategoryAccordion from "@/components/ResourceCategoryAccordion";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  const contentHub = resources?.filter((r) => r.type === "content_hub") || [];
  const freeResources = resources?.filter((r) => r.type === "free_resource") || [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      {/* HERO */}
      <section className="bg-cream-200">
        <div className="max-w-5xl mx-auto px-5 py-20 flex flex-col sm:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="text-clay-700 text-sm mb-2">@gary_bookshelf &middot; 45k+ students</p>
            <h1 className="text-3xl sm:text-4xl font-medium text-ink max-w-xl mb-4">
              Hi, I'm Gary — I turn messy study habits into systems that work
            </h1>
            <p className="text-ink/70 max-w-lg mb-6 leading-relaxed">
              Notes, resources, and tools I've built while studying my way through
              SPM, matriculation, and beyond.
            </p>
            <div className="flex gap-3">
              <Link href="/shop" className="btn-primary">Browse my notes</Link>
              <Link href="#resources" className="btn-secondary">See free resources</Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gary-4-flat-achievement.jpg"
              alt="Gary holding his 4.00 flat matriculation achievement award"
              className="w-56 sm:w-64 rounded-2xl border border-ink/10 shadow-sm object-cover"
            />
          </div>
        </div>
      </section>

      {/* CONTENT HUB */}
      <section id="content-hub" className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="text-xl font-medium mb-1">Content hub</h2>
        <p className="text-ink/60 mb-6">Study tips and studygram highlights</p>
        <ResourceCategoryAccordion resources={contentHub} variant="content" />
      </section>

      {/* FREE RESOURCES */}
      <section id="resources" className="bg-white border-y border-ink/10">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <h2 className="text-xl font-medium mb-1">Free resources</h2>
          <p className="text-ink/60 mb-6">Sample notes and templates, no charge</p>
          <ResourceCategoryAccordion resources={freeResources} variant="free" />
        </div>
      </section>

      {/* SHOP PREVIEW */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium mb-1">From the shop</h2>
            <p className="text-ink/60">Full notes and the upcoming course</p>
          </div>
          <Link href="/shop" className="text-clay-600 text-sm font-medium">View all &rarr;</Link>
        </div>
        {products && products.length > 0 ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-ink/50 text-sm">Products will show up here once you add them in /admin.</p>
        )}
      </section>

      {/* BUILT BY ME */}
      <section id="built-by-me" className="bg-white border-y border-ink/10">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <h2 className="text-xl font-medium mb-1">Built by me</h2>
          <p className="text-ink/60 mb-6">Apps and tools I've built as a solo developer</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "10Vocab",
                description: "Learn 10 new vocabulary words a day.",
                url: "https://vocab-app-nine-kappa.vercel.app/",
              },
            ].map((project) => (
              <a
                key={project.title}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card block hover:border-clay-400 transition-colors"
              >
                <p className="font-medium mb-1">{project.title}</p>
                <p className="text-sm text-ink/60">{project.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="text-xl font-medium mb-3">About</h2>
        <p className="text-ink/70 max-w-2xl leading-relaxed">
          I'm Gary — a student and the person behind @gary_bookshelf, where I share
          study systems with 45,000+ students. Outside of content, I build apps
          and websites. This site is where my notes, free resources, and projects
          all live in one place.
        </p>
      </section>
    </div>
  );
}
