import type { TFunction } from "i18next";

export function communityTitle(t: TFunction, slug: string, fallback: string): string {
  return t(`communities.${slug}.title`, { defaultValue: fallback });
}

export function communityDescription(t: TFunction, slug: string, fallback: string): string {
  return t(`communities.${slug}.description`, { defaultValue: fallback });
}
