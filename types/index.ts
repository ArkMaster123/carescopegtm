export interface BusinessProfile {
  name: string;
  description: string;
  targetCustomer: string;
  industry: string;
  keywords: string[];
  tone: string;
  images?: string[];
  location?: string; // Added location
}

export type Platform = 'instagram' | 'tiktok' | 'youtube';

export interface Influencer {
  id: string;
  username: string;
  platform: Platform;
  displayName: string;
  bio: string;
  profileImageUrl: string;
  followerCount: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  postFrequency: string; // e.g., "daily", "weekly"
  contentCategories: string[];
  recentGrowth: number; // % in last 30 days
  matchScore: number; // 0-100
  matchReason: string;
}
