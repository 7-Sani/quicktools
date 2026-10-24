export type CategoryId =
  | "image"
  | "pdf"
  | "text"
  | "developer"
  | "calculator"
  | "generator"
  | "audio"
  | "video"
  | "security"
  | "web"
  | "seo"
  | "design"
  | "data"
  | "datetime"
  | "finance"
  | "qr-barcode"
  | "typography"
  | "network"
  | "social"
  | "education"
  | "accessibility"
  | "ai";

export interface ToolMeta {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: CategoryId;
  icon: string;
  tags: string[];
  isPopular: boolean;
  isClientSide: boolean;
  acceptedFormats?: string[];
  maxFileSize?: string;
  relatedTools: string[];
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  color: string;
}
