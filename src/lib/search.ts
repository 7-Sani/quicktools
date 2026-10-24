import Fuse from "fuse.js";
import { TOOLS } from "@/config/tools";
import { ToolMeta } from "@/types/tool";

const fuse = new Fuse(TOOLS, {
  keys: [
    { name: "name", weight: 0.4 },
    { name: "description", weight: 0.2 },
    { name: "tags", weight: 0.3 },
    { name: "category", weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
});

export function searchTools(query: string): ToolMeta[] {
  if (!query.trim()) return [];
  const results = fuse.search(query);
  return results.map((r) => r.item);
}
