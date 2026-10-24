import { Metadata } from "next";
import { Shield, Zap, Lock, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about QuickTools — the all-in-one platform for fast, simple, and private online tools.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4">
        About QuickTools
      </h1>

      <p className="text-lg text-text-secondary mb-8 max-w-2xl">
        QuickTools is an all-in-one online utility platform that provides fast,
        simple, and privacy-focused tools for everyday digital work.
      </p>

      {/* Mission */}
      <div className="neo-card p-8 mb-8">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">
          Our Mission
        </h2>
        <p className="text-text-secondary leading-relaxed">
          We believe that everyday digital tasks — compressing images, merging
          PDFs, formatting code, generating passwords — should be simple, fast,
          and private. You shouldn&apos;t need to install software, create
          accounts, or worry about your data. QuickTools gives you all the tools
          you need in one place.
        </p>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[
          {
            icon: Shield,
            title: "Privacy First",
            desc: "Most tools process everything in your browser. Your files never leave your device.",
          },
          {
            icon: Zap,
            title: "Speed",
            desc: "No uploads, no server queues. Client-side processing means instant results.",
          },
          {
            icon: Lock,
            title: "No Barriers",
            desc: "No signup, no login walls, no paywalls for core tools. Just open and use.",
          },
          {
            icon: Heart,
            title: "Quality",
            desc: "Every tool is designed to be simple, reliable, and do one thing well.",
          },
        ].map((item) => (
          <div key={item.title} className="neo-card p-6">
            <item.icon size={24} className="text-accent mb-3" />
            <h3 className="font-heading font-bold text-sm uppercase tracking-wide mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-text-secondary">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="neo-card p-8">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">
          Contact
        </h2>
        <p className="text-text-secondary">
          Have feedback, suggestions, or found a bug? We&apos;d love to hear from
          you. Reach out at{" "}
          <a
            href="mailto:hello@quicktools.app"
            className="text-accent hover:underline font-semibold"
          >
            hello@quicktools.app
          </a>
        </p>
      </div>
    </div>
  );
}
