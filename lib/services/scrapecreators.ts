import { Influencer, Platform } from '@/types';

const API_BASE = 'https://api.scrapecreators.com/v1';

// --- Types for TikTok Search Top API ---

interface TikTokAuthor {
  uid: string;
  unique_id: string;
  nickname: string;
  signature: string;
  avatar_larger: {
    url_list: string[];
  };
  follower_count: number;
  total_favorited: number;
  video_count?: number;
}

interface TikTokStatistics {
  digg_count: number;
  comment_count: number;
  share_count: number;
  play_count: number;
}

interface TikTokItem {
  id: string;
  desc: string;
  create_time: string;
  region: string;
  statistics: TikTokStatistics;
  author: TikTokAuthor;
  video: {
    cover: {
      url_list: string[];
    };
    duration: number;
  };
}

interface TikTokSearchResponse {
  success: boolean;
  items: TikTokItem[];
  cursor?: number;
}

interface TikTokSearchOptions {
  publish_time?: 'yesterday' | 'this-week' | 'this-month' | 'last-3-months' | 'last-6-months' | 'all-time';
  sort_by?: 'relevance' | 'most-liked' | 'date-posted';
  region?: string;
  cursor?: number;
}

// --- Existing Profile Enrichment ---

export async function getInfluencerDetails(handle: string, platform: Platform): Promise<Partial<Influencer> | null> {
  const apiKey = process.env.SCRAPE_CREATORS_API_KEY;
  
  if (!apiKey) {
    console.error('Missing ScrapeCreators API Key');
    return null;
  }

  try {
    // Normalize handle (remove @ for API call if needed, but usually APIs expect it or handle it)
    // ScrapeCreators docs show `handle=iamsydneythomas` (no @) for TikTok
    const cleanHandle = handle.replace('@', '');
    
    const url = `${API_BASE}/${platform}/profile?handle=${cleanHandle}`;
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      console.error(`ScrapeCreators Error (${platform}): ${response.status} for ${handle}`);
      return null;
    }

    const data = await response.json();
    
    // Map response to Influencer interface
    // Note: Response structure varies by platform, need to adapt based on actual response
    // This is a best-effort mapping based on typical fields.
    
    let influencer: Partial<Influencer> = {
      username: handle,
      platform,
      matchScore: 0, 
      matchReason: '',
    };

    if (platform === 'instagram') {
      // Instagram mapping based on typical ScrapeCreators response
      influencer = {
        ...influencer,
        displayName: data.full_name || data.username,
        bio: data.biography,
        profileImageUrl: data.profile_pic_url,
        followerCount: data.follower_count,
        engagementRate: 0, // Requires posts analysis not available in basic profile
        avgLikes: 0,
        recentGrowth: 0, 
      };
    } else if (platform === 'tiktok') {
      // TikTok mapping
      influencer = {
        ...influencer,
        displayName: data.nickname || data.unique_id,
        bio: data.signature,
        profileImageUrl: data.avatar_larger,
        followerCount: data.follower_count,
        engagementRate: 0,
        avgLikes: data.total_favorited, 
      };
    } else if (platform === 'youtube') {
      // YouTube mapping (uses /v1/youtube/channel)
      influencer = {
        ...influencer,
        displayName: data.title,
        bio: data.description,
        profileImageUrl: data.avatar?.[0]?.url || data.thumbnails?.default?.url,
        followerCount: parseSubscribers(data.subscriber_count_text || data.stats?.subscriberCount),
        engagementRate: 0,
      };
    }

    return influencer;
  } catch (error) {
    console.error('ScrapeCreators Exception:', error);
    return null;
  }
}

// --- New TikTok Search Function ---

