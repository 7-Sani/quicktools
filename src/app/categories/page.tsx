import Link from "next/link";
import { CATEGORIES } from "@/config/categories";
import { getLucideIcon } from "@/lib/icons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all tool categories on QuickTools — Image, PDF, Text, Developer, Calculator, Audio, Video, Security, Web, SEO, Design, File & Data, Date & Time, Finance & Business, QR & Barcode, Font & Typography, Network, Social Media, Education, Accessibility, and AI tools.",
};

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-2">
        Categories
      </h1>
      <p className="text-text-secondary mb-8">
        Browse tools by category.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => {
          const Icon = getLucideIcon(cat.icon);
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group neo-card p-8 neo-hover"
            >
              <div
                className="w-14 h-14 flex items-center justify-center neo-border rounded-lg mb-4"
                style={{ backgroundColor: cat.color + "15", color: cat.color }}
              >
                <Icon size={28} />
              </div>
              <h2 className="font-heading font-bold text-xl uppercase tracking-tight mb-2">
                {cat.name}
              </h2>
              <p className="text-text-secondary text-sm">
                {cat.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
