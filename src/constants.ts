export const SPONSORSHIP_STANCES = [
  "can_sponsor",
  "open_to_discuss",
  "varies",
  "not_applicable",
  "prefer_not_say",
] as const;

export type SponsorshipStance = (typeof SPONSORSHIP_STANCES)[number];

export const LA_METRO_DEFAULT = {
  lat: 34.052235,
  lng: -118.243683,
  label: "Los Angeles metro",
} as const;
