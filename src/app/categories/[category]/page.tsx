import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CATEGORIES, CATEGORY_MAP } from "@/config/categories";
import { getToolsByCategory } from "@/config/tools";
import { ToolCard } from "@/components/ToolCard";
import Link from "next/link";
import { getLucideIcon } from "@/lib/icons";

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_MAP.get(category as never);

  if (!cat) return { title: "Category Not Found" };

  return {
    title: `${cat.name} — Free Online`,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = CATEGORY_MAP.get(category as never);

  if (!cat) {
    notFound();
  }

  const tools = getToolsByCategory(cat.id);
  const otherCategories = CATEGORIES.filter((c) => c.id !== cat.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-14 h-14 flex items-center justify-center neo-border rounded-lg shrink-0"
          style={{ backgroundColor: cat.color + "15", color: cat.color }}
        >
          {(() => {
            const Icon = getLucideIcon(cat.icon);
            return <Icon size={28} />;
          })()}
        </div>
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight">
            {cat.name}
          </h1>
          <p className="text-text-secondary mt-1">{cat.description}</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Other Categories */}
      <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">
        Other Categories
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherCategories.map((c) => {
          const Icon = getLucideIcon(c.icon);
          return (
            <Link
              key={c.id}
              href={`/categories/${c.id}`}
              className="neo-card p-4 neo-hover flex items-center gap-3"
            >
              <div
                className="w-10 h-10 flex items-center justify-center neo-border rounded-lg shrink-0"
                style={{ backgroundColor: c.color + "15", color: c.color }}
              >
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm uppercase">
                  {c.name}
                </h3>
                <p className="text-xs text-text-secondary">{c.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
