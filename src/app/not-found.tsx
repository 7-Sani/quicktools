import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <h1 className="font-heading text-6xl font-bold uppercase tracking-tight mb-4">
        404
      </h1>
      <p className="text-xl text-text-secondary mb-8">
        This page doesn&apos;t exist. Maybe the tool you&apos;re looking for has a
        different name?
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/tools" className="neo-btn neo-btn-primary">
          <Search size={16} />
          Browse All Tools
        </Link>
        <Link href="/" className="neo-btn neo-btn-secondary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
