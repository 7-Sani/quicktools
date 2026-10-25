import { Metadata } from "next";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, Mail, ArrowLeft, Shield, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for utilizing QuickTools online tools and services.",
};

export default function TermsPage() {
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
        Terms of Service
      </h1>

      <p className="text-lg text-text-secondary mb-8 max-w-2xl">
        By accessing or using QuickTools, you agree to be bound by these terms. Please review them carefully before using our platform.
      </p>

      {/* Summary Card */}
      <div className="neo-card p-8 mb-8 bg-surface">
        <div className="flex items-start gap-4">
          <div className="p-3 neo-border rounded-lg bg-bg shrink-0 text-accent">
            <Scale size={28} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-2">
              Agreement Overview
            </h2>
            <p className="text-text-secondary leading-relaxed">
              QuickTools provides a suite of web-based utilities and developer tools free of charge. Our mission is to keep tools fast, accessible, and client-side without registration walls. Use of our services is conditioned upon your compliance with these Terms.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 mb-8">
        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              1. Permitted Use
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm mb-3">
            You may use QuickTools for personal, educational, and commercial workflows, subject to the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
            <li>You agree not to use the tools for unlawful, malicious, or fraudulent activities.</li>
            <li>You agree not to disrupt, bypass, or attempt to compromise the integrity, availability, or security of the website.</li>
            <li>You agree not to deploy automated scrapers, denial-of-service scripts, or abusive bot traffic against the service.</li>
          </ul>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              2. User Content & Local Processing
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">
            QuickTools processes your files, images, code, and input text locally in your browser. You retain complete ownership, copyright, and control over any data or content you process through the platform. Because files remain on your device, you are solely responsible for maintaining your own backups and verifying output results before use in mission-critical environments.
          </p>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              3. Disclaimer of Warranties
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm mb-3">
            QuickTools is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied, including but not limited to fitness for a particular purpose, non-infringement, or error-free execution.
          </p>
          <p className="text-text-secondary leading-relaxed text-sm">
            While we strive for precision and high utility across all calculations and conversions, we make no guarantee that outputs are completely free of bugs or inaccuracies. You assume total responsibility and risk for your use of the generated outputs.
          </p>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <Scale size={22} className="text-accent" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
              4. Limitation of Liability
            </h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">
            In no event shall QuickTools, its authors, or contributors be held liable for any direct, indirect, incidental, special, consequential, or exemplary damages (including loss of data, loss of profits, or business interruption) arising out of the use or inability to use the tools.
          </p>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <h3 className="font-heading font-bold text-lg uppercase tracking-wide mb-3">
            5. Changes to the Services and Terms
          </h3>
          <p className="text-text-secondary leading-relaxed text-sm">
            We reserve the right to modify, add, or discontinue tools or features at any time without prior notice. We may update these Terms periodically, and your continued use of the platform after updates signifies your acceptance of the revised Terms.
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
            href="/privacy"
            className="inline-flex items-center gap-2 px-4 py-2 neo-border rounded-lg bg-surface hover:bg-accent hover:text-white font-semibold text-sm transition-colors"
          >
            <Shield size={16} /> Privacy Policy &rarr;
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="neo-card p-8">
        <div className="flex items-center gap-3 mb-3">
          <Mail size={22} className="text-accent" />
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
            Contact & Legal Inquiries
          </h2>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          If you have questions or legal inquiries regarding these Terms of Service, please reach out to us at{" "}
          <a
            href="mailto:legal@quicktools.app"
            className="text-accent hover:underline font-semibold"
          >
            legal@quicktools.app
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
