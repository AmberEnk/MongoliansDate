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
  canDelete?: boolean;
  isUserCreated?: boolean;
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
  canDelete?: boolean;
};

export type ForumComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
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
