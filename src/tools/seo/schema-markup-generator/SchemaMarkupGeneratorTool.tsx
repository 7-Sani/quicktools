"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Code,
  Copy,
  Check,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Shield,
  FileCode,
  Sparkles,
} from "lucide-react";

type SchemaType =
  | "Article"
  | "Organization"
  | "Product"
  | "FAQPage"
  | "HowTo"
  | "BreadcrumbList"
  | "Event"
  | "Person"
  | "WebSite";

export default function SchemaMarkupGeneratorTool() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Article");

  // Form states per schema type
  // Article
  const [articleHeadline, setArticleHeadline] = useState("How to Optimize Core Web Vitals for Better Search Rankings");
  const [articleDescription, setArticleDescription] = useState("A comprehensive technical guide to improving LCP, INP, and CLS performance metrics on modern websites.");
  const [articleAuthor, setArticleAuthor] = useState("Biplab Sarkar");
  const [articlePublisher, setArticlePublisher] = useState("QuickTools");
  const [articleDatePublished, setArticleDatePublished] = useState("2026-10-20");
  const [articleImage, setArticleImage] = useState("https://quicktools.app/images/core-web-vitals.jpg");

  // Organization
  const [orgName, setOrgName] = useState("QuickTools Inc.");
  const [orgUrl, setOrgUrl] = useState("https://quicktools.app");
  const [orgLogo, setOrgLogo] = useState("https://quicktools.app/logo.png");
  const [orgContactType, setOrgContactType] = useState("Customer Support");
  const [orgTelephone, setOrgTelephone] = useState("+1-800-555-0199");

  // Product
  const [prodName, setProdName] = useState("Noise Cancelling Wireless Headphones");
  const [prodDescription, setProdDescription] = useState("Premium high-fidelity audio with active noise cancellation and 40-hour battery life.");
  const [prodImage, setProdImage] = useState("https://example.com/headphones.jpg");
  const [prodBrand, setProdBrand] = useState("SoundPro");
  const [prodPrice, setProdPrice] = useState("199.99");
  const [prodCurrency, setProdCurrency] = useState("USD");
  const [prodAvailability, setProdAvailability] = useState("https://schema.org/InStock");
  const [prodRating, setProdRating] = useState("4.8");
  const [prodReviewCount, setProdReviewCount] = useState("254");

  // FAQPage
  const [faqItems, setFaqItems] = useState<{ q: string; a: string }[]>([
    {
      q: "What is schema markup and why is it important?",
      a: "Schema markup is microdata added to HTML to help search engines understand webpage content and display rich results (snippets).",
    },
    {
      q: "Is JSON-LD the recommended format by Google?",
      a: "Yes, Google officially recommends JSON-LD for implementing structured data markup whenever possible.",
    },
  ]);

  // HowTo
  const [howToName, setHowToName] = useState("How to Compress a Video File for Email");
  const [howToDescription, setHowToDescription] = useState("Step-by-step instructions to quickly reduce video file size using our free online video compressor.");
  const [howToSteps, setHowToSteps] = useState<{ title: string; text: string }[]>([
    { title: "Select your video file", text: "Upload your MP4, WebM, or MOV file into the browser tool." },
    { title: "Choose compression preset", text: "Select your desired balance between file size reduction and video quality." },
    { title: "Download compressed file", text: "Click Compress and save the optimized video directly to your computer." },
  ]);

  // Breadcrumb
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; url: string }[]>([
    { name: "Home", url: "https://quicktools.app" },
    { name: "SEO Tools", url: "https://quicktools.app/categories/seo" },
    { name: "Schema Generator", url: "https://quicktools.app/tools/schema-markup-generator" },
  ]);

  // Event
  const [eventName, setEventName] = useState("Global Web SEO Summit 2026");
  const [eventDate, setEventDate] = useState("2026-11-15T09:00:00+00:00");
  const [eventLocationName, setEventLocationName] = useState("Moscone Center");
  const [eventLocationAddress, setEventLocationAddress] = useState("747 Howard St, San Francisco, CA");
  const [eventPrice, setEventPrice] = useState("299");

  // Person
  const [personName, setPersonName] = useState("Alex Developer");
  const [personJobTitle, setPersonJobTitle] = useState("Principal Software Architect");
  const [personUrl, setPersonUrl] = useState("https://alexdev.example.com");

  // WebSite
  const [siteName, setSiteName] = useState("QuickTools");
  const [siteUrl, setSiteUrl] = useState("https://quicktools.app");
  const [searchUrlTemplate, setSearchUrlTemplate] = useState("https://quicktools.app/search?q={search_term_string}");

  // Live editable code editor state
  const [editableJson, setEditableJson] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Construct JSON-LD object dynamically based on active schema type
  const generatedObject = useMemo(() => {
    switch (schemaType) {
      case "Article":
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: articleHeadline,
          description: articleDescription,
          image: articleImage ? [articleImage] : undefined,
          datePublished: articleDatePublished,
          author: {
            "@type": "Person",
            name: articleAuthor,
          },
          publisher: {
            "@type": "Organization",
            name: articlePublisher,
          },
        };

      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: orgName,
          url: orgUrl,
          logo: orgLogo || undefined,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: orgTelephone,
            contactType: orgContactType,
          },
        };

      case "Product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          name: prodName,
          description: prodDescription,
          image: prodImage ? [prodImage] : undefined,
          brand: {
            "@type": "Brand",
            name: prodBrand,
          },
          offers: {
            "@type": "Offer",
            url: "https://example.com/product",
            priceCurrency: prodCurrency,
            price: prodPrice,
            availability: prodAvailability,
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: prodRating,
            reviewCount: prodReviewCount,
          },
        };

      case "FAQPage":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        };

      case "HowTo":
        return {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: howToName,
          description: howToDescription,
          step: howToSteps.map((step, idx) => ({
            "@type": "HowToStep",
            position: idx + 1,
            name: step.title,
            text: step.text,
          })),
        };

      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((bc, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: bc.name,
            item: bc.url,
          })),
        };

      case "Event":
        return {
          "@context": "https://schema.org",
          "@type": "Event",
          name: eventName,
          startDate: eventDate,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: eventLocationName,
            address: {
              "@type": "PostalAddress",
              streetAddress: eventLocationAddress,
            },
          },
          offers: {
            "@type": "Offer",
            price: eventPrice,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            validFrom: "2026-01-01T00:00:00+00:00",
          },
        };

      case "Person":
        return {
          "@context": "https://schema.org",
          "@type": "Person",
          name: personName,
          jobTitle: personJobTitle,
          url: personUrl,
        };

      case "WebSite":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: siteUrl,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: searchUrlTemplate,
            },
            "query-input": "required name=search_term_string",
          },
        };
    }
  }, [
    schemaType,
    articleHeadline,
    articleDescription,
    articleAuthor,
    articlePublisher,
    articleDatePublished,
    articleImage,
    orgName,
    orgUrl,
    orgLogo,
    orgTelephone,
    orgContactType,
    prodName,
    prodDescription,
    prodImage,
    prodBrand,
    prodPrice,
    prodCurrency,
    prodAvailability,
    prodRating,
    prodReviewCount,
    faqItems,
    howToName,
    howToDescription,
    howToSteps,
    breadcrumbs,
    eventName,
    eventDate,
    eventLocationName,
    eventLocationAddress,
    eventPrice,
    personName,
    personJobTitle,
    personUrl,
    siteName,
    siteUrl,
    searchUrlTemplate,
  ]);

  // Sync generated object into editable editor whenever form inputs or schema type changes
  useEffect(() => {
    setEditableJson(JSON.stringify(generatedObject, null, 2));
  }, [generatedObject]);

  // Validate JSON syntax in editor
  const validation = useMemo(() => {
    if (!editableJson.trim()) {
      return { isValid: false, error: "Empty JSON content." };
    }
    try {
      const parsed = JSON.parse(editableJson);
      if (typeof parsed !== "object" || parsed === null) {
        return { isValid: false, error: "JSON must be an object." };
      }
      if (!parsed["@context"]) {
        return { isValid: true, warning: 'Missing standard "@context": "https://schema.org".' };
      }
      if (!parsed["@type"]) {
        return { isValid: true, warning: 'Missing "@type" specification.' };
      }
      return { isValid: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid JSON syntax.";
      return { isValid: false, error: msg };
    }
  }, [editableJson]);

  // Full HTML script tag
  const fullScriptTag = useMemo(() => {
    return `<script type="application/ld+json">\n${editableJson}\n</script>`;
  }, [editableJson]);

  const handleCopyRawJson = () => {
    navigator.clipboard.writeText(editableJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyScriptTag = () => {
    navigator.clipboard.writeText(fullScriptTag);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([editableJson], { type: "application/json;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `schema-${schemaType.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer banner & Local Validation Notice */}
      <div className="p-3.5 neo-border rounded-lg bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-accent shrink-0" />
          <span>
            <strong>Local Validation Notice:</strong> Our in-browser validator checks JSON syntax and schema.org structure locally. It does not replace Google&apos;s live Rich Results Test.
          </span>
        </div>
        <a
          href="https://search.google.com/test/rich-results"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium text-accent inline-flex items-center gap-1 shrink-0"
        >
          <span>Google Rich Results Test</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Schema Type Selector */}
      <div className="neo-card p-4 space-y-2">
        <label className="font-heading font-bold text-xs uppercase text-text-secondary">
          Select Schema.org Type:
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "Article",
              "FAQPage",
              "Product",
              "Organization",
              "HowTo",
              "BreadcrumbList",
              "Event",
              "Person",
              "WebSite",
            ] as SchemaType[]
          ).map((type) => (
            <button
              key={type}
              onClick={() => setSchemaType(type)}
              className={`px-3 py-1.5 text-xs neo-border rounded font-heading font-bold uppercase transition-colors ${
                schemaType === type
                  ? "bg-accent text-white"
                  : "bg-surface hover:bg-accent/10"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left column: Dynamic Schema Form (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-4 space-y-3">
            <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
              <span>{schemaType} Properties</span>
              <span className="text-[11px] font-normal lowercase">auto-updates JSON</span>
            </div>

            {/* ARTICLE FORM */}
            {schemaType === "Article" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Headline</label>
                  <input
                    type="text"
                    value={articleHeadline}
                    onChange={(e) => setArticleHeadline(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Description</label>
                  <textarea
                    value={articleDescription}
                    onChange={(e) => setArticleDescription(e.target.value)}
                    rows={2}
                    className="w-full neo-input p-2 text-xs"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Author Name</label>
                    <input
                      type="text"
                      value={articleAuthor}
                      onChange={(e) => setArticleAuthor(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Publisher</label>
                    <input
                      type="text"
                      value={articlePublisher}
                      onChange={(e) => setArticlePublisher(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Date Published</label>
                    <input
                      type="date"
                      value={articleDatePublished}
                      onChange={(e) => setArticleDatePublished(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Featured Image URL</label>
                    <input
                      type="url"
                      value={articleImage}
                      onChange={(e) => setArticleImage(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FAQPAGE FORM */}
            {schemaType === "FAQPage" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-secondary">Questions &amp; Answers List</span>
                  <button
                    onClick={() => setFaqItems([...faqItems, { q: "New Question?", a: "Answer text here." }])}
                    className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Question
                  </button>
                </div>
                {faqItems.map((item, idx) => (
                  <div key={idx} className="p-3 neo-border rounded bg-surface space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono">Q#{idx + 1}</span>
                      {faqItems.length > 1 && (
                        <button
                          onClick={() => setFaqItems(faqItems.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => {
                        const copy = [...faqItems];
                        copy[idx].q = e.target.value;
                        setFaqItems(copy);
                      }}
                      placeholder="Question..."
                      className="w-full neo-input py-1 px-2 text-xs"
                    />
                    <textarea
                      value={item.a}
                      onChange={(e) => {
                        const copy = [...faqItems];
                        copy[idx].a = e.target.value;
                        setFaqItems(copy);
                      }}
                      rows={2}
                      placeholder="Answer..."
                      className="w-full neo-input p-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* PRODUCT FORM */}
            {schemaType === "Product" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Description</label>
                  <textarea
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    rows={2}
                    className="w-full neo-input p-2 text-xs"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Brand</label>
                    <input
                      type="text"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Price</label>
                    <input
                      type="text"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Currency</label>
                    <input
                      type="text"
                      value={prodCurrency}
                      onChange={(e) => setProdCurrency(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Rating (1–5)</label>
                    <input
                      type="text"
                      value={prodRating}
                      onChange={(e) => setProdRating(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Review Count</label>
                    <input
                      type="text"
                      value={prodReviewCount}
                      onChange={(e) => setProdReviewCount(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ORGANIZATION FORM */}
            {schemaType === "Organization" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Official Website URL</label>
                  <input
                    type="url"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Contact Type</label>
                    <input
                      type="text"
                      value={orgContactType}
                      onChange={(e) => setOrgContactType(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Telephone</label>
                    <input
                      type="text"
                      value={orgTelephone}
                      onChange={(e) => setOrgTelephone(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HOWTO FORM */}
            {schemaType === "HowTo" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Guide Name</label>
                  <input
                    type="text"
                    value={howToName}
                    onChange={(e) => setHowToName(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Description</label>
                  <textarea
                    value={howToDescription}
                    onChange={(e) => setHowToDescription(e.target.value)}
                    rows={2}
                    className="w-full neo-input p-2 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-secondary">Steps List</span>
                    <button
                      onClick={() => setHowToSteps([...howToSteps, { title: "Next step", text: "Instruction details." }])}
                      className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Step
                    </button>
                  </div>
                  {howToSteps.map((step, idx) => (
                    <div key={idx} className="p-3 neo-border rounded bg-surface space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono">Step #{idx + 1}</span>
                        {howToSteps.length > 1 && (
                          <button
                            onClick={() => setHowToSteps(howToSteps.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const copy = [...howToSteps];
                          copy[idx].title = e.target.value;
                          setHowToSteps(copy);
                        }}
                        placeholder="Step title..."
                        className="w-full neo-input py-1 px-2 text-xs"
                      />
                      <input
                        type="text"
                        value={step.text}
                        onChange={(e) => {
                          const copy = [...howToSteps];
                          copy[idx].text = e.target.value;
                          setHowToSteps(copy);
                        }}
                        placeholder="Step description..."
                        className="w-full neo-input py-1 px-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BREADCRUMBLIST FORM */}
            {schemaType === "BreadcrumbList" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-secondary">Breadcrumb Hierarchy</span>
                  <button
                    onClick={() => setBreadcrumbs([...breadcrumbs, { name: "Subpage", url: "https://example.com/sub" }])}
                    className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Level
                  </button>
                </div>
                {breadcrumbs.map((bc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-text-secondary w-6 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={bc.name}
                      onChange={(e) => {
                        const copy = [...breadcrumbs];
                        copy[idx].name = e.target.value;
                        setBreadcrumbs(copy);
                      }}
                      placeholder="Title"
                      className="w-1/3 neo-input py-1 px-2 text-xs"
                    />
                    <input
                      type="url"
                      value={bc.url}
                      onChange={(e) => {
                        const copy = [...breadcrumbs];
                        copy[idx].url = e.target.value;
                        setBreadcrumbs(copy);
                      }}
                      placeholder="URL"
                      className="flex-1 neo-input py-1 px-2 text-xs font-mono"
                    />
                    {breadcrumbs.length > 1 && (
                      <button
                        onClick={() => setBreadcrumbs(breadcrumbs.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* EVENT, PERSON, WEBSITE forms */}
            {schemaType === "Event" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Event Name</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Date &amp; Time (ISO)</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs font-mono"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Venue Name</label>
                    <input
                      type="text"
                      value={eventLocationName}
                      onChange={(e) => setEventLocationName(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-heading font-bold uppercase block mb-1">Ticket Price ($)</label>
                    <input
                      type="text"
                      value={eventPrice}
                      onChange={(e) => setEventPrice(e.target.value)}
                      className="w-full neo-input py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Venue Address</label>
                  <input
                    type="text"
                    value={eventLocationAddress}
                    onChange={(e) => setEventLocationAddress(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
              </div>
            )}

            {schemaType === "Person" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={personJobTitle}
                    onChange={(e) => setPersonJobTitle(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Website / Profile URL</label>
                  <input
                    type="url"
                    value={personUrl}
                    onChange={(e) => setPersonUrl(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {schemaType === "WebSite" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Website Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Website URL</label>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-heading font-bold uppercase block mb-1">Sitelinks Searchbox URL Template</label>
                  <input
                    type="text"
                    value={searchUrlTemplate}
                    onChange={(e) => setSearchUrlTemplate(e.target.value)}
                    className="w-full neo-input py-1.5 px-2.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive Code Editor & Syntax Validator (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-4 space-y-3">
            {/* Syntax Status Bar */}
            <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
              <div className="flex items-center gap-2">
                <FileCode size={15} className="text-accent" />
                <span className="font-heading font-bold uppercase text-xs">
                  JSON-LD Editor &amp; Syntax Status
                </span>
              </div>

              {validation.isValid ? (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Valid JSON Syntax
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
                  <AlertTriangle size={13} /> Syntax Error
                </span>
              )}
            </div>

            {/* Error or warning banner if any */}
            {validation.error && (
              <div className="p-2.5 neo-border rounded bg-red-500/10 text-red-600 text-xs">
                <strong>Parse Error:</strong> {validation.error}
              </div>
            )}
            {validation.warning && (
              <div className="p-2.5 neo-border rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                <strong>Notice:</strong> {validation.warning}
              </div>
            )}

            {/* Editable JSON-LD Textarea */}
            <textarea
              value={editableJson}
              onChange={(e) => setEditableJson(e.target.value)}
              rows={14}
              className="w-full neo-input p-3 font-mono text-xs leading-relaxed resize-y bg-surface text-text"
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyRawJson}
                  className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy JSON"}
                </button>
                <button
                  onClick={handleCopyScriptTag}
                  className="px-2.5 py-1 text-xs neo-border rounded bg-accent text-white hover:bg-accent/90 font-medium flex items-center gap-1"
                >
                  {copiedScript ? <Check size={12} /> : <Code size={12} />}
                  {copiedScript ? "Copied &lt;script&gt;" : "Copy &lt;script&gt; Tag"}
                </button>
              </div>

              <button
                onClick={handleDownloadJson}
                className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
              >
                <Download size={12} />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
