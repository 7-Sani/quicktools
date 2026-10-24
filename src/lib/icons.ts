import * as LucideIcons from "lucide-react";
import React from "react";

export function getLucideIcon(iconName: string): React.ComponentType<{ size?: number; className?: string }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
  return icons[iconName] || LucideIcons.Wrench;
}
