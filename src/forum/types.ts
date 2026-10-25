export type ForumUser = {
  id: string;
  email: string;
  displayName: string;
  isSuperAdmin?: boolean;
};

export type Community = {
  slug: string;
  title: string;
  description: string;
  kind: string;
  postCount?: number;
  createdAt?: string | null;
  canEdit?: boolean;
  editableUntil?: string | null;
};

export type ForumPost = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  communitySlug: string;
  communityTitle: string;
  authorName: string;
  authorId?: string;
  score: number;
  commentCount: number;
  canEdit?: boolean;
  editableUntil?: string | null;
};

export type ForumComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
};

export type DatingListing = {
  id: string;
  displayName: string;
  city: string;
  age: number;
  intro: string;
  contact: string;
  contactHidden: boolean;
  createdAt: string;
};
