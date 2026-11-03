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
  joined?: boolean;
  joinedAt?: string;
};

export type ForumPost = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  communitySlug: string;
  communityTitle: string;
  authorId: string;
  authorName: string;
  score: number;
  commentCount: number;
  canEdit?: boolean;
  canDelete?: boolean;
};

export type ForumComment = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  parentId?: string | null;
  score?: number;
  myVote?: number;
  canEdit?: boolean;
  canDelete?: boolean;
  replies?: ForumComment[];
};

export type ProfileComment = {
  id: string;
  body: string;
  createdAt: string;
  postId: string;
  postTitle: string;
  score: number;
};

export type NameChange = {
  displayName: string;
  changedAt: string;
};

export type PublicProfile = {
  id: string;
  displayName: string;
  createdAt: string;
  karma: number;
  postCount: number;
  commentCount: number;
  followerCount: number;
  followingCount: number;
  following: boolean;
  nameHistory: NameChange[];
};

export type ForumNotification = {
  id: string;
  kind: string;
  createdAt: string;
  read: boolean;
  actorId: string | null;
  actorName: string;
  postId: string | null;
  postTitle: string;
};

export type DatingListing = {
  id: string;
  userId: string;
  displayName: string;
  city: string;
  age: number;
  intro: string;
  contact: string;
  contactHidden: boolean;
  isMine?: boolean;
  createdAt: string;
};

export type DmThreadSummary = {
  id: string;
  otherUserId: string;
  otherName: string;
  listingId: string | null;
  lastBody: string;
  updatedAt: string;
};

export type DmMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  mine: boolean;
};

export type DmThread = {
  id: string;
  otherUserId: string;
  otherName: string;
  listingId: string | null;
};
