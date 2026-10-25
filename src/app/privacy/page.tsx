import { Metadata } from "next";
import Link from "next/link";
import { Shield, EyeOff, HardDrive, Cookie, FileCheck, Mail, ArrowLeft, FileText, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how QuickTools protects your data with a privacy-first, client-side processing architecture.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors font-semibold"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4">
        Privacy Policy
      </h1>

      <p className="text-lg text-text-secondary mb-8 max-w-2xl">
        At QuickTools, privacy isn&apos;t an afterthought — it is the foundation of how our platform is engineered. We believe your data belongs solely to you.
      </p>

      {/* Core Principle Card */}
      <div className="neo-card p-8 mb-8 bg-surface">
        <div className="flex items-start gap-4">
          <div className="p-3 neo-border rounded-lg bg-bg shrink-0 text-accent">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-2">
              Our Core Privacy Guarantee
            </h2>
            <p className="text-text-secondary leading-relaxed">
              QuickTools operates primarily on a <strong>client-side architecture</strong>. Whenever you format JSON, convert colors, encode text, compress images, or use our utility tools, the computation takes place entirely inside your own browser. Your files, inputs, and outputs are <strong>never uploaded to our servers or stored in any database</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6 mb-8">
        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <EyeOff size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              1. Information We Do Not Collect
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed mb-3">
            Because our tools execute in your web browser:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
            <li>We do not collect, view, or retain text, code snippets, tokens, or files you input into any tool.</li>
            <li>We do not require user accounts, passwords, or personal identity verification.</li>
            <li>We do not sell, rent, or monetize your personal information or content.</li>
          </ul>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              2. Local Device Storage
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">
            QuickTools uses your browser&apos;s local storage (<code className="px-1.5 py-0.5 rounded bg-bg neo-border text-xs">localStorage</code>) solely to remember your UI preferences — such as your chosen theme (dark, light, or system) and your list of recently accessed tools for quick navigation. This data remains on your physical device and is never synchronized to external servers. You can clear this anytime through your browser settings.
          </p>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <Cookie size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              3. Analytics & Performance
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">
            We may use privacy-conscious, aggregate telemetry to measure site performance, page response times, and general tool popularity. These metrics are strictly anonymous, do not track you across other websites, and never contain inputs or outputs from your tool sessions.
          </p>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <FileCheck size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              4. External Links & Services
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">
            Our website may contain links to external sites, documentation, or specifications (such as W3C standards or open-source repositories). We are not responsible for the privacy practices or content of third-party websites. We encourage you to review their policies upon visiting.
          </p>
        </div>
      </div>

      {/* Related Pages Section */}
      <div className="neo-card p-8 mb-8">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">
          Related Information
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-4 py-2 neo-border rounded-lg bg-surface hover:bg-accent hover:text-white font-semibold text-sm transition-colors"
          >
            <Info size={16} /> About QuickTools &rarr;
          </Link>
          <Link
            href="/terms"
            className="inline-flex items-center gap-2 px-4 py-2 neo-border rounded-lg bg-surface hover:bg-accent hover:text-white font-semibold text-sm transition-colors"
          >
            <FileText size={16} /> Terms of Service &rarr;
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="neo-card p-8">
        <div className="flex items-center gap-3 mb-3">
          <Mail size={22} className="text-accent" />
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
            Questions Regarding Privacy?
          </h2>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          If you have questions about our privacy practices, security model, or client-side implementation, please reach out to our team at{" "}
          <a
            href="mailto:privacy@quicktools.app"
            className="text-accent hover:underline font-semibold"
          >
            privacy@quicktools.app
          </a>
          .
        </p>
        <p className="text-xs text-text-secondary mt-4">
          Last updated: October 2026
        </p>
      </div>
    </div>
  );
}