export async function searchTikTokTop(
  query: string, 
  options: TikTokSearchOptions = {}
): Promise<Influencer[]> {
  const apiKey = process.env.SCRAPE_CREATORS_API_KEY;

  if (!apiKey) {
    console.error('Missing ScrapeCreators API Key');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: query,
    });

    if (options.publish_time) params.append('publish_time', options.publish_time);
    if (options.sort_by) params.append('sort_by', options.sort_by);
    if (options.region) params.append('region', options.region);
    if (options.cursor) params.append('cursor', options.cursor.toString());

    const url = `${API_BASE}/tiktok/search/top?${params.toString()}`;
    
    console.log(`🔍 Searching TikTok Top: ${query} (Region: ${options.region || 'Global'}) URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ScrapeCreators TikTok Search Error: ${response.status} - ${errorText}`);
      return [];
    }

    const data: TikTokSearchResponse = await response.json();

    if (!data.success || !data.items) {
      return [];
    }

    // Map Items to Influencer objects
    const influencers: Influencer[] = data.items.map(item => {
      const author = item.author;
      
      return {
        id: author.unique_id, // Use handle as ID
        username: author.unique_id,
        platform: 'tiktok',
        displayName: author.nickname,
        bio: author.signature,
        profileImageUrl: author.avatar_larger?.url_list?.[0] || '',
        followerCount: author.follower_count,
        engagementRate: 0, 
        avgLikes: author.total_favorited, 
        avgComments: 0,
        postFrequency: 'unknown',
        postCount: author.video_count || 0,
        contentCategories: [], 
        recentGrowth: 0,
        matchScore: 0, 
        matchReason: `Found via video: "${item.desc.substring(0, 50)}..."`,
      };
    });

    // Dedup by username
    const uniqueInfluencers = Array.from(
      new Map(influencers.map(inf => [inf.username, inf])).values()
    );

    return uniqueInfluencers;

  } catch (error) {
    console.error('TikTok Search Exception:', error);
    return [];
  }
}

interface TikTokProfileVideosOptions {
  sort_by?: 'latest' | 'popular';
  user_id?: string;
  amount?: number;
  trim?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getTikTokProfileVideos(
  handle: string, 
  options: TikTokProfileVideosOptions = {}
): Promise<any[]> {
/* eslint-enable @typescript-eslint/no-explicit-any */
  const apiKey = process.env.SCRAPE_CREATORS_API_KEY;

  if (!apiKey) {
    console.error('Missing ScrapeCreators API Key');
    return [];
  }

  try {
    const params = new URLSearchParams({
      handle: handle.replace('@', ''),
      amount: (options.amount || 20).toString(),
    });

    if (options.sort_by) params.append('sort_by', options.sort_by);
    if (options.user_id) params.append('user_id', options.user_id);
    if (options.trim) params.append('trim', 'true');

    const url = `${API_BASE}/v3/tiktok/profile-videos?${params.toString()}`;
    console.log(`🔍 Fetching TikTok Videos: ${handle} URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ScrapeCreators TikTok Videos Error: ${response.status} - ${errorText}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('TikTok Profile Videos Exception:', error);
    return [];
  }
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
function calculateEngagement(posts: any[], followers: number): number {
  if (!followers || followers === 0 || !posts || posts.length === 0) return 0;
  const totalInteractions = posts.slice(0, 10).reduce((acc, post) => {
    const node = post.node || post;
    return acc + (node.edge_liked_by?.count || 0) + (node.edge_media_to_comment?.count || 0);
  }, 0);
  return ((totalInteractions / posts.slice(0, 10).length) / followers) * 100;
}

function calculateAvgLikes(posts: any[]): number {
  if (!posts || posts.length === 0) return 0;
  const totalLikes = posts.slice(0, 10).reduce((acc, post) => {
    return acc + (post.node?.edge_liked_by?.count || 0);
  }, 0);
  return Math.round(totalLikes / posts.slice(0, 10).length);
}
/* eslint-enable @typescript-eslint/no-unused-vars */
/* eslint-enable @typescript-eslint/no-explicit-any */

function parseSubscribers(count: string | number): number {
  if (typeof count === 'number') return count;
  if (!count) return 0;
  // Handle "1.2M", "100K" etc if needed, or basic parsing
  return parseInt(count.replace(/,/g, '')) || 0;
}
